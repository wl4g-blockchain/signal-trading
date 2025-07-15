import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { provider, credentials } = req.body;

    if (provider === 'github') {
      // Mock GitHub OAuth flow
      const mockUser = {
        id: 'user-github-123',
        name: 'John Developer',
        email: 'john@example.com',
        avatar: 'https://github.com/johndoe.png',
        provider: 'github'
      };

      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        token,
        user: mockUser
      });
    } else {
      res.status(400).json({ error: 'Unsupported provider' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}