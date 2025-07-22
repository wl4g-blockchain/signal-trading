import { ApiService } from "./APIService";
import {
  Workflow,
  TradeRecord,
  NotificationParams,
  Notification,
} from "../types";
import { authStorage } from "../utils/AuthStorage";

export class HttpApiService implements ApiService {
  // TODO: 更改为实际的后端API地址，而不是Next.js风格的/api路径
  private baseUrl = location.origin + "/api";
  private token: string | null = null;

  constructor() {
    this.token = authStorage.getToken();
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
    
    // Store encrypted user session with default permissions
    const defaultPermissions = ['read:workflows', 'write:workflows', 'execute:trades', 'view:notifications'];
    authStorage.storeUserSession(result.user, result.token, defaultPermissions);
    
    return result;
  }

  async logout() {
    await this.request("/auth/logout", { method: "POST" });
    this.token = null;
    authStorage.clearUserSession();
  }

  async getCurrentUser() {
    // First check local encrypted storage
    const cachedUser = authStorage.getCurrentUser();
    if (cachedUser && authStorage.isSessionValid()) {
      // Extend session on active use
      authStorage.extendSession();
      return cachedUser;
    }
    
    // If no valid cached session, try to get from server
    try {
      const user = await this.request("/auth/me");
      // If server returns user, update local session
      if (user && this.token) {
        const defaultPermissions = ['read:workflows', 'write:workflows', 'execute:trades', 'view:notifications'];
        authStorage.storeUserSession(user, this.token, defaultPermissions);
      }
      return user;
    } catch (error) {
      // If server request fails, clear local session
      authStorage.clearUserSession();
      throw error;
    }
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
