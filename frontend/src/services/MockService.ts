import { ApiService } from './APIService';
import { Workflow, WorkflowRun, TradeRecord, NotificationParams, Notification } from '../types';
import { COMPONENT_TYPES } from '../types/WorkflowTypes';
import { getComponentSchema } from '../types/ComponentRegistry';
import { authStorage } from '../utils/AuthStorage';

export class MockApiService implements ApiService {
  private workflows: Workflow[] = [];
  private workflowRuns: WorkflowRun[] = [];
  private currentUser: { id: string; name: string; email: string; provider: string } | null = null;
  private notifications: Notification[] = [];

  constructor() {
    this.initMockData();
  }

  private initMockData() {
    // Mock workflows using new unified schema
    const startSchema = getComponentSchema(COMPONENT_TYPES.START);
    const twitterFeedSchema = getComponentSchema(COMPONENT_TYPES.TWITTER_FEED);
    const binanceFeedSchema = getComponentSchema(COMPONENT_TYPES.BINANCE_FEED);
    const aiSchema = getComponentSchema(COMPONENT_TYPES.AI_EVALUATOR);
    const evmSchema = getComponentSchema(COMPONENT_TYPES.EVM_TRADE_EXECUTOR);
    const collectorSchema = getComponentSchema(COMPONENT_TYPES.BINANCE_RESULT_COLLECTOR);
    const endSchema = getComponentSchema(COMPONENT_TYPES.END);

    this.workflows = [
      {
        id: 'workflow-1',
        name: 'ETH Arbitrage Strategy',
        nodes: [
          {
            id: 'START',
            name: 'Start',
            type: COMPONENT_TYPES.START,
            inputMode: startSchema.inputMode,
            outputMode: startSchema.outputMode,
            icon: startSchema.icon,
            style: startSchema.style,
            position: { x: 100, y: 100 },
            config: {},
            status: 'idle',
          },
          {
            id: 'twitter-feed-1',
            name: 'Twitter Feed',
            type: COMPONENT_TYPES.TWITTER_FEED,
            inputMode: twitterFeedSchema.inputMode,
            outputMode: twitterFeedSchema.outputMode,
            icon: twitterFeedSchema.icon,
            style: twitterFeedSchema.style,
            position: { x: 300, y: 50 },
            config: {
              apiKey: 'twitter-api-key',
              accounts: ['elonmusk', 'VitalikButerin'],
              keywords: ['ETH', 'Ethereum'],
              enableWebSocket: false,
              pollingInterval: 5,
              cacheRetention: 30,
            },
            status: 'idle',
          },
          {
            id: 'binance-feed-1',
            name: 'Binance Feed',
            type: COMPONENT_TYPES.BINANCE_FEED,
            inputMode: binanceFeedSchema.inputMode,
            outputMode: binanceFeedSchema.outputMode,
            icon: binanceFeedSchema.icon,
            style: binanceFeedSchema.style,
            position: { x: 300, y: 200 },
            config: {
              rpcEndpoint: 'https://eth-mainnet.alchemyapi.io/v2/your-api-key',
              poolAddress: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
              pollingInterval: 5,
            },
            status: 'idle',
          },
          {
            id: 'ai-1',
            name: 'AI Evaluator',
            type: COMPONENT_TYPES.AI_EVALUATOR,
            inputMode: aiSchema.inputMode,
            outputMode: aiSchema.outputMode,
            icon: aiSchema.icon,
            style: aiSchema.style,
            position: { x: 700, y: 80 },
            config: {
              model: 'deepseek-v3',
              apiKey: 'ai-api-key',
              prompt: 'Analyze crypto sentiment for trading opportunities',
            },
            status: 'idle',
          },
          {
            id: 'evm-1',
            name: 'EVM Trade Executor',
            type: COMPONENT_TYPES.EVM_TRADE_EXECUTOR,
            inputMode: evmSchema.inputMode,
            outputMode: evmSchema.outputMode,
            icon: evmSchema.icon,
            style: evmSchema.style,
            position: { x: 1000, y: 80 },
            config: {
              rpcEndpoint: 'https://mainnet.infura.io/v3/your-key',
              privateKey: '0x...',
              vaultAddress: '0x742d35Cc6639C0532fEb5003f13A1234567890ab',
              dexAddress: '0x...',
              tradingPairs: ['ETH/USDT'],
              maxAmount: 1000,
              minAmount: 10,
              slippagePercent: 1.0,
            },
            status: 'idle',
          },
          {
            id: 'collector-1',
            name: 'Result Collector',
            type: COMPONENT_TYPES.BINANCE_RESULT_COLLECTOR,
            inputMode: collectorSchema.inputMode,
            outputMode: collectorSchema.outputMode,
            icon: collectorSchema.icon,
            style: collectorSchema.style,
            position: { x: 1100, y: 300 },
            config: {
              monitorDuration: 30,
            },
            status: 'idle',
          },
          {
            id: 'END',
            name: 'End',
            type: COMPONENT_TYPES.END,
            inputMode: endSchema.inputMode,
            outputMode: endSchema.outputMode,
            icon: endSchema.icon,
            style: endSchema.style,
            position: { x: 1500, y: 400 },
            config: {},
            status: 'idle',
          },
        ],
        connections: [
          {
            id: 'conn-0',
            source: 'START',
            target: 'twitter-feed-1',
          },
          {
            id: 'conn-1',
            source: 'START',
            target: 'binance-feed-1',
          },
          {
            id: 'conn-2',
            source: 'twitter-feed-1',
            target: 'ai-1',
          },
          {
            id: 'conn-3',
            source: 'binance-feed-1',
            target: 'ai-1',
          },
          {
            id: 'conn-4',
            source: 'ai-1',
            target: 'evm-1',
          },
          {
            id: 'conn-5',
            source: 'evm-1',
            target: 'collector-1',
          },
          {
            id: 'conn-6',
            source: 'collector-1',
            target: 'END',
          },
        ],
        status: 'draft',
        createdAt: new Date('2024-01-15'),
      },
    ];

    // Mock workflow runs
    this.workflowRuns = [
      {
        id: 'run-1',
        workflowId: 'workflow-1',
        startDate: new Date('2024-01-16T10:00:00Z'),
        endDate: new Date('2024-01-16T10:05:00Z'),
        runType: 'manual',
        state: 'success',
        profit: { amount: 125.5, percentage: 2.5 },
        params: { trigger: 'manual' },
        nodeStates: {
          'START': {
            status: 'success',
            logs: ['Started workflow execution'],
          },
          'twitter-feed-1': {
            status: 'success',
            logs: ['Fetched 5 tweets from @elonmusk', 'Sentiment: Bullish'],
          },
          'binance-feed-1': {
            status: 'success',
            logs: ['Fetched 10 Uniswap trades'],
          },
          'ai-1': {
            status: 'success',
            logs: ['AI Analysis: BUY signal', 'Confidence: 0.85'],
          },
          'evm-1': {
            status: 'success',
            logs: ['Trade executed: 0.5 ETH', 'TX: 0xabc123...'],
          },
          'collector-1': {
            status: 'success',
            logs: ['Trade completed successfully', 'Profit: $125.50'],
          },
          'END': { status: 'success', logs: ['Workflow completed'] },
        },
      },
      {
        id: 'run-2',
        workflowId: 'workflow-1',
        startDate: new Date('2024-01-16T14:00:00Z'),
        endDate: new Date('2024-01-16T14:03:00Z'),
        runType: 'scheduled',
        state: 'failed',
        profit: { amount: -25.0, percentage: -0.5 },
        params: { trigger: 'scheduled' },
        nodeStates: {
          'START': {
            status: 'success',
            logs: ['Started workflow execution'],
          },
          'twitter-feed-1': {
            status: 'success',
            logs: ['Fetched 3 tweets from @VitalikButerin'],
          },
          'binance-feed-1': {
            status: 'failed',
            logs: ['Failed to fetch Uniswap trades: Insufficient data'],
          },
          'ai-1': {
            status: 'success',
            logs: ['AI Analysis: SELL signal', 'Confidence: 0.75'],
          },
          'evm-1': {
            status: 'failed',
            logs: ['Trade failed: Insufficient liquidity', 'Error: Slippage too high'],
          },
          'collector-1': { status: 'skipped', logs: [] },
          'END': { status: 'skipped', logs: [] },
        },
      },
    ];

    // Mock notifications - includes Transaction and System types
    this.notifications = [
      {
        id: 'notif-1',
        type: 'Transaction',
        level: 'success',
        title: '交易成功',
        message: 'ETH/USDC 套利交易成功完成，收益 +$125.50',
        timestamp: new Date('2024-01-16T10:05:00Z'),
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
        timestamp: new Date('2024-01-16T09:30:00Z'),
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
        timestamp: new Date('2024-01-16T08:00:00Z'),
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
        timestamp: new Date('2024-01-15T16:45:00Z'),
        read: true,
        workflowId: 'workflow-1',
        workflowRunId: 'run-2',
        relatedData: {
          workflowName: 'SOL Trading Strategy',
          error: 'Insufficient liquidity',
        },
      },
    ];
  }

  async login(provider: string, credentials?: Record<string, unknown>) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

    this.currentUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      provider,
    };

    const mockToken = 'mock-jwt-token';
    const mockPermissions = ['read:workflows', 'write:workflows', 'execute:trades', 'view:notifications', 'admin:system'];

    // Store encrypted user session
    authStorage.storeUserSession(this.currentUser, mockToken, mockPermissions);

    return {
      token: mockToken,
      user: this.currentUser,
    };
  }

  async logout() {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.currentUser = null;
    authStorage.clearUserSession();
  }

  async getCurrentUser() {
    await new Promise(resolve => setTimeout(resolve, 300));

    // First check local encrypted storage
    const cachedUser = authStorage.getCurrentUser();
    if (cachedUser && authStorage.isSessionValid()) {
      // Extend session on active use
      authStorage.extendSession();
      this.currentUser = cachedUser;
      return cachedUser;
    }

    // If no valid cached session, return null (user needs to login)
    this.currentUser = null;
    return null;
  }

  async getWorkflows() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.workflows];
  }

  async getWorkflow(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const workflow = this.workflows.find(w => w.id === id);
    if (!workflow) throw new Error('Workflow not found');
    return { ...workflow };
  }

  async saveWorkflow(workflow: Workflow) {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (workflow.id) {
      const index = this.workflows.findIndex(w => w.id === workflow.id);
      if (index >= 0) {
        this.workflows[index] = { ...workflow, updatedAt: new Date() };
        return this.workflows[index];
      }
    } else {
      const newWorkflow = {
        ...workflow,
        id: `workflow-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.workflows.push(newWorkflow);
      return newWorkflow;
    }

    throw new Error('Failed to save workflow');
  }

  async deleteWorkflow(id: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.workflows = this.workflows.filter(w => w.id !== id);
  }

  async runWorkflow(id: string, params?: Record<string, unknown>) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const workflow = this.workflows.find(w => w.id === id);
    if (!workflow) throw new Error('Workflow not found');

    const newRun: WorkflowRun = {
      id: `run-${Date.now()}`,
      workflowId: id,
      startDate: new Date(),
      endDate: null,
      runType: 'manual',
      state: 'queued',
      profit: { amount: 0, percentage: 0 },
      params: params || {},
      nodeStates: {},
    };

    this.workflowRuns.push(newRun);
    return newRun;
  }

  async getWorkflowRuns(workflowId: string) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return this.workflowRuns.filter(run => run.workflowId === workflowId);
  }

  async getWorkflowRun(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const run = this.workflowRuns.find(r => r.id === id);
    if (!run) throw new Error('Workflow run not found');
    return { ...run };
  }

  async getWorkflowRunLogs(runId: string, nodeId: string) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const run = this.workflowRuns.find(r => r.id === runId);
    if (!run || !run.nodeStates[nodeId]) {
      return ['No logs available'];
    }
    return run.nodeStates[nodeId].logs || ['No logs available'];
  }

  async getTradeHistory(params?: Record<string, unknown>): Promise<TradeRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    // Return mock trade data
    console.debug('Mock getTradeHistory called with params:', params);
    return [];
  }

  async getReports(params?: Record<string, unknown>): Promise<unknown[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return mock report data
    console.debug('Mock getReports called with params:', params);
    return [];
  }

  async getNotifications(params?: NotificationParams): Promise<Notification[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.debug('Mock getNotifications called with params:', params);
    return [...this.notifications];
  }

  async markNotificationAsRead(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.notifications.findIndex(n => n.id === id);
    if (index >= 0) {
      this.notifications[index].read = true;
    }
  }

  async markAllNotificationsAsRead() {
    await new Promise(resolve => setTimeout(resolve, 300));
    this.notifications.forEach(notification => {
      notification.read = true;
    });
  }
}

