import { NextApiRequest, NextApiResponse } from 'next';
import { updateUserMembership } from '../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, membershipType, duration, isAdmin } = req.body;

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
    let membershipExpiry;
    if (membershipType === 'premium') {
      // Calculate expiry based on duration
      const now = new Date();
      membershipExpiry = new Date(now);
      
      if (duration === 'yearly') {
        membershipExpiry.setFullYear(membershipExpiry.getFullYear() + 1);
      } else {
        // Default to monthly if duration not specified or is 'monthly'
        membershipExpiry.setMonth(membershipExpiry.getMonth() + 1);
      }
    }

    // Update in database
    const success = await updateUserMembership(userId, membershipType, membershipExpiry);
    
    if (success) {
      console.log(`✅ Updated user ${userId} membership to ${membershipType} (${duration || 'monthly'}) in database`);
      return res.status(200).json({ 
        success: true,
        message: 'Membership updated successfully',
        data: {
          userId,
          membershipType,
          duration: duration || 'monthly',
          membershipExpiry
        }
      });
    } else {
      throw new Error('Database update failed');
    }

  } catch (error) {
    console.error('Error updating membership:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
