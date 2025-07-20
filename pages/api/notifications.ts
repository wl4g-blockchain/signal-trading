import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 模拟通知数据
    const notifications = [
      {
        id: 'notif-1',
        type: 'Transaction',
        level: 'success',
        title: '交易成功',
        message: 'ETH/USDC 套利交易成功完成，收益 +$125.50',
        timestamp: new Date('2024-01-16T10:05:00Z').toISOString(),
        read: false,
        workflowId: 'workflow-1',
        workflowRunId: 'run-1',
        relatedData: {
          workflowName: 'ETH Arbitrage Strategy',
          profit: 125.5,
          txHash: '0xabc123...',
        },
      },
      {
        id: 'notif-2',
        type: 'Transaction',
        level: 'warning',
        title: '滑点警告',
        message: 'BTC/USDT 交易滑点较高 (2.5%)，建议调整策略',
        timestamp: new Date('2024-01-16T09:30:00Z').toISOString(),
        read: false,
        workflowId: 'workflow-1',
        workflowRunId: 'run-2',
        relatedData: {
          workflowName: 'BTC Trading Strategy',
          slippage: 2.5,
        },
      },
      {
        id: 'notif-3',
        type: 'System',
        level: 'info',
        title: '策略启动',
        message: '套利策略 "Arbitrage ETH/USDC" 已成功启动',
        timestamp: new Date('2024-01-16T08:00:00Z').toISOString(),
        read: true,
        workflowId: 'workflow-1',
        relatedData: {
          workflowName: 'ETH Arbitrage Strategy',
        },
      },
      {
        id: 'notif-4',
        type: 'Transaction',
        level: 'error',
        title: '交易失败',
        message: '由于流动性不足，SOL/USDC 交易执行失败',
        timestamp: new Date('2024-01-15T16:45:00Z').toISOString(),
        read: true,
        workflowId: 'workflow-1',
        workflowRunId: 'run-2',
        relatedData: {
          workflowName: 'SOL Trading Strategy',
          error: 'Insufficient liquidity',
        },
      },
    ];
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
} 