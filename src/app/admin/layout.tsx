import Link from 'next/link';

const ADMIN_NAV = [
  { href: '/admin/dashboard', label: '概览', icon: '📊' },
  { href: '/admin/users', label: '用户', icon: '👥' },
  { href: '/admin/subscriptions', label: '订阅', icon: '💳' },
  { href: '/admin/cost', label: '成本测算', icon: '💰' },
  { href: '/admin/points', label: '点数', icon: '⭐' },
  { href: '/admin/roles', label: '权限', icon: '🔑' },
  { href: '/admin/audit', label: '审计日志', icon: '📋' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg-base)]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <div className="p-4 border-b border-[var(--color-border)]">
          <Link href="/" className="text-sm font-semibold text-[var(--color-prism-amber)]">
            ← Prismatic Pro
          </Link>
          <div className="text-xs text-[var(--color-text-tertiary)] mt-0.5">管理后台</div>
        </div>
        <nav className="p-2 space-y-0.5">
          {ADMIN_NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
