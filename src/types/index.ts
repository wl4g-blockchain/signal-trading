// Re-export workflow types from dedicated workflow types file
export type { ComponentType, ComponentNode, Connection, Workflow, ComponentSchema, Position, ConnectionMode } from './WorkflowTypes';

export interface WorkflowRun {
  id: string;
  workflowId: string;
  startDate: Date;
  endDate: Date | null;
  runType: 'manual' | 'scheduled';
  state: 'queued' | 'running' | 'success' | 'failed';
  profit: {
    amount: number;
    percentage: number;
  };
  params: Record<string, unknown>;
  nodeStates: {
    [nodeId: string]: {
      status: 'queued' | 'running' | 'success' | 'failed' | 'skipped';
      logs: string[];
    };
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: string;
}

export interface ListenerConfig {
  type: 'twitter' | 'trustsocial' | 'coinmarketing' | 'uniswapv4' | 'binance';
  accounts?: string[];
  pairs?: string[];
  timeframe?: '1h' | '4h' | '6h' | '12h' | '24h' | '72h';
  keywords?: string[];
}

export interface EvaluatorConfig {
  type: 'default' | 'custom';
  systemPrompt?: string;
  assistantPrompt?: string;
  riskTolerance: 'low' | 'medium' | 'high';
  confidenceThreshold: number;
}

export interface ExecutorConfig {
  rpcEndpoint: 'mainnet' | 'goerli' | 'sepolia' | 'polygon' | 'bsc' | 'custom';
  customRpc?: string;
  vaultAddress: string;
  customVaultAddress?: string;
  targetDex: 'uniswap' | 'uniswap-v2' | 'uniswap-v3' | 'sushiswap' | '1inch' | 'quickswap' | 'pancakeswap' | 'bakeryswap' | 'custom';
  dexAddress: string;
  customDexAddress?: string;
  allowedTradingPairs: string[];
  maxAmount: number;
  minAmount: number;
  slippagePercent: number;
  gasStrategy: 'slow' | 'standard' | 'fast' | 'custom';
  customGasPrice?: number;
}

export interface CollectorConfig {
  monitorDuration: number; // minutes
  successCriteria: {
    minProfitPercent: number;
    maxSlippagePercent: number;
  };
}

export interface TradeRecord {
  id: string;
  workflowId: string;
  workflowRunId?: string; // Optional field to link to specific workflow run
  timestamp: Date;
  strategy: string;
  pair: string;
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  slippage: number;
  profit: number;
  status: 'pending' | 'success' | 'failed' | 'partial';
  txHash?: string;
}

export interface Report {
  id: string;
  workflowId: string;
  period: { start: Date; end: Date };
  totalTrades: number;
  successfulTrades: number;
  totalProfit: number;
  totalVolume: number;
  averageArbitrageRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: TradeRecord[];
}

export interface Notification {
  id: string;
  type: 'Transaction' | 'System';
  level: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  workflowId?: string;
  workflowRunId?: string;
  relatedData?: Record<string, unknown>;
}

export interface NotificationParams {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
  type?: 'Transaction' | 'System';
  level?: 'success' | 'warning' | 'error' | 'info';
}
