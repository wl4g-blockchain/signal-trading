// Component Registry with unified schemas
import { Play, Square } from 'lucide-react';
import { ComponentSchema, ComponentType, COMPONENT_TYPES } from './WorkflowTypes';
import {
  BinanceLogo,
  OKXLogo,
  UniswapLogo,
  TwitterLogo,
  BitcoinLogo,
  EthereumLogo,
  SolanaLogo,
  CoinMarketLogo,
  AILogo,
} from '../components/SigTradingIcon';

// Unified component registry with complete schema definitions
export const COMPONENT_REGISTRY: Record<ComponentType, ComponentSchema> = {
  // Flow Control Components
  [COMPONENT_TYPES.START]: {
    name: 'Start',
    type: COMPONENT_TYPES.START,
    inputMode: 'SINGLE',
    outputMode: 'MULTI',
    inputConnectables: [],
    outputConnectables: [
      COMPONENT_TYPES.TWITTER_EXTRACTOR,
      COMPONENT_TYPES.TWITTER_STREAM,
      COMPONENT_TYPES.BINANCE_EXTRACTOR,
      COMPONENT_TYPES.BINANCE_STREAM,
      COMPONENT_TYPES.UNISWAP_EXTRACTOR,
      COMPONENT_TYPES.COINMARKET_EXTRACTOR,
    ],
    icon: Play,
    style: {
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
    },
    category: 'FLOW_CONTROL',
    description: 'Workflow start trigger point',
    defaultConfig: {},
  },

  [COMPONENT_TYPES.END]: {
    name: 'End',
    type: COMPONENT_TYPES.END,
    inputMode: 'MULTI',
    outputMode: 'SINGLE',
    inputConnectables: [
      COMPONENT_TYPES.BINANCE_RESULT_COLLECTOR,
      COMPONENT_TYPES.OKX_RESULT_COLLECTOR,
      COMPONENT_TYPES.EVM_RESULT_COLLECTOR,
      COMPONENT_TYPES.SOLANA_RESULT_COLLECTOR,
      COMPONENT_TYPES.BITCOIN_RESULT_COLLECTOR,
    ],
    outputConnectables: [],
    icon: Square,
    style: {
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-700',
    },
    category: 'FLOW_CONTROL',
    description: 'Workflow completion point',
    defaultConfig: {},
  },

  // Data Extractor Components
  [COMPONENT_TYPES.TWITTER_EXTRACTOR]: {
    name: 'Twitter Extractor',
    type: COMPONENT_TYPES.TWITTER_EXTRACTOR,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.START],
    outputConnectables: [COMPONENT_TYPES.AI_EVALUATOR],
    icon: TwitterLogo,
    style: {
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
    },
    category: 'DATA_SOURCES',
    description: 'Extract data from Twitter API and user timelines',
    defaultConfig: {
      apiKey: '',
      accounts: [],
      keywords: [],
    },
  },

  [COMPONENT_TYPES.TWITTER_STREAM]: {
    name: 'Twitter Stream',
    type: COMPONENT_TYPES.TWITTER_STREAM,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.START],
    outputConnectables: [COMPONENT_TYPES.AI_EVALUATOR],
    icon: TwitterLogo,
    style: {
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    category: 'DATA_SOURCES',
    description: 'Real-time Twitter data streaming and monitoring',
    defaultConfig: {
      apiKey: '',
      accounts: [],
      keywords: [],
    },
  },

  [COMPONENT_TYPES.BINANCE_EXTRACTOR]: {
    name: 'Binance Extractor',
    type: COMPONENT_TYPES.BINANCE_EXTRACTOR,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.START],
    outputConnectables: [COMPONENT_TYPES.AI_EVALUATOR],
    icon: BinanceLogo,
    style: {
      color: 'bg-yellow-600',
      hoverColor: 'hover:bg-yellow-700',
    },
    category: 'DATA_SOURCES',
    description: 'Extract market data from Binance exchange API',
    defaultConfig: {
      apiKey: '',
      apiSecret: '',
      symbols: [],
    },
  },

  [COMPONENT_TYPES.BINANCE_STREAM]: {
    name: 'Binance Stream',
    type: COMPONENT_TYPES.BINANCE_STREAM,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.START],
    outputConnectables: [COMPONENT_TYPES.AI_EVALUATOR],
    icon: BinanceLogo,
    style: {
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
    },
    category: 'DATA_SOURCES',
    description: 'Real-time Binance market data streaming',
    defaultConfig: {
      apiKey: '',
      apiSecret: '',
      symbols: [],
    },
  },

  [COMPONENT_TYPES.UNISWAP_EXTRACTOR]: {
    name: 'Uniswap Extractor',
    type: COMPONENT_TYPES.UNISWAP_EXTRACTOR,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.START],
    outputConnectables: [COMPONENT_TYPES.AI_EVALUATOR],
    icon: UniswapLogo,
    style: {
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
    },
    category: 'DATA_SOURCES',
    description: 'Extract liquidity and swap data from Uniswap',
    defaultConfig: {
      rpcEndpoint: '',
      poolAddress: '',
    },
  },

  [COMPONENT_TYPES.COINMARKET_EXTRACTOR]: {
    name: 'CoinMarket Extractor',
    type: COMPONENT_TYPES.COINMARKET_EXTRACTOR,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.START],
    outputConnectables: [COMPONENT_TYPES.AI_EVALUATOR],
    icon: CoinMarketLogo,
    style: {
      color: 'bg-indigo-600',
      hoverColor: 'hover:bg-indigo-700',
    },
    category: 'DATA_SOURCES',
    description: 'Extract cryptocurrency market data from CoinMarketCap',
    defaultConfig: {
      apiKey: '',
      symbols: [],
    },
  },

  // AI Analysis Components
  [COMPONENT_TYPES.AI_EVALUATOR]: {
    name: 'AI Evaluator',
    type: COMPONENT_TYPES.AI_EVALUATOR,
    inputMode: 'MULTI',
    outputMode: 'MULTI',
    inputConnectables: [
      COMPONENT_TYPES.TWITTER_EXTRACTOR,
      COMPONENT_TYPES.TWITTER_STREAM,
      COMPONENT_TYPES.BINANCE_EXTRACTOR,
      COMPONENT_TYPES.BINANCE_STREAM,
      COMPONENT_TYPES.UNISWAP_EXTRACTOR,
      COMPONENT_TYPES.COINMARKET_EXTRACTOR,
    ],
    outputConnectables: [
      COMPONENT_TYPES.BINANCE_TRADE_EXECUTOR,
      COMPONENT_TYPES.OKX_TRADE_EXECUTOR,
      COMPONENT_TYPES.BITCOIN_TRADE_EXECUTOR,
      COMPONENT_TYPES.EVM_TRADE_EXECUTOR,
      COMPONENT_TYPES.SOLANA_TRADE_EXECUTOR,
    ],
    icon: AILogo,
    style: {
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
    },
    category: 'AI_ANALYSIS',
    description: 'Analyze data using AI models and generate trading strategies',
    defaultConfig: {
      model: '',
      apiKey: '',
      prompt: '',
    },
  },

  // CEX Trade Executor Components
  [COMPONENT_TYPES.BINANCE_TRADE_EXECUTOR]: {
    name: 'Binance Executor',
    type: COMPONENT_TYPES.BINANCE_TRADE_EXECUTOR,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.AI_EVALUATOR],
    outputConnectables: [COMPONENT_TYPES.BINANCE_RESULT_COLLECTOR],
    icon: BinanceLogo,
    style: {
      color: 'bg-yellow-600',
      hoverColor: 'hover:bg-yellow-700',
    },
    category: 'CEX_TRADING',
    description: 'Execute trades on Binance exchange',
    defaultConfig: {
      apiKey: '',
      apiSecret: '',
      tradingPairs: [],
      maxAmount: null,
      minAmount: null,
    },
  },

  [COMPONENT_TYPES.OKX_TRADE_EXECUTOR]: {
    name: 'OKX Executor',
    type: COMPONENT_TYPES.OKX_TRADE_EXECUTOR,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.AI_EVALUATOR],
    outputConnectables: [COMPONENT_TYPES.OKX_RESULT_COLLECTOR],
    icon: OKXLogo,
    style: {
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
    },
    category: 'CEX_TRADING',
    description: 'Execute trades on OKX exchange',
    defaultConfig: {
      apiKey: '',
      apiSecret: '',
      passphrase: '',
      tradingPairs: [],
      maxAmount: null,
      minAmount: null,
    },
  },

  // DEX Trade Executor Components
  [COMPONENT_TYPES.BITCOIN_TRADE_EXECUTOR]: {
    name: 'Bitcoin Executor',
    type: COMPONENT_TYPES.BITCOIN_TRADE_EXECUTOR,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.AI_EVALUATOR],
    outputConnectables: [COMPONENT_TYPES.BITCOIN_RESULT_COLLECTOR],
    icon: BitcoinLogo,
    style: {
      color: 'bg-orange-600',
      hoverColor: 'hover:bg-orange-700',
    },
    category: 'DEX_TRADING',
    description: 'Execute Bitcoin network transactions and trades',
    defaultConfig: {
      rpcEndpoint: '',
      privateKey: '',
      maxAmount: null,
      minAmount: null,
    },
  },

  [COMPONENT_TYPES.EVM_TRADE_EXECUTOR]: {
    name: 'EVM Executor',
    type: COMPONENT_TYPES.EVM_TRADE_EXECUTOR,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.AI_EVALUATOR],
    outputConnectables: [COMPONENT_TYPES.EVM_RESULT_COLLECTOR],
    icon: EthereumLogo,
    style: {
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
    },
    category: 'DEX_TRADING',
    description: 'Execute trades on EVM-compatible DEXs (Ethereum, BSC, Polygon)',
    defaultConfig: {
      rpcEndpoint: '',
      privateKey: '',
      vaultAddress: '',
      dexAddress: '',
      tradingPairs: [],
      maxAmount: null,
      minAmount: null,
      slippagePercent: null,
    },
  },

  [COMPONENT_TYPES.SOLANA_TRADE_EXECUTOR]: {
    name: 'Solana Executor',
    type: COMPONENT_TYPES.SOLANA_TRADE_EXECUTOR,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.AI_EVALUATOR],
    outputConnectables: [COMPONENT_TYPES.SOLANA_RESULT_COLLECTOR],
    icon: SolanaLogo,
    style: {
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
    },
    category: 'DEX_TRADING',
    description: 'Execute trades on Solana-based DEXs (Jupiter, Raydium)',
    defaultConfig: {
      rpcEndpoint: '',
      privateKey: '',
      tradingPairs: [],
      maxAmount: null,
      minAmount: null,
    },
  },

  // Result Collector Components
  [COMPONENT_TYPES.BINANCE_RESULT_COLLECTOR]: {
    name: 'Binance Collector',
    type: COMPONENT_TYPES.BINANCE_RESULT_COLLECTOR,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.BINANCE_TRADE_EXECUTOR],
    outputConnectables: [COMPONENT_TYPES.END],
    icon: BinanceLogo,
    style: {
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
    },
    category: 'CEX_TRADING',
    description: 'Collect and monitor Binance trading results',
    defaultConfig: {
      monitorDuration: null,
    },
  },

  [COMPONENT_TYPES.OKX_RESULT_COLLECTOR]: {
    name: 'OKX Collector',
    type: COMPONENT_TYPES.OKX_RESULT_COLLECTOR,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.OKX_TRADE_EXECUTOR],
    outputConnectables: [COMPONENT_TYPES.END],
    icon: OKXLogo,
    style: {
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    category: 'CEX_TRADING',
    description: 'Collect and monitor OKX trading results',
    defaultConfig: {
      monitorDuration: null,
    },
  },

  [COMPONENT_TYPES.EVM_RESULT_COLLECTOR]: {
    name: 'EVM Collector',
    type: COMPONENT_TYPES.EVM_RESULT_COLLECTOR,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.EVM_TRADE_EXECUTOR],
    outputConnectables: [COMPONENT_TYPES.END],
    icon: EthereumLogo,
    style: {
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
    },
    category: 'DEX_TRADING',
    description: 'Collect and monitor EVM DEX trading results',
    defaultConfig: {
      monitorDuration: null,
    },
  },

  [COMPONENT_TYPES.SOLANA_RESULT_COLLECTOR]: {
    name: 'Solana Collector',
    type: COMPONENT_TYPES.SOLANA_RESULT_COLLECTOR,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.SOLANA_TRADE_EXECUTOR],
    outputConnectables: [COMPONENT_TYPES.END],
    icon: SolanaLogo,
    style: {
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
    },
    category: 'DEX_TRADING',
    description: 'Collect and monitor Solana DEX trading results',
    defaultConfig: {
      monitorDuration: null,
    },
  },

  [COMPONENT_TYPES.BITCOIN_RESULT_COLLECTOR]: {
    name: 'Bitcoin Collector',
    type: COMPONENT_TYPES.BITCOIN_RESULT_COLLECTOR,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.BITCOIN_TRADE_EXECUTOR],
    outputConnectables: [COMPONENT_TYPES.END],
    icon: BitcoinLogo,
    style: {
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
    },
    category: 'DEX_TRADING',
    description: 'Collect and monitor Bitcoin network trading results',
    defaultConfig: {
      monitorDuration: null,
    },
  },
};

// Helper functions for component registry
export const getComponentSchema = (type: ComponentType): ComponentSchema => {
  return COMPONENT_REGISTRY[type];
};

export const canConnect = (sourceType: ComponentType, targetType: ComponentType): boolean => {
  const targetSchema = getComponentSchema(targetType);
  return targetSchema.inputConnectables.includes(sourceType);
};

export const getComponentsByCategory = (category: string): ComponentSchema[] => {
  return Object.values(COMPONENT_REGISTRY).filter(schema => schema.category === category);
};
