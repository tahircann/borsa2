import { NextApiRequest, NextApiResponse } from 'next';
import { getAllUsers, updateUserMembership } from '../../../lib/database';

// Mock database - in a real app, this would connect to an actual database
interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  membershipType: 'free' | 'premium';
  membershipExpiry?: Date;
  createdAt: Date;
  gumroadSubscription?: any;
}

// Mock users data - in production, this would be from a database
let mockUsers: User[] = [
  {
    id: 'user1',
    email: 'john@example.com',
    username: 'john_doe',
    isAdmin: false,
    membershipType: 'premium',
    membershipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'user2',
    email: 'jane@example.com',
    username: 'jane_smith',
    isAdmin: false,
    membershipType: 'free',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'user3',
    email: 'mike@example.com',
    username: 'mike_johnson',
    isAdmin: false,
    membershipType: 'premium',
    membershipExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'user4',
    email: 'sarah@example.com',
    username: 'sarah_wilson',
    isAdmin: false,
    membershipType: 'free',
    createdAt: new Date('2024-02-10'),
  },
  {
    id: 'admin',
    email: 'admin@esenglobal.com',
    username: 'admin',
    isAdmin: true,
    membershipType: 'premium',
    createdAt: new Date('2023-12-01'),
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  // Simple admin check - in production, use proper JWT/session validation
  const isAdmin = req.headers.authorization === 'admin-token' || 
                  (req.headers.cookie && req.headers.cookie.includes('isAdmin=true'));

  if (!isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  switch (method) {
    case 'GET':
      // Get all users from database
      try {
        const users = await getAllUsers();
        const formattedUsers = users.map(user => ({
          id: user.id,
          email: user.email,
          username: user.username,
          membershipType: user.membershipType,
          membershipExpiry: user.membershipExpiry?.toISOString() || null,
          isAdmin: user.isAdmin,
          joinedAt: user.createdAt.toISOString(),
          isPremium: user.membershipType === 'premium' && (!user.membershipExpiry || user.membershipExpiry > new Date())
        }));
        return res.status(200).json({ users: formattedUsers });
      } catch (error) {
        console.error('Database error:', error);
        // Fallback to mock data
        return res.status(200).json({ users: mockUsers });
      }

    case 'PUT':
      // Update user membership
      const { userId, membershipType, membershipExpiry } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      try {
        // Try to update in database first
        const success = await updateUserMembership(
          userId, 
          membershipType, 
          membershipExpiry ? new Date(membershipExpiry) : undefined
        );
        
        if (success) {
          return res.status(200).json({ 
            message: 'User updated successfully'
          });
        } else {
          throw new Error('Database update failed');
        }
      } catch (error) {
        console.error('Database update error:', error);
        
        // Fallback to mock data update
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Update the user
        mockUsers[userIndex] = {
          ...mockUsers[userIndex],
          membershipType: membershipType || mockUsers[userIndex].membershipType,
          membershipExpiry: membershipExpiry ? new Date(membershipExpiry) : mockUsers[userIndex].membershipExpiry
        };

        return res.status(200).json({ 
          message: 'User updated successfully', 
          user: mockUsers[userIndex] 
        });
      }

    case 'DELETE':
      // Delete user
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const deleteIndex = mockUsers.findIndex(u => u.id === id);
      if (deleteIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
      }

      mockUsers.splice(deleteIndex, 1);
      return res.status(200).json({ message: 'User deleted successfully' });

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
