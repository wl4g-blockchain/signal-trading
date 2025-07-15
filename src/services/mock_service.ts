import { ApiService } from './api_service';
import { Workflow, WorkflowRun, TradeRecord, ComponentNode } from '../types';

export class MockApiService implements ApiService {
  private workflows: Workflow[] = [];
  private workflowRuns: WorkflowRun[] = [];
  private currentUser: any = null;

  constructor() {
    this.initMockData();
  }

  private initMockData() {
    // Mock workflows
    this.workflows = [
      {
        id: 'workflow-1',
        name: 'ETH Arbitrage Strategy',
        nodes: [
          {
            id: 'start-1',
            type: 'start',
            position: { x: 100, y: 200 },
            data: { name: 'Start' },
            inputs: [],
            outputs: ['trigger'],
          },
          {
            id: 'listener-1',
            type: 'listener',
            position: { x: 300, y: 200 },
            data: { 
              name: 'Twitter Listener',
              type: 'twitter',
              accounts: ['elonmusk', 'VitalikButerin'],
              keywords: ['ETH', 'Ethereum'],
              status: 'idle'
            },
            inputs: ['trigger'],
            outputs: ['data'],
          },
          {
            id: 'evaluator-1',
            type: 'evaluator',
            position: { x: 500, y: 200 },
            data: {
              name: 'AI Evaluator',
              type: 'default',
              riskTolerance: 'medium',
              confidenceThreshold: 0.7,
              status: 'idle'
            },
            inputs: ['data'],
            outputs: ['strategy'],
          },
          {
            id: 'executor-1',
            type: 'executor',
            position: { x: 700, y: 200 },
            data: {
              name: 'Trade Executor',
              maxAmountPerTx: 1000,
              minAmountPerTx: 10,
              slippagePercent: 1.0,
              vaultAddress: '0x742d35Cc6639C0532fEb5003f13A1234567890ab',
              targetChain: 'ethereum',
              status: 'idle'
            },
            inputs: ['strategy'],
            outputs: ['tx_result'],
          },
          {
            id: 'collector-1',
            type: 'collector',
            position: { x: 900, y: 200 },
            data: {
              name: 'Result Collector',
              monitorDuration: 30,
              successCriteria: {
                minProfitPercent: 0.5,
                maxSlippagePercent: 2.0
              },
              status: 'idle'
            },
            inputs: ['tx_result'],
            outputs: ['report'],
          },
          {
            id: 'end-1',
            type: 'end',
            position: { x: 1100, y: 200 },
            data: { name: 'End' },
            inputs: ['report'],
            outputs: [],
          }
        ],
        connections: [
          {
            id: 'conn-1',
            source: 'start-1',
            target: 'listener-1',
            sourceOutput: 'trigger',
            targetInput: 'trigger',
          },
          {
            id: 'conn-2',
            source: 'listener-1',
            target: 'evaluator-1',
            sourceOutput: 'data',
            targetInput: 'data',
          },
          {
            id: 'conn-3',
            source: 'evaluator-1',
            target: 'executor-1',
            sourceOutput: 'strategy',
            targetInput: 'strategy',
          },
          {
            id: 'conn-4',
            source: 'executor-1',
            target: 'collector-1',
            sourceOutput: 'tx_result',
            targetInput: 'tx_result',
          },
          {
            id: 'conn-5',
            source: 'collector-1',
            target: 'end-1',
            sourceOutput: 'report',
            targetInput: 'report',
          }
        ],
        status: 'draft',
        createdAt: new Date('2024-01-15'),
        lastRun: new Date('2024-01-16'),
      }
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
        profit: { amount: 125.50, percentage: 2.5 },
        params: { trigger: 'manual' },
        nodeStates: {
          'start-1': { status: 'success', logs: ['Started workflow execution'] },
          'listener-1': { status: 'success', logs: ['Fetched 5 tweets from @elonmusk', 'Sentiment: Bullish'] },
          'evaluator-1': { status: 'success', logs: ['AI Analysis: BUY signal', 'Confidence: 0.85'] },
          'executor-1': { status: 'success', logs: ['Trade executed: 0.5 ETH', 'TX: 0xabc123...'] },
          'collector-1': { status: 'success', logs: ['Trade completed successfully', 'Profit: $125.50'] },
          'end-1': { status: 'success', logs: ['Workflow completed'] }
        }
      },
      {
        id: 'run-2',
        workflowId: 'workflow-1',
        startDate: new Date('2024-01-16T14:00:00Z'),
        endDate: new Date('2024-01-16T14:03:00Z'),
        runType: 'scheduled',
        state: 'failed',
        profit: { amount: -25.00, percentage: -0.5 },
        params: { trigger: 'scheduled' },
        nodeStates: {
          'start-1': { status: 'success', logs: ['Started workflow execution'] },
          'listener-1': { status: 'success', logs: ['Fetched 3 tweets from @VitalikButerin'] },
          'evaluator-1': { status: 'success', logs: ['AI Analysis: SELL signal', 'Confidence: 0.75'] },
          'executor-1': { status: 'failed', logs: ['Trade failed: Insufficient liquidity', 'Error: Slippage too high'] },
          'collector-1': { status: 'skipped', logs: [] },
          'end-1': { status: 'skipped', logs: [] }
        }
      }
    ];
  }

  async login(provider: string, credentials?: any) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    this.currentUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://github.com/johndoe.png',
      provider
    };

    return {
      token: 'mock-jwt-token',
      user: this.currentUser
    };
  }

  async logout() {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.currentUser = null;
  }

  async getCurrentUser() {
    return this.currentUser;
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
        updatedAt: new Date()
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

  async runWorkflow(id: string, params?: any) {
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
      nodeStates: {}
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

  async getTradeHistory(params?: any) {
    await new Promise(resolve => setTimeout(resolve, 600));
    // Return mock trade data
    return [];
  }

  async getReports(params?: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return mock report data
    return [];
  }
}