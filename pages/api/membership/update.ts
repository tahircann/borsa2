import { NextApiRequest, NextApiResponse } from 'next';
import { getUserByEmail, updateUserMembership, createUser } from '../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, membershipType, action, gumroadData } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      // Check if user exists in database
      let user = await getUserByEmail(email);
      
      if (!user && action === 'grant') {
        // Create new user if they don't exist (from Gumroad purchase)
        const newUser = {
          id: crypto.randomUUID(),
          email,
          username: email.split('@')[0], // Use email prefix as username
          password_hash: '', // No password for Gumroad users
          isAdmin: false,
          membershipType: 'free' as const,
          createdAt: new Date(),
          gumroadSubscription: gumroadData
        };
        
        await createUser(newUser);
        user = await getUserByEmail(email);
        console.log(`👤 Created new user from Gumroad purchase: ${email}`);
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

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
        
        // Update user in database
        const success = await updateUserMembership(user.id, 'premium', expiry);
        
        if (success) {
          console.log(`✅ Granted premium membership to ${email} until ${expiry.toLocaleDateString()}`);
          
          return res.status(200).json({ 
            success: true, 
            message: 'Premium membership granted',
            expiry: expiry.toISOString()
          });
        } else {
          throw new Error('Failed to update user membership in database');
        }
        
      } else if (action === 'revoke') {
        // Revoke premium membership
        const success = await updateUserMembership(user.id, 'free');
        
        if (success) {
          console.log(`❌ Revoked premium membership for ${email}`);
          
          return res.status(200).json({ 
            success: true, 
            message: 'Premium membership revoked'
          });
        } else {
          throw new Error('Failed to revoke user membership in database');
        }
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
    
    try {
      const user = await getUserByEmail(email);
      
      if (!user) {
        return res.status(200).json({
          email,
          membershipType: 'free',
          expiry: null,
          isActive: false
        });
      }
      
      // Check if membership expired
      const isActive = user.membershipType === 'premium' && 
                      (!user.membershipExpiry || user.membershipExpiry > new Date());
      
      return res.status(200).json({
        email,
        membershipType: user.membershipType,
        expiry: user.membershipExpiry?.toISOString() || null,
        isActive
      });
    } catch (error) {
      console.error('Get membership error:', error);
      return res.status(500).json({ error: 'Failed to get membership data' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
