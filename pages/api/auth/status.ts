import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // In a real application, you would verify the JWT token here
  // For demo purposes, we'll check localStorage data (which would come in headers)
  
  try {
    // This is a simple status check endpoint
    // In a real app, you'd validate JWT tokens and check database
    res.status(200).json({
      message: 'Auth status endpoint is working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
} 