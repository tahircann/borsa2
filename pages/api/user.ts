import { NextApiRequest, NextApiResponse } from 'next';
import { getUserByEmail } from '../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user info (without password)
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        membershipType: user.membershipType,
        membershipExpiry: user.membershipExpiry?.toISOString() || null,
        isAdmin: user.isAdmin,
        isPremium: user.membershipType === 'premium' && (!user.membershipExpiry || user.membershipExpiry > new Date()),
        createdAt: user.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
