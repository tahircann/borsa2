import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, membershipType, isAdmin } = req.body;

  // Simple admin check - in production, use proper JWT/session validation
  const isAdminRequest = req.headers.authorization === 'admin-token' || 
                        (req.headers.cookie && req.headers.cookie.includes('isAdmin=true'));

  if (!isAdminRequest) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!userId || !membershipType) {
    return res.status(400).json({ error: 'userId and membershipType are required' });
  }

  try {
    // In a real app, this would update the database
    // For now, we'll simulate the update
    
    let membershipExpiry;
    if (membershipType === 'premium') {
      // Set expiry to 30 days from now for premium
      membershipExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    // Simulate database update
    console.log(`Updating user ${userId} membership to ${membershipType}`);
    
    return res.status(200).json({ 
      success: true,
      message: 'Membership updated successfully',
      data: {
        userId,
        membershipType,
        membershipExpiry
      }
    });

  } catch (error) {
    console.error('Error updating membership:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
