import { NextApiRequest, NextApiResponse } from 'next';

interface ExecuteWorkflowRequest {
  workflowId: string;
  nodes: any[];
  connections: any[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { nodes, connections } = req.body as ExecuteWorkflowRequest;

    // Validate workflow structure
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      return res.status(400).json({ error: 'Invalid workflow: no nodes provided' });
    }

    // Execute workflow in sequential order
    const executionResult = await executeWorkflow(id as string, nodes, connections);

    res.status(200).json({
      success: true,
      executionId: executionResult.id,
      status: executionResult.status,
      results: executionResult.results,
    });
  } catch (error) {
    console.error('Workflow execution error:', error);
    res.status(500).json({ 
      error: 'Workflow execution failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function executeWorkflow(workflowId: string, nodes: any[], connections: any[]) {
  const executionId = `exec-${Date.now()}`;
  const results: any[] = [];

  // Sort nodes by execution order (topological sort based on connections)
  const sortedNodes = topologicalSort(nodes, connections);

  for (const node of sortedNodes) {
    try {
      let nodeResult;
      
      switch (node.type) {
        case 'listener':
          nodeResult = await executeListener(node);
          break;
        case 'evaluator':
          nodeResult = await executeEvaluator(node, getInputData(node.id, results, connections));
          break;
        case 'executor':
          nodeResult = await executeTradeExecutor(node, getInputData(node.id, results, connections));
          break;
        case 'collector':
          nodeResult = await executeCollector(node, getInputData(node.id, results, connections));
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      results.push({
        nodeId: node.id,
        type: node.type,
        status: 'success',
        data: nodeResult,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      results.push({
        nodeId: node.id,
        type: node.type,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      break; // Stop execution on error
    }
  }

  return {
    id: executionId,
    status: results.every(r => r.status === 'success') ? 'completed' : 'failed',
    results,
  };
}

function topologicalSort(nodes: any[], connections: any[]) {
  // Simple implementation - in production, use proper topological sorting
  const listenerNodes = nodes.filter(n => n.type === 'listener');
  const evaluatorNodes = nodes.filter(n => n.type === 'evaluator');
  const executorNodes = nodes.filter(n => n.type === 'executor');
  const collectorNodes = nodes.filter(n => n.type === 'collector');
  
  return [...listenerNodes, ...evaluatorNodes, ...executorNodes, ...collectorNodes];
}

function getInputData(nodeId: string, results: any[], connections: any[]) {
  const inputConnections = connections.filter(c => c.target === nodeId);
  const inputData: any = {};
  
  for (const connection of inputConnections) {
    const sourceResult = results.find(r => r.nodeId === connection.source);
    if (sourceResult && sourceResult.status === 'success') {
      inputData[connection.targetInput] = sourceResult.data;
    }
  }
  
  return inputData;
}

async function executeListener(node: any) {
  const { type, accounts, pairs, timeframe, keywords, enableWebSocket, pollingInterval, cacheRetention } = node.data;
  
  // Handle unified feed components
  if (type === 'twitter-feed') {
    if (enableWebSocket) {
      // WebSocket mode: return cached data from WebSocket stream
      return await getCachedTwitterData(accounts, keywords, cacheRetention);
    } else {
      // Polling mode: fetch data via API
      return await fetchTwitterData(accounts, keywords, pollingInterval);
    }
  }
  
  if (type === 'binance-feed') {
    if (enableWebSocket) {
      // WebSocket mode: return cached data from WebSocket stream
      return await getCachedBinanceData(pairs, timeframe, cacheRetention);
    } else {
      // Polling mode: fetch data via API
      return await fetchBinanceData(pairs, timeframe, pollingInterval);
    }
  }

  if (type === 'uniswap-feed') {
    // Uniswap only supports polling mode
    return await fetchUniswapData(pairs, timeframe, pollingInterval);
  }

  if (type === 'coinmarket-feed') {
    // CoinMarket only supports polling mode
    return await fetchCoinMarketData(pairs, timeframe, pollingInterval);
  }
  
  // Legacy extractor types for backward compatibility
  switch (type) {
    case 'twitter':
      return await fetchTwitterData(accounts, keywords);
    case 'trustsocial':
      return await fetchTrustSocialData(accounts);
    case 'uniswapv4':
      return await fetchUniswapData(pairs, timeframe);
    case 'binance':
      return await fetchBinanceData(pairs, timeframe);
    case 'coinmarketing':
      return await fetchCoinMarketingData(pairs, timeframe);
    default:
      throw new Error(`Unknown listener type: ${type}`);
  }
}

// Helper functions for WebSocket cached data
async function getCachedTwitterData(accounts: string[], keywords: string[], cacheRetention: number) {
  // In a real implementation, this would retrieve cached data from WebSocket stream
  // For now, we'll simulate cached data
  console.debug(`Retrieving cached Twitter data for accounts: ${accounts}, keywords: ${keywords}, retention: ${cacheRetention}min`);
  
  return {
    source: 'twitter-feed',
    mode: 'websocket',
    data: [
      { id: '1', text: 'Cached tweet about ETH', author: 'elonmusk', timestamp: new Date().toISOString() },
      { id: '2', text: 'Cached tweet about Bitcoin', author: 'VitalikButerin', timestamp: new Date().toISOString() }
    ],
    cacheInfo: {
      retentionMinutes: cacheRetention,
      lastUpdated: new Date().toISOString(),
      totalCached: 2
    }
  };
}

async function getCachedBinanceData(symbols: string[], timeframe: string, cacheRetention: number) {
  // In a real implementation, this would retrieve cached data from WebSocket stream
  // For now, we'll simulate cached data
  console.debug(`Retrieving cached Binance data for symbols: ${symbols}, timeframe: ${timeframe}, retention: ${cacheRetention}min`);
  
  return {
    source: 'binance-feed',
    mode: 'websocket',
    data: symbols.map(symbol => ({
      symbol,
      price: Math.random() * 50000,
      volume: Math.random() * 1000000,
      change24h: (Math.random() - 0.5) * 10,
      timestamp: new Date().toISOString()
    })),
    cacheInfo: {
      retentionMinutes: cacheRetention,
      lastUpdated: new Date().toISOString(),
      totalCached: symbols.length
    }
  };
}

async function executeEvaluator(node: any, inputData: any) {
  const { type, systemPrompt, assistantPrompt, riskTolerance, confidenceThreshold } = node.data;
  
  if (type === 'default') {
    return await defaultAIEvaluation(inputData, riskTolerance, confidenceThreshold);
  } else if (type === 'custom') {
    return await customAIEvaluation(inputData, systemPrompt, assistantPrompt, confidenceThreshold);
  }
  
  throw new Error(`Unknown evaluator type: ${type}`);
}

async function executeTradeExecutor(node: any, inputData: any) {
  const { maxAmountPerTx, minAmountPerTx, slippagePercent, vaultAddress, targetChain } = node.data;
  const strategy = inputData.strategy;
  
  if (!strategy || strategy.action === 'hold') {
    return { action: 'hold', reason: 'No trading signal' };
  }
  
  // Validate trade parameters
  const adjustedAmount = Math.min(Math.max(strategy.amount, minAmountPerTx), maxAmountPerTx);
  
  // Execute trade based on strategy
  return await executeTrade({
    action: strategy.action,
    pair: strategy.pair,
    amount: adjustedAmount,
    slippage: slippagePercent,
    vaultAddress,
    chain: targetChain,
  });
}

async function executeCollector(node: any, inputData: any) {
  const { monitorDuration, successCriteria } = node.data;
  const txResult = inputData.tx_result;
  
  if (!txResult || !txResult.txHash) {
    return { status: 'no_transaction', collected: false };
  }
  
  // Monitor transaction for specified duration
  return await monitorTransaction(txResult.txHash, monitorDuration, successCriteria);
}

// Mock implementation functions
async function fetchTwitterData(accounts: string[], keywords: string[]) {
  // Mock Twitter API call
  return {
    source: 'twitter',
    sentiment: Math.random() > 0.5 ? 'bullish' : 'bearish',
    mentions: Math.floor(Math.random() * 100),
    trending: keywords?.[0] || 'BTC',
  };
}

async function fetchTrustSocialData(accounts: string[]) {
  return {
    source: 'trustsocial',
    sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
    influencerScore: Math.random() * 100,
  };
}

async function fetchUniswapData(pairs: string[], timeframe: string) {
  return {
    source: 'uniswap',
    pair: pairs?.[0] || 'ETH/USDC',
    price: 2450 + Math.random() * 100,
    volume24h: Math.random() * 1000000,
    priceChange: (Math.random() - 0.5) * 10,
  };
}

async function fetchBinanceData(pairs: string[], timeframe: string) {
  return {
    source: 'binance',
    pair: pairs?.[0] || 'ETHUSDT',
    price: 2450 + Math.random() * 100,
    volume: Math.random() * 1000000,
    change: (Math.random() - 0.5) * 5,
  };
}

async function fetchCoinMarketingData(pairs: string[], timeframe: string) {
  return {
    source: 'coinmarketing',
    marketCap: Math.random() * 1000000000,
    sentiment: Math.random() > 0.5 ? 'buy' : 'sell',
  };
}

async function defaultAIEvaluation(data: any, riskTolerance: string, threshold: number) {
  // Mock AI evaluation
  const confidence = Math.random();
  const shouldTrade = confidence > threshold;
  
  return {
    action: shouldTrade ? (Math.random() > 0.5 ? 'buy' : 'sell') : 'hold',
    pair: 'ETH/USDC',
    amount: shouldTrade ? Math.random() * 1000 + 100 : 0,
    confidence,
    reasoning: 'AI analysis based on market data and sentiment',
  };
}

async function customAIEvaluation(data: any, systemPrompt: string, assistantPrompt: string, threshold: number) {
  // Mock custom AI evaluation
  const confidence = Math.random();
  
  return {
    action: confidence > threshold ? (Math.random() > 0.5 ? 'buy' : 'sell') : 'hold',
    pair: 'ETH/USDC',
    amount: confidence > threshold ? Math.random() * 1000 + 100 : 0,
    confidence,
    reasoning: 'Custom AI strategy evaluation',
  };
}

async function executeTrade(params: any) {
  // Mock trade execution
  const success = Math.random() > 0.1; // 90% success rate
  
  return {
    txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    status: success ? 'success' : 'failed',
    actualAmount: params.amount,
    actualSlippage: Math.random() * params.slippage,
    gasUsed: Math.floor(Math.random() * 100000 + 21000),
    timestamp: new Date().toISOString(),
  };
}

async function monitorTransaction(txHash: string, duration: number, criteria: any) {
  // Mock transaction monitoring
  const profit = (Math.random() - 0.3) * 100;
  const slippage = Math.random() * 2;
  
  return {
    txHash,
    finalStatus: 'completed',
    actualProfit: profit,
    actualSlippage: slippage,
    successful: profit > criteria.minProfitPercent && slippage < criteria.maxSlippagePercent,
    monitoredFor: duration,
  };
}