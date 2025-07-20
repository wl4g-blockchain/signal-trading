import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    // 这里应该更新数据库中的通知状态
    // 目前只是模拟操作
    console.debug(`Marking notification ${id} as read`);
    
    res.status(200).json({ 
      success: true, 
      message: `Notification ${id} marked as read` 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
} 