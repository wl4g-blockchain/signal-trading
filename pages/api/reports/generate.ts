import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { workflowId, startDate, endDate } = req.body;

    // Validate inputs
    if (!workflowId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const report = await generateReport(workflowId, new Date(startDate), new Date(endDate));

    res.status(200).json(report);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
}

async function generateReport(workflowId: string, startDate: Date, endDate: Date) {
  // Mock report generation
  const trades = generateReportTrades(workflowId, startDate, endDate);
  
  const totalTrades = trades.length;
  const successfulTrades = trades.filter(t => t.status === 'success').length;
  const totalProfit = trades.reduce((sum, trade) => sum + trade.profit, 0);
  const totalVolume = trades.reduce((sum, trade) => sum + trade.amount, 0);
  
  const profits = trades.map(t => t.profit);
  const averageReturn = totalProfit / totalVolume;
  const volatility = calculateVolatility(profits);
  const sharpeRatio = volatility > 0 ? (averageReturn / volatility) * Math.sqrt(252) : 0;
  
  // Calculate max drawdown
  let peak = 0;
  let maxDrawdown = 0;
  let runningTotal = 0;
  
  for (const trade of trades) {
    runningTotal += trade.profit;
    if (runningTotal > peak) {
      peak = runningTotal;
    }
    const drawdown = peak - runningTotal;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return {
    id: `report-${Date.now()}`,
    workflowId,
    period: { start: startDate, end: endDate },
    totalTrades,
    successfulTrades,
    totalProfit: Math.round(totalProfit * 100) / 100,
    totalVolume: Math.round(totalVolume * 100) / 100,
    averageArbitrageRate: Math.round((totalProfit / totalVolume) * 10000) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    successRate: Math.round((successfulTrades / totalTrades) * 10000) / 100,
    averageProfitPerTrade: Math.round((totalProfit / totalTrades) * 100) / 100,
    trades: trades.slice(0, 100), // Limit to 100 recent trades
  };
}

function generateReportTrades(workflowId: string, startDate: Date, endDate: Date) {
  const trades = [];
  const duration = endDate.getTime() - startDate.getTime();
  const tradeCount = Math.floor(duration / (1000 * 60 * 60 * 4)) + Math.floor(Math.random() * 50); // ~6 trades per day
  
  for (let i = 0; i < tradeCount; i++) {
    const timestamp = new Date(startDate.getTime() + Math.random() * duration);
    const isSuccess = Math.random() > 0.15; // 85% success rate
    
    trades.push({
      id: `trade-${i + 1}`,
      workflowId,
      timestamp,
      strategy: 'Arbitrage ETH/USDC',
      pair: 'ETH/USDC',
      amount: Math.random() * 1000 + 100,
      entryPrice: 2400 + Math.random() * 200,
      exitPrice: isSuccess ? 2400 + Math.random() * 200 : undefined,
      slippage: Math.random() * 2,
      profit: isSuccess ? Math.random() * 50 + 5 : -(Math.random() * 30 + 5),
      status: isSuccess ? 'success' : 'failed',
      txHash: `0x${Math.random().toString(16).substr(2, 8)}...`,
    });
  }
  
  return trades.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

function calculateVolatility(profits: number[]) {
  if (profits.length < 2) return 0;
  
  const mean = profits.reduce((sum, p) => sum + p, 0) / profits.length;
  const squaredDiffs = profits.map(p => Math.pow(p - mean, 2));
  const variance = squaredDiffs.reduce((sum, sq) => sum + sq, 0) / (profits.length - 1);
  
  return Math.sqrt(variance);
}