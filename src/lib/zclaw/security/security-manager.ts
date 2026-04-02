// Z-Claw Security & Permissions
// Capability-based permission system with secret management

import { Permissions, PermissionLevel, Secret } from './types';
import { randomUUID } from 'crypto';

// Default permissions
const DEFAULT_PERMISSIONS: Permissions = {
  fileSystem: {
    read: 'granted',
    write: 'ask',
    delete: 'require_confirm',
  },
  network: {
    outboundHttp: 'granted',
    sendEmail: 'ask',
    postSocial: 'require_confirm',
  },
  shell: {
    runCommands: 'granted',
    installPackages: 'ask',
    runAsRoot: 'denied',
  },
  llmProviders: {
    sendUserData: 'granted',
    privacyMode: false,
  },
};

export class SecurityManager {
  private permissions: Permissions = { ...DEFAULT_PERMISSIONS };
  private secrets: Map<string, Secret> = new Map();
  private sessionApprovals: Map<string, boolean> = new Map();

  constructor() {
    this.loadPermissions();
  }

  private loadPermissions(): void {
    // In production, load from secure storage
    // For now, use defaults
  }

  // Get current permissions
  getPermissions(): Permissions {
    return { ...this.permissions };
  }

  // Update permission
  setPermission(
    category: keyof Permissions,
    action: string,
    level: PermissionLevel | boolean
  ): void {
    const cat = this.permissions[category];
    if (typeof cat === 'object' && action in cat) {
      (cat as Record<string, PermissionLevel | boolean>)[action] = level;
    }
  }

  // Check if action is allowed
  isAllowed(category: keyof Permissions, action: string): boolean {
    const cat = this.permissions[category];
    if (typeof cat === 'object' && action in cat) {
      const level = (cat as Record<string, PermissionLevel | boolean>)[action];
      return level === 'granted';
    }
    return false;
  }

  // Check if action requires confirmation
  requiresConfirmation(category: keyof Permissions, action: string): boolean {
    const cat = this.permissions[category];
    if (typeof cat === 'object' && action in cat) {
      const level = (cat as Record<string, PermissionLevel | boolean>)[action];
      return level === 'ask' || level === 'require_confirm';
    }
    return false;
  }

  // Request permission for action
  async requestPermission(
    category: keyof Permissions,
    action: string,
    details?: string
  ): Promise<boolean> {
    // Check if already granted
    if (this.isAllowed(category, action)) {
      return true;
    }

    // Check if denied
    const cat = this.permissions[category];
    if (typeof cat === 'object' && action in cat) {
      const level = (cat as Record<string, PermissionLevel | boolean>)[action];
      if (level === 'denied') {
        return false;
      }
    }

    // In interactive mode, would prompt user
    // For now, return true for 'ask' level, false for 'require_confirm'
    const level = (cat as Record<string, PermissionLevel>)[action];
    if (level === 'ask') {
      return true; // Auto-approve in demo
    }
    
    return false; // Require explicit approval
  }

  // Grant session approval
  grantSessionApproval(actionId: string): void {
    this.sessionApprovals.set(actionId, true);
  }

  // Check session approval
  hasSessionApproval(actionId: string): boolean {
    return this.sessionApprovals.get(actionId) === true;
  }

  // Set privacy mode
  setPrivacyMode(enabled: boolean): void {
    this.permissions.llmProviders.privacyMode = enabled;
  }

  // Check privacy mode
  isPrivacyMode(): boolean {
    return this.permissions.llmProviders.privacyMode;
  }

  // Secret management
  setSecret(key: string, provider: string): void {
    this.secrets.set(key, {
      key,
      provider,
      createdAt: new Date(),
    });
  }

  getSecret(key: string): Secret | undefined {
    return this.secrets.get(key);
  }

  hasSecret(key: string): boolean {
    return this.secrets.has(key);
  }

  listSecrets(): Array<{ key: string; provider: string; createdAt: Date }> {
    return Array.from(this.secrets.values()).map(s => ({
      key: s.key,
      provider: s.provider,
      createdAt: s.createdAt,
    }));
  }

  deleteSecret(key: string): boolean {
    return this.secrets.delete(key);
  }

  // Validate action against permissions
  validateAction(
    category: keyof Permissions,
    action: string,
    params?: Record<string, unknown>
  ): { allowed: boolean; reason?: string } {
    // Check privacy mode for LLM calls
    if (category === 'llmProviders' && this.permissions.llmProviders.privacyMode) {
      if (action === 'sendUserData') {
        return { allowed: false, reason: 'Privacy mode is enabled' };
      }
    }

    // Check if action is denied
    const cat = this.permissions[category];
    if (typeof cat === 'object' && action in cat) {
      const level = (cat as Record<string, PermissionLevel>)[action];
      
      if (level === 'denied') {
        return { allowed: false, reason: `Action '${action}' is denied` };
      }
      
      if (level === 'granted') {
        return { allowed: true };
      }
      
      if (level === 'ask' || level === 'require_confirm') {
        // In production, would prompt user
        return { allowed: false, reason: `Action '${action}' requires confirmation` };
      }
    }

    // Default to allowed
    return { allowed: true };
  }

  // Check destructive action
  isDestructiveAction(action: string): boolean {
    const destructiveActions = [
      'delete',
      'write',
      'post',
      'send',
      'install',
      'uninstall',
      'commit',
      'push',
      'deploy',
    ];
    
    return destructiveActions.some(d => action.toLowerCase().includes(d));
  }

  // Reset to defaults
  reset(): void {
    this.permissions = { ...DEFAULT_PERMISSIONS };
    this.sessionApprovals.clear();
  }
}

// Singleton instance
let securityInstance: SecurityManager | null = null;

export function getSecurityManager(): SecurityManager {
  if (!securityInstance) {
    securityInstance = new SecurityManager();
  }
  return securityInstance;
}

export { DEFAULT_PERMISSIONS };
