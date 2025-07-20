import { ApiService } from "./api_service";
import {
  Workflow,
  TradeRecord,
  NotificationParams,
  Notification,
} from "../types";

export class HttpApiService implements ApiService {
  // TODO: setup on build or dynamic current domain?
  private baseUrl = "/api/v1";
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("auth_token");
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
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

  async login(provider: string, credentials?: Record<string, unknown>) {
    const result = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ provider, credentials }),
    });
    this.token = result.token;
    localStorage.setItem("auth_token", result.token);
    return result;
  }

  async logout() {
    await this.request("/auth/logout", { method: "POST" });
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  async getCurrentUser() {
    return this.request("/auth/me");
  }

  async getWorkflows() {
    return this.request("/workflows");
  }

  async getWorkflow(id: string) {
    return this.request(`/workflows/${id}`);
  }

  async saveWorkflow(workflow: Workflow) {
    const method = workflow.id ? "PUT" : "POST";
    const endpoint = workflow.id ? `/workflows/${workflow.id}` : "/workflows";
    return this.request(endpoint, {
      method,
      body: JSON.stringify(workflow as Workflow),
    });
  }

  async deleteWorkflow(id: string) {
    return this.request(`/workflows/${id}`, { method: "DELETE" });
  }

  async runWorkflow(id: string, params?: Record<string, unknown>) {
    return this.request(`/workflows/${id}/run`, {
      method: "POST",
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

  async getTradeHistory(
    params?: Record<string, unknown>
  ): Promise<TradeRecord[]> {
    const query = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    return this.request(`/trades/history${query}`);
  }

  async getReports(params?: Record<string, unknown>): Promise<unknown[]> {
    const query = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    return this.request(`/reports${query}`);
  }

  async getNotifications(params?: NotificationParams): Promise<Notification[]> {
    return this.request("/notifications");
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    return this.request(`/notifications/${notificationId}/read`, {
      method: "POST",
    });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    return this.request("/notifications/read-all", { method: "POST" });
  }
}

// HTTP service is just an alias for HttpApiService
export const httpService = new HttpApiService();
export { HttpApiService as HttpService };
