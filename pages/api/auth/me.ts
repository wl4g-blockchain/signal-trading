import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Mock user data based on token
    const user = {
      id: decoded.userId,
      name: 'John Developer',
      email: decoded.email,
      avatar: 'https://github.com/johndoe.png',
      provider: 'github'
    };

    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}