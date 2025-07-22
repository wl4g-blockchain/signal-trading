// Component Registry with unified schemas
import { Play, Square } from 'lucide-react';
import { ComponentSchema, ComponentType, COMPONENT_TYPES, COMPONENT_CATEGORIES } from './WorkflowTypes';
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
} from '../components/SignalTradingIcon';

// Unified component registry with complete schema definitions
export const COMPONENT_REGISTRY: Record<ComponentType, ComponentSchema> = {
  // Flow Control Components
  [COMPONENT_TYPES.START]: {
    name: 'Start',
    nameCN: '开始',
    type: COMPONENT_TYPES.START,
    inputMode: 'SINGLE',
    outputMode: 'MULTI',
    inputConnectables: [],
    outputConnectables: [COMPONENT_TYPES.TWITTER_FEED, COMPONENT_TYPES.BINANCE_FEED, COMPONENT_TYPES.UNISWAP_FEED, COMPONENT_TYPES.COINMARKET_FEED],
    icon: Play,
    style: {
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
    },
    category: 'Flow Control',
    categoryCN: '流程控制',
    description: 'Workflow start trigger point',
    descriptionCN: '工作流开始触发点',
    defaultConfig: {},
  },

  [COMPONENT_TYPES.END]: {
    name: 'End',
    nameCN: '结束',
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
    category: 'Flow Control',
    categoryCN: '流程控制',
    description: 'Workflow completion point',
    descriptionCN: '工作流完成点',
    defaultConfig: {},
  },

  // Data Source Components - Unified Feed Components
  [COMPONENT_TYPES.TWITTER_FEED]: {
    name: 'Twitter Feed',
    nameCN: 'Twitter 数据源',
    type: COMPONENT_TYPES.TWITTER_FEED,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.START],
    outputConnectables: [COMPONENT_TYPES.AI_EVALUATOR],
    icon: TwitterLogo,
    style: {
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
    },
    category: 'Data Sources',
    categoryCN: '数据源',
    description: 'Extract and stream data from Twitter API with configurable data collection mode',
    descriptionCN: '从Twitter API提取和流式传输数据，支持可配置的数据收集模式',
    defaultConfig: {
      apiKey: '',
      accounts: [],
      keywords: [],
      enableWebSocket: false,
      pollingInterval: 5, // minutes
      cacheRetention: 30, // minutes
    },
  },

  [COMPONENT_TYPES.BINANCE_FEED]: {
    name: 'Binance Feed',
    nameCN: '币安数据源',
    type: COMPONENT_TYPES.BINANCE_FEED,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.START],
    outputConnectables: [COMPONENT_TYPES.AI_EVALUATOR],
    icon: BinanceLogo,
    style: {
      color: 'bg-yellow-600',
      hoverColor: 'hover:bg-yellow-700',
    },
    category: 'Data Sources',
    categoryCN: '数据源',
    description: 'Extract and stream market data from Binance exchange with configurable data collection mode',
    descriptionCN: '从币安交易所提取和流式传输市场数据，支持可配置的数据收集模式',
    defaultConfig: {
      apiKey: '',
      apiSecret: '',
      symbols: [],
      enableWebSocket: false,
      pollingInterval: 5, // minutes
      cacheRetention: 30, // minutes
    },
  },

  [COMPONENT_TYPES.UNISWAP_FEED]: {
    name: 'Uniswap Feed',
    nameCN: 'Uniswap 数据源',
    type: COMPONENT_TYPES.UNISWAP_FEED,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.START],
    outputConnectables: [COMPONENT_TYPES.AI_EVALUATOR],
    icon: UniswapLogo,
    style: {
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
    },
    category: 'Data Sources',
    categoryCN: '数据源',
    description: 'Extract liquidity and swap data from Uniswap with configurable polling intervals',
    descriptionCN: '从Uniswap提取流动性和交换数据，支持可配置的轮询间隔',
    defaultConfig: {
      rpcEndpoint: '',
      poolAddress: '',
      pollingInterval: 5, // minutes
    },
  },

  [COMPONENT_TYPES.COINMARKET_FEED]: {
    name: 'CoinMarket Feed',
    nameCN: 'CoinMarket 数据源',
    type: COMPONENT_TYPES.COINMARKET_FEED,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.START],
    outputConnectables: [COMPONENT_TYPES.AI_EVALUATOR],
    icon: CoinMarketLogo,
    style: {
      color: 'bg-indigo-600',
      hoverColor: 'hover:bg-indigo-700',
    },
    category: 'Data Sources',
    categoryCN: '数据源',
    description: 'Extract cryptocurrency market data from CoinMarketCap with configurable polling intervals',
    descriptionCN: '从CoinMarketCap提取加密货币市场数据，支持可配置的轮询间隔',
    defaultConfig: {
      apiKey: '',
      symbols: [],
      pollingInterval: 5, // minutes
    },
  },

  // AI Analysis Components
  [COMPONENT_TYPES.AI_EVALUATOR]: {
    name: 'AI Evaluator',
    nameCN: 'AI 评估器',
    type: COMPONENT_TYPES.AI_EVALUATOR,
    inputMode: 'MULTI',
    outputMode: 'MULTI',
    inputConnectables: [
      COMPONENT_TYPES.TWITTER_FEED,
      COMPONENT_TYPES.BINANCE_FEED,
      COMPONENT_TYPES.UNISWAP_FEED,
      COMPONENT_TYPES.COINMARKET_FEED,
      COMPONENT_TYPES.AI_EVALUATOR,
    ],
    outputConnectables: [
      COMPONENT_TYPES.AI_EVALUATOR,
      COMPONENT_TYPES.BINANCE_TRADE_EXECUTOR,
      COMPONENT_TYPES.OKX_TRADE_EXECUTOR,
      COMPONENT_TYPES.BITCOIN_TRADE_EXECUTOR,
      COMPONENT_TYPES.EVM_TRADE_EXECUTOR,
      COMPONENT_TYPES.SOLANA_TRADE_EXECUTOR,
    ],
    icon: AILogo,
    style: {
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
    },
    category: 'AI Analysis',
    categoryCN: 'AI 分析',
    description: 'Analyze market data and generate trading strategies using AI',
    descriptionCN: '使用AI分析市场数据并生成交易策略',
    defaultConfig: {
      model: 'gpt-4',
      systemPrompt: 'You are a professional trading analyst. Analyze the provided market data and provide trading recommendations.',
      assistantPrompt: 'Based on the market data, I will provide a clear BUY, SELL, or HOLD recommendation with confidence score and reasoning.',
    },
  },

  // CEX Trade Executors
  [COMPONENT_TYPES.BINANCE_TRADE_EXECUTOR]: {
    name: 'Binance Executor',
    nameCN: '币安执行器',
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
    category: 'CEX Trading',
    categoryCN: 'CEX 交易',
    description: 'Execute trades on Binance centralized exchange',
    descriptionCN: '在币安中心化交易所执行交易',
    defaultConfig: {
      apiKey: '',
      apiSecret: '',
      testnet: false,
      maxAmount: 1000,
      slippage: 1.0,
    },
  },

  [COMPONENT_TYPES.OKX_TRADE_EXECUTOR]: {
    name: 'OKX Executor',
    nameCN: 'OKX 执行器',
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
    category: 'CEX Trading',
    categoryCN: 'CEX 交易',
    description: 'Execute trades on OKX centralized exchange',
    descriptionCN: '在OKX中心化交易所执行交易',
    defaultConfig: {
      apiKey: '',
      apiSecret: '',
      passphrase: '',
      testnet: false,
      maxAmount: 1000,
      slippage: 1.0,
    },
  },

  // DEX Trade Executors
  [COMPONENT_TYPES.BITCOIN_TRADE_EXECUTOR]: {
    name: 'Bitcoin Executor',
    nameCN: '比特币执行器',
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
    category: 'DEX Trading',
    categoryCN: 'DEX 交易',
    description: 'Execute Bitcoin transactions and swaps',
    descriptionCN: '执行比特币交易和交换',
    defaultConfig: {
      privateKey: '',
      network: 'mainnet',
      maxAmount: 1.0,
      gasPrice: 'standard',
    },
  },

  [COMPONENT_TYPES.EVM_TRADE_EXECUTOR]: {
    name: 'EVM Executor',
    nameCN: 'EVM 执行器',
    type: COMPONENT_TYPES.EVM_TRADE_EXECUTOR,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.AI_EVALUATOR],
    outputConnectables: [COMPONENT_TYPES.EVM_RESULT_COLLECTOR],
    icon: EthereumLogo,
    style: {
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
    },
    category: 'DEX Trading',
    categoryCN: 'DEX 交易',
    description: 'Execute trades on EVM-compatible blockchains (Ethereum, Polygon, BSC)',
    descriptionCN: '在EVM兼容区块链上执行交易（以太坊、Polygon、BSC）',
    defaultConfig: {
      privateKey: '',
      rpcEndpoint: '',
      chainId: 1,
      maxAmount: 10.0,
      gasPrice: 'standard',
      vaultAddress: '',
    },
  },

  [COMPONENT_TYPES.SOLANA_TRADE_EXECUTOR]: {
    name: 'Solana Executor',
    nameCN: 'Solana 执行器',
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
    category: 'DEX Trading',
    categoryCN: 'DEX 交易',
    description: 'Execute trades on Solana blockchain',
    descriptionCN: '在Solana区块链上执行交易',
    defaultConfig: {
      privateKey: '',
      rpcEndpoint: '',
      maxAmount: 100.0,
      priorityFee: 5000,
    },
  },

  // Result Collectors
  [COMPONENT_TYPES.BINANCE_RESULT_COLLECTOR]: {
    name: 'Binance Result Collector',
    nameCN: '币安结果收集器',
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
    category: 'CEX Trading',
    categoryCN: 'CEX 交易',
    description: 'Collect and monitor Binance trade execution results',
    descriptionCN: '收集和监控币安交易执行结果',
    defaultConfig: {},
  },

  [COMPONENT_TYPES.OKX_RESULT_COLLECTOR]: {
    name: 'OKX Result Collector',
    nameCN: 'OKX 结果收集器',
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
    category: 'CEX Trading',
    categoryCN: 'CEX 交易',
    description: 'Collect and monitor OKX trade execution results',
    descriptionCN: '收集和监控OKX交易执行结果',
    defaultConfig: {},
  },

  [COMPONENT_TYPES.EVM_RESULT_COLLECTOR]: {
    name: 'EVM Result Collector',
    nameCN: 'EVM 结果收集器',
    type: COMPONENT_TYPES.EVM_RESULT_COLLECTOR,
    inputMode: 'SINGLE',
    outputMode: 'SINGLE',
    inputConnectables: [COMPONENT_TYPES.EVM_TRADE_EXECUTOR],
    outputConnectables: [COMPONENT_TYPES.END],
    icon: EthereumLogo,
    style: {
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    category: 'DEX Trading',
    categoryCN: 'DEX 交易',
    description: 'Collect and monitor EVM blockchain trade execution results',
    descriptionCN: '收集和监控EVM区块链交易执行结果',
    defaultConfig: {},
  },

  [COMPONENT_TYPES.SOLANA_RESULT_COLLECTOR]: {
    name: 'Solana Result Collector',
    nameCN: 'Solana 结果收集器',
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
    category: 'DEX Trading',
    categoryCN: 'DEX 交易',
    description: 'Collect and monitor Solana blockchain trade execution results',
    descriptionCN: '收集和监控Solana区块链交易执行结果',
    defaultConfig: {},
  },

  [COMPONENT_TYPES.BITCOIN_RESULT_COLLECTOR]: {
    name: 'Bitcoin Result Collector',
    nameCN: '比特币结果收集器',
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
    category: 'DEX Trading',
    categoryCN: 'DEX 交易',
    description: 'Collect and monitor Bitcoin transaction execution results',
    descriptionCN: '收集和监控比特币交易执行结果',
    defaultConfig: {},
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
  const categoryConfig = COMPONENT_CATEGORIES[category as keyof typeof COMPONENT_CATEGORIES];
  if (!categoryConfig) {
    return Object.values(COMPONENT_REGISTRY).filter(schema => schema.category === category);
  }

  // Return components in the order defined in COMPONENT_CATEGORIES
  return categoryConfig.types.map((type: ComponentType) => COMPONENT_REGISTRY[type]).filter(Boolean);
};
