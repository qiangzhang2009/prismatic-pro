import type { Role } from '@/lib/types';
import { RBAC_PERMISSIONS } from '@/lib/constants';

export function hasPermission(role: Role, permission: string): boolean {
  const perms = RBAC_PERMISSIONS[role] ?? [];
  return (perms as unknown as string[]).includes('*') || (perms as unknown as string[]).includes(permission);
}

export function requirePermission(role: Role, permission: string): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

export function canAccessAdmin(role: Role): boolean {
  return hasPermission(role, 'stats:read') || hasPermission(role, '*');
}

export function canManageUsers(role: Role): boolean {
  return hasPermission(role, 'users:write');
}

export function canViewCosts(role: Role): boolean {
  return hasPermission(role, 'cost:read') || hasPermission(role, '*');
}

export function canManageSubscriptions(role: Role): boolean {
  return hasPermission(role, 'subscriptions:write');
}

export function canViewAuditLogs(role: Role): boolean {
  return hasPermission(role, 'audit:read');
}

export function canManagePoints(role: Role): boolean {
  return hasPermission(role, 'points:write');
}
