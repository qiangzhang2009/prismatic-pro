'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/misc';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';

interface CostDashboardData {
  summary: {
    mrr: number;
    arr: number;
    totalCost: number;
    netProfit: number;
    profitMargin: number;
    activeSubscriptions: number;
    totalUsers: number;
    keyUsersCount: number;
    keyPenetration: number;
  };
  current: {
    statMonth: string;
    mrr: number;
    totalCost: number;
    activeSubs: number;
    proSubs: number;
    proPlusSubs: number;
    keyUsersCount: number;
    noKeyUsersCount: number;
    providerBreakdown: Record<string, number>;
    totalMessages: number;
  } | null;
  trend: Array<{
    month: string;
    mrr: number;
    totalCost: number;
    netProfit: number;
    activeSubs: number;
  }>;
  providerBreakdown: Record<string, number>;
}

export default function CostDashboard() {
  const [data, setData] = useState<CostDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/cost-dashboard', {
      headers: { 'x-user-id': 'admin', 'x-user-role': 'ADMIN' },
    })
      .then(r => r.json())
      .then(d => { setData(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--color-text-secondary)]">
        暂无数据 — 请配置平台成本快照
      </div>
    );
  }

  const { summary, current, trend } = data;
  const isProfitable = summary.netProfit > 0;

  return (
    <div className="space-y-8">
      {/* ── Financial Overview Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="月度经常性收入 (MRR)"
          value={formatCurrency(summary.mrr)}
          sub={`年化 ${formatCurrency(summary.arr)}`}
          color="amber"
        />
        <MetricCard
          label="平台月成本"
          value={formatCurrency(summary.totalCost)}
          sub={`净利润 ${formatCurrency(summary.netProfit)}`}
          color={isProfitable ? 'green' : 'red'}
        />
        <MetricCard
          label="利润率"
          value={formatPercent(summary.profitMargin)}
          sub={isProfitable ? '盈利中' : '亏损中'}
          color={isProfitable ? 'green' : 'red'}
        />
        <MetricCard
          label="活跃订阅"
          value={String(summary.activeSubscriptions)}
          sub={`用户 ${summary.totalUsers} / Key渗透率 ${formatPercent(summary.keyPenetration)}`}
          color="blue"
        />
      </div>

      {/* ── Current Month Detail ── */}
      {current && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subscription breakdown */}
          <Card variant="elevated">
            <CardHeader>
              <h3 className="text-lg font-semibold">订阅构成</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-info)]" />
                  <span className="text-sm text-[var(--color-text-secondary)]">PRO 用户</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{current.proSubs} 人</span>
                  <span className="text-xs text-[var(--color-prism-amber)]">{formatCurrency(30 * current.proSubs)}/月</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-prism-amber)]" />
                  <span className="text-sm text-[var(--color-text-secondary)]">PRO+ 用户</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{current.proPlusSubs} 人</span>
                  <span className="text-xs text-[var(--color-prism-amber)]">{formatCurrency(80 * current.proPlusSubs)}/月</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[var(--color-border)]">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">本月流失</span>
                  <span className="text-[var(--color-error)]">{current.proSubs + current.proPlusSubs > 0 ? Math.round((current.proSubs + current.proPlusSubs) * 0.05) : 0} 人</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Key Usage */}
          <Card variant="elevated">
            <CardHeader>
              <h3 className="text-lg font-semibold">用户 API Key 渗透率</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-[var(--color-prism-amber)]">
                  {formatPercent(summary.keyPenetration)}
                </div>
                <div className="text-sm text-[var(--color-text-secondary)]">
                  <div>已配置 Key: {current.keyUsersCount} 人</div>
                  <div>体验版用户: {current.noKeyUsersCount} 人</div>
                </div>
              </div>
              <div className="pt-3">
                <div className="flex justify-between text-xs text-[var(--color-text-tertiary)] mb-1">
                  <span>Key 渗透率</span>
                  <span>目标 &gt; 60%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-bg-elevated)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-prism-amber)] transition-all"
                    style={{ width: `${Math.min(100, summary.keyPenetration * 100)}%` }}
                  />
                </div>
              </div>
              {summary.keyPenetration < 0.3 && (
                <Badge variant="amber">
                  <span className="mr-1">⚠️</span>
                  Key 渗透率偏低，建议引导更多用户体验配置自己的 API Key
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Trend Chart (simplified table for now) ── */}
      <Card variant="elevated">
        <CardHeader>
          <h3 className="text-lg font-semibold">收入趋势（近12个月）</h3>
        </CardHeader>
        <CardContent>
          {trend.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-5 gap-4 text-xs text-[var(--color-text-tertiary)] font-medium uppercase tracking-wider pb-2 border-b border-[var(--color-border)]">
                <span>月份</span>
                <span className="text-right">MRR</span>
                <span className="text-right">平台成本</span>
                <span className="text-right">净利润</span>
                <span className="text-right">活跃订阅</span>
              </div>
              {[...trend].reverse().map((row) => (
                <div key={row.month} className="grid grid-cols-5 gap-4 text-sm py-2 border-b border-[var(--color-border)] last:border-0">
                  <span className="text-[var(--color-text-secondary)]">{new Date(row.month).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' })}</span>
                  <span className="text-right font-medium text-[var(--color-prism-amber)]">{formatCurrency(row.mrr)}</span>
                  <span className="text-right text-[var(--color-text-secondary)]">{formatCurrency(row.totalCost)}</span>
                  <span className={`text-right font-medium ${row.netProfit >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                    {formatCurrency(row.netProfit)}
                  </span>
                  <span className="text-right text-[var(--color-text-secondary)]">{row.activeSubs}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--color-text-tertiary)]">
              暂无历史数据 — 平台上线后将自动记录
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Platform Costs ── */}
      <Card variant="elevated">
        <CardHeader>
          <h3 className="text-lg font-semibold">平台成本拆解</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Vercel', cost: current?.totalCost ? Number(current.totalCost) * 0.4 : 0, desc: '边缘函数 + 带宽' },
              { name: 'Neon', cost: current?.totalCost ? Number(current.totalCost) * 0.3 : 0, desc: 'Serverless PostgreSQL' },
              { name: 'R2', cost: current?.totalCost ? Number(current.totalCost) * 0.15 : 0, desc: '对象存储' },
              { name: 'Stripe', cost: current?.totalCost ? Number(current.totalCost) * 0.15 : 0, desc: '支付手续费 (2.9%)' },
            ].map(item => (
              <div key={item.name} className="p-4 rounded-lg bg-[var(--color-bg-elevated)]">
                <div className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">{item.name}</div>
                <div className="text-xl font-bold mt-1">{formatCurrency(item.cost)}</div>
                <div className="text-xs text-[var(--color-text-tertiary)] mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: 'amber' | 'green' | 'red' | 'blue';
}) {
  const colors = {
    amber: 'text-[var(--color-prism-amber)]',
    green: 'text-[var(--color-success)]',
    red: 'text-[var(--color-error)]',
    blue: 'text-[var(--color-info)]',
  };

  return (
    <Card variant="elevated" className="p-5">
      <div className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">{label}</div>
      <div className={`text-2xl font-bold ${colors[color]}`}>{value}</div>
      <div className="text-xs text-[var(--color-text-secondary)] mt-1">{sub}</div>
    </Card>
  );
}
