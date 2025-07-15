import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = 50, offset = 0, status, workflowId } = req.query;

    // Mock trade history data
    const trades = generateMockTrades(Number(limit), Number(offset), status as string, workflowId as string);

    res.status(200).json({
      trades,
      total: 1000, // Mock total count
      hasMore: Number(offset) + Number(limit) < 1000,
    });
  } catch (error) {
    console.error('Error fetching trade history:', error);
    res.status(500).json({ error: 'Failed to fetch trade history' });
  }
}

function generateMockTrades(limit: number, offset: number, status?: string, workflowId?: string) {
  const trades = [];
  const strategies = ['Arbitrage ETH/USDC', 'Momentum BTC/ETH', 'Mean Reversion UNI/USDT'];
  const pairs = ['ETH/USDC', 'BTC/ETH', 'UNI/USDT', 'LINK/ETH'];
  const statuses = ['success', 'failed', 'pending'];

  for (let i = 0; i < limit; i++) {
    const tradeStatus = status || statuses[Math.floor(Math.random() * statuses.length)];
    const profit = tradeStatus === 'success' ? 
      Math.random() * 100 + 10 : 
      tradeStatus === 'failed' ? -(Math.random() * 50 + 5) : 0;

    trades.push({
      id: `trade-${offset + i + 1}`,
      workflowId: workflowId || `workflow-${Math.floor(Math.random() * 5) + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      strategy: strategies[Math.floor(Math.random() * strategies.length)],
      pair: pairs[Math.floor(Math.random() * pairs.length)],
      amount: Math.random() * 1000 + 100,
      entryPrice: 2000 + Math.random() * 1000,
      exitPrice: tradeStatus === 'success' || tradeStatus === 'failed' ? 
        2000 + Math.random() * 1000 : undefined,
      slippage: Math.random() * 2,
      profit,
      status: tradeStatus,
      txHash: `0x${Math.random().toString(16).substr(2, 8)}...`,
    });
  }

  return trades;
}