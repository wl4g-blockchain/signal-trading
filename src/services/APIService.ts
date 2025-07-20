import { Workflow, WorkflowRun, TradeRecord, Notification, NotificationParams } from '../types';

export interface ApiService {
  // Auth
  login(provider: string, credentials?: Record<string, unknown>): Promise<{ token: string; user: unknown }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<unknown>;

  // WorkflowPage
  getWorkflows(): Promise<Workflow[]>;
  getWorkflow(id: string): Promise<Workflow>;
  saveWorkflow(workflow: Workflow): Promise<Workflow>;
  deleteWorkflow(id: string): Promise<void>;
  runWorkflow(id: string, params?: Record<string, unknown>): Promise<WorkflowRun>;

  // Workflow Runs
  getWorkflowRuns(workflowId: string): Promise<WorkflowRun[]>;
  getWorkflowRun(id: string): Promise<WorkflowRun>;
  getWorkflowRunLogs(runId: string, nodeId: string): Promise<string[]>;

  // Trading
  getTradeHistory(params?: Record<string, unknown>): Promise<TradeRecord[]>;
  getReports(params?: Record<string, unknown>): Promise<unknown[]>;

  // Notifications
  getNotifications(params?: NotificationParams): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markAllNotificationsAsRead(): Promise<void>;
}
