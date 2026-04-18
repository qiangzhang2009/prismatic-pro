import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">管理后台</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Prismatic Pro 运营管理平台</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: '用户总数', value: '—', icon: '👥', color: '#7CA1D4' },
          { label: '活跃订阅', value: '—', icon: '💳', color: '#D4A853' },
          { label: '月度收入', value: '—', icon: '📈', color: '#82C49A' },
        ].map(item => (
          <div
            key={item.label}
            className="p-5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)]"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                style={{ background: `${item.color}15` }}
              >
                {item.icon}
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">{item.label}</div>
                <div className="text-xl font-bold">{item.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/users" className="block">
          <div className="p-5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-bright)] transition-colors">
            <h3 className="font-semibold">用户管理</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">查看、搜索、封禁用户</p>
          </div>
        </Link>
        <Link href="/admin/cost" className="block">
          <div className="p-5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-bright)] transition-colors">
            <h3 className="font-semibold">成本测算</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">订阅收入、平台成本、Key渗透率</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
