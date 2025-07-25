// Workflow-specific types and interfaces
export interface Position {
  x: number;
  y: number;
}

// Connection modes for inputs and outputs
export type ConnectionMode = 'SINGLE' | 'MULTI';

// Component type definitions
export const COMPONENT_TYPES = {
  // Flow Control
  START: 'START',
  END: 'END',

  // Data Sources - Unified Feed Components
  TWITTER_FEED: 'TWITTER_FEED',
  BINANCE_FEED: 'BINANCE_FEED',
  UNISWAP_FEED: 'UNISWAP_FEED',
  COINMARKET_FEED: 'COINMARKET_FEED',

  // AI Analysis
  AI_EVALUATOR: 'AI_EVALUATOR',

  // CEX Trade Executors
  BINANCE_TRADE_EXECUTOR: 'BINANCE_TRADE_EXECUTOR',
  OKX_TRADE_EXECUTOR: 'OKX_TRADE_EXECUTOR',

  // DEX Trade Executors
  BITCOIN_TRADE_EXECUTOR: 'BITCOIN_TRADE_EXECUTOR',
  EVM_TRADE_EXECUTOR: 'EVM_TRADE_EXECUTOR',
  SOLANA_TRADE_EXECUTOR: 'SOLANA_TRADE_EXECUTOR',

  // Result Collectors
  BINANCE_RESULT_COLLECTOR: 'BINANCE_RESULT_COLLECTOR',
  OKX_RESULT_COLLECTOR: 'OKX_RESULT_COLLECTOR',
  EVM_RESULT_COLLECTOR: 'EVM_RESULT_COLLECTOR',
  SOLANA_RESULT_COLLECTOR: 'SOLANA_RESULT_COLLECTOR',
  BITCOIN_RESULT_COLLECTOR: 'BITCOIN_RESULT_COLLECTOR',
} as const;

export type ComponentType = (typeof COMPONENT_TYPES)[keyof typeof COMPONENT_TYPES];

// Unified component schema interface
export interface ComponentSchema {
  name: string;
  nameCN: string;
  type: ComponentType;
  inputMode: ConnectionMode;
  outputMode: ConnectionMode;
  inputConnectables: ComponentType[];
  outputConnectables: ComponentType[];
  icon: React.ComponentType<{ className?: string }>; // Lucide icon component or custom icon
  style: {
    color: string;
    hoverColor: string;
  };
  category: string;
  categoryCN: string;
  description: string;
  descriptionCN: string;
  defaultConfig: Record<string, unknown>;
}

// Component node interface for workflow
export interface ComponentNode {
  id: string;
  name: string;
  type: ComponentType;
  inputMode: ConnectionMode;
  outputMode: ConnectionMode;
  icon: React.ComponentType<{ className?: string }>;
  style: {
    color: string;
    hoverColor: string;
  };
  position: Position;
  config: Record<string, unknown>;
  status?: 'idle' | 'running' | 'success' | 'error';
  runStatus?: 'queued' | 'running' | 'success' | 'failed';
  runLogs?: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    data?: unknown;
  }>;
  readonly?: boolean;
}

// Connection interface
export interface Connection {
  id: string;
  source: string; // source node id
  target: string; // target node id
}

// Workflow interface
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: ComponentNode[];
  connections: Connection[];
  status: 'draft' | 'running' | 'paused' | 'completed' | 'error';
  createdAt: Date;
  updatedAt?: Date;
  config?: Record<string, unknown>;
}

// Component categories for UI organization
export const COMPONENT_CATEGORIES = {
  // FLOW_CONTROL: {
  //   name: 'Flow Control',
  //   types: [COMPONENT_TYPES.START, COMPONENT_TYPES.END],
  // },
  DATA_SOURCES: {
    name: 'Data Sources',
    types: [COMPONENT_TYPES.TWITTER_FEED, COMPONENT_TYPES.BINANCE_FEED, COMPONENT_TYPES.UNISWAP_FEED, COMPONENT_TYPES.COINMARKET_FEED],
  },
  AI_ANALYSIS: {
    name: 'AI Analysis',
    types: [COMPONENT_TYPES.AI_EVALUATOR],
  },
  DEX_TRADING: {
    name: 'DEX Trading',
    types: [
      COMPONENT_TYPES.BITCOIN_TRADE_EXECUTOR,
      COMPONENT_TYPES.EVM_TRADE_EXECUTOR,
      COMPONENT_TYPES.SOLANA_TRADE_EXECUTOR,
      COMPONENT_TYPES.BITCOIN_RESULT_COLLECTOR,
      COMPONENT_TYPES.EVM_RESULT_COLLECTOR,
      COMPONENT_TYPES.SOLANA_RESULT_COLLECTOR,
    ],
  },
  CEX_TRADING: {
    name: 'CEX Trading',
    types: [
      COMPONENT_TYPES.BINANCE_TRADE_EXECUTOR,
      COMPONENT_TYPES.OKX_TRADE_EXECUTOR,
      COMPONENT_TYPES.BINANCE_RESULT_COLLECTOR,
      COMPONENT_TYPES.OKX_RESULT_COLLECTOR,
    ],
  },
};
