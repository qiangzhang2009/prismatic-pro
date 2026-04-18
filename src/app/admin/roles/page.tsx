import { RBAC_PERMISSIONS } from '@/lib/constants';
import type { Role } from '@/lib/types';

const ROLES: Role[] = ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'USER', 'GUEST'];

export default function RolesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">权限管理</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-8">
        查看各角色权限配置（RBAC）
      </p>

      <div className="space-y-4">
        {ROLES.map(role => {
          const perms = RBAC_PERMISSIONS[role] ?? [];
          return (
            <div
              key={role}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--color-prism-amber)]/10 text-[var(--color-prism-amber)] border border-[var(--color-prism-amber)]/20">
                  {role}
                </span>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {perms.length === 0 ? '无特殊权限' : `${perms.length} 项权限`}
                </span>
              </div>
              {perms.length === 0 ? (
                <p className="text-sm text-[var(--color-text-tertiary)] italic">该角色仅拥有基础访问权限</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {perms.map((perm: string) => (
                    <span
                      key={perm}
                      className="inline-flex items-center px-2.5 py-1 rounded text-xs font-mono bg-[var(--color-bg-base)] border border-[var(--color-border)] text-[var(--color-text-secondary)]"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">权限说明</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['stats:read', '查看统计数据'],
            ['users:read', '查看用户列表'],
            ['users:write', '编辑/删除用户'],
            ['cost:read', '查看成本数据'],
            ['subscriptions:read', '查看订阅'],
            ['subscriptions:write', '管理订阅'],
            ['points:read', '查看点数'],
            ['points:write', '管理点数'],
            ['audit:read', '查看审计日志'],
            ['*', '全部权限'],
          ].map(([key, desc]) => (
            <div key={key} className="flex gap-2">
              <code className="text-[var(--color-prism-amber)]">{key}</code>
              <span className="text-[var(--color-text-secondary)]">— {desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
