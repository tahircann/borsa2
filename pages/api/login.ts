import { NextApiRequest, NextApiResponse } from 'next';
import { getUserByEmail } from '../../lib/database';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    // Get user from database
    const user = await getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password (simple hash comparison - in production, use bcrypt)
    const password_hash = crypto.createHash('sha256').update(password).digest('hex');
    
    if (user.password_hash !== password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User logged in successfully:', { email, username: user.username });
    
    // Return user info (without password)
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        membershipType: user.membershipType,
        isAdmin: user.isAdmin,
        isPremium: user.membershipType === 'premium' && (!user.membershipExpiry || user.membershipExpiry > new Date())
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
