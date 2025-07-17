import { NextApiRequest, NextApiResponse } from 'next';
import { createUser, getUserByEmail } from '../../lib/database';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create simple hash for password (in production, use bcrypt)
    const password_hash = crypto.createHash('sha256').update(password).digest('hex');

    // Create new user
    const newUser = {
      id: crypto.randomUUID(),
      email,
      username,
      password_hash,
      isAdmin: false,
      membershipType: 'free' as const,
      createdAt: new Date()
    };

    const success = await createUser(newUser);
    
    if (success) {
      console.log('User registered successfully:', { email, username });
      return res.status(201).json({ 
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          membershipType: newUser.membershipType
        }
      });
    } else {
      throw new Error('Failed to create user');
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
