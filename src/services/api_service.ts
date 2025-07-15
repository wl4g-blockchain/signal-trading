import { Workflow, WorkflowRun, TradeRecord } from '../types';

export interface ApiService {
  // Auth
  login(provider: string, credentials?: any): Promise<{ token: string; user: any }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<any>;

  // Workflows
  getWorkflows(): Promise<Workflow[]>;
  getWorkflow(id: string): Promise<Workflow>;
  saveWorkflow(workflow: Workflow): Promise<Workflow>;
  deleteWorkflow(id: string): Promise<void>;
  runWorkflow(id: string, params?: any): Promise<WorkflowRun>;

  // Workflow Runs
  getWorkflowRuns(workflowId: string): Promise<WorkflowRun[]>;
  getWorkflowRun(id: string): Promise<WorkflowRun>;
  getWorkflowRunLogs(runId: string, nodeId: string): Promise<string[]>;

  // Trading
  getTradeHistory(params?: any): Promise<TradeRecord[]>;
  getReports(params?: any): Promise<any[]>;
}

export class HttpApiService implements ApiService {
  private baseUrl = '/api';
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async login(provider: string, credentials?: any) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ provider, credentials }),
    });
    
    this.token = result.token;
    localStorage.setItem('auth_token', result.token);
    return result;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async getWorkflows() {
    return this.request('/workflows');
  }

  async getWorkflow(id: string) {
    return this.request(`/workflows/${id}`);
  }

  async saveWorkflow(workflow: Workflow) {
    const method = workflow.id ? 'PUT' : 'POST';
    const endpoint = workflow.id ? `/workflows/${workflow.id}` : '/workflows';
    return this.request(endpoint, {
      method,
      body: JSON.stringify(workflow),
    });
  }

  async deleteWorkflow(id: string) {
    return this.request(`/workflows/${id}`, { method: 'DELETE' });
  }

  async runWorkflow(id: string, params?: any) {
    return this.request(`/workflows/${id}/run`, {
      method: 'POST',
      body: JSON.stringify({ params }),
    });
  }

  async getWorkflowRuns(workflowId: string) {
    return this.request(`/workflows/${workflowId}/runs`);
  }

  async getWorkflowRun(id: string) {
    return this.request(`/workflow-runs/${id}`);
  }

  async getWorkflowRunLogs(runId: string, nodeId: string) {
    return this.request(`/workflow-runs/${runId}/nodes/${nodeId}/logs`);
  }

  async getTradeHistory(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/trades/history?${query}`);
  }

  async getReports(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reports?${query}`);
  }
}