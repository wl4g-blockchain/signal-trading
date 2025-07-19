import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 这里应该更新数据库中所有通知的状态
    // 目前只是模拟操作
    console.log('Marking all notifications as read');
    
    res.status(200).json({ 
      success: true, 
      message: 'All notifications marked as read' 
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
} 