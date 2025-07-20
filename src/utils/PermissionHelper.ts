import { authStorage } from './AuthStorage';

// Permission constants
export const PERMISSIONS = {
  // Workflow permissions
  READ_WORKFLOWS: 'read:workflows',
  WRITE_WORKFLOWS: 'write:workflows',
  DELETE_WORKFLOWS: 'delete:workflows',

  // Trading permissions
  EXECUTE_TRADES: 'execute:trades',
  VIEW_TRADE_HISTORY: 'view:trade_history',

  // Notification permissions
  VIEW_NOTIFICATIONS: 'view:notifications',
  MANAGE_NOTIFICATIONS: 'manage:notifications',

  // System permissions
  ADMIN_SYSTEM: 'admin:system',
  MANAGE_USERS: 'manage:users',
} as const;

// Permission checking utilities
export class PermissionUtils {
  // Check if user has specific permission
  static hasPermission(permission: string): boolean {
    return authStorage.hasPermission(permission);
  }

  // Check if user has any of the specified permissions
  static hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = authStorage.getUserPermissions();
    return permissions.some(permission => userPermissions.includes(permission));
  }

  // Check if user has all of the specified permissions
  static hasAllPermissions(permissions: string[]): boolean {
    const userPermissions = authStorage.getUserPermissions();
    return permissions.every(permission => userPermissions.includes(permission));
  }

  // Get user role based on permissions (simple role inference)
  static getUserRole(): 'admin' | 'trader' | 'viewer' | 'guest' {
    if (authStorage.hasPermission(PERMISSIONS.ADMIN_SYSTEM)) {
      return 'admin';
    }
    if (authStorage.hasPermission(PERMISSIONS.EXECUTE_TRADES) && authStorage.hasPermission(PERMISSIONS.WRITE_WORKFLOWS)) {
      return 'trader';
    }
    if (authStorage.hasPermission(PERMISSIONS.READ_WORKFLOWS) && authStorage.hasPermission(PERMISSIONS.VIEW_TRADE_HISTORY)) {
      return 'viewer';
    }
    return 'guest';
  }

  // Check if user can perform workflow operations
  static canManageWorkflows(): boolean {
    return this.hasPermission(PERMISSIONS.WRITE_WORKFLOWS);
  }

  // Check if user can execute trades
  static canExecuteTrades(): boolean {
    return this.hasPermission(PERMISSIONS.EXECUTE_TRADES);
  }

  // Check if user can view notifications
  static canViewNotifications(): boolean {
    return this.hasPermission(PERMISSIONS.VIEW_NOTIFICATIONS);
  }

  // Get readable permission names
  static getPermissionName(permission: string): string {
    const permissionNames: Record<string, string> = {
      [PERMISSIONS.READ_WORKFLOWS]: 'Read Workflows',
      [PERMISSIONS.WRITE_WORKFLOWS]: 'Write Workflows',
      [PERMISSIONS.DELETE_WORKFLOWS]: 'Delete Workflows',
      [PERMISSIONS.EXECUTE_TRADES]: 'Execute Trades',
      [PERMISSIONS.VIEW_TRADE_HISTORY]: 'View Trade History',
      [PERMISSIONS.VIEW_NOTIFICATIONS]: 'View Notifications',
      [PERMISSIONS.MANAGE_NOTIFICATIONS]: 'Manage Notifications',
      [PERMISSIONS.ADMIN_SYSTEM]: 'System Admin',
      [PERMISSIONS.MANAGE_USERS]: 'Manage Users',
    };
    return permissionNames[permission] || permission;
  }
}
