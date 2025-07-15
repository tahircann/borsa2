import { NextApiRequest, NextApiResponse } from 'next';

// Simple in-memory storage for membership data (in production, use a database)
let membershipData: { [email: string]: { type: 'free' | 'premium', expiry?: string, gumroadData?: any } } = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, membershipType, action, gumroadData } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      if (action === 'grant') {
        // Grant premium membership
        const now = new Date();
        const expiry = new Date(now);
        
        if (membershipType === 'monthly') {
          expiry.setMonth(expiry.getMonth() + 1);
        } else if (membershipType === 'yearly') {
          expiry.setFullYear(expiry.getFullYear() + 1);
        } else {
          // Default to monthly if not specified
          expiry.setMonth(expiry.getMonth() + 1);
        }
        
        membershipData[email] = {
          type: 'premium',
          expiry: expiry.toISOString(),
          gumroadData
        };
        
        console.log(`✅ Granted premium membership to ${email} until ${expiry.toLocaleDateString()}`);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Premium membership granted',
          expiry: expiry.toISOString()
        });
        
      } else if (action === 'revoke') {
        // Revoke premium membership
        membershipData[email] = {
          type: 'free'
        };
        
        console.log(`❌ Revoked premium membership for ${email}`);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Premium membership revoked'
        });
      }
      
      return res.status(400).json({ error: 'Invalid action' });
      
    } catch (error) {
      console.error('Membership update error:', error);
      return res.status(500).json({ 
        error: 'Failed to update membership',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  if (req.method === 'GET') {
    const { email } = req.query;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const membership = membershipData[email] || { type: 'free' };
    
    // Check if membership expired
    if (membership.type === 'premium' && membership.expiry) {
      const now = new Date();
      const expiryDate = new Date(membership.expiry);
      if (now > expiryDate) {
        membership.type = 'free';
        membershipData[email] = membership;
      }
    }
    
    return res.status(200).json({
      email,
      membershipType: membership.type,
      expiry: membership.expiry,
      isActive: membership.type === 'premium'
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
