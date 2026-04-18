import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { canViewCosts } from '@/lib/admin';
import type { Role } from '@/lib/types';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  const userRole = (req.headers.get('x-user-role') || 'USER') as Role;

  if (!userId || !canViewCosts(userRole)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let mrr = 0;
  let totalCost = 0;
  let snapshots: unknown[] = [];

  try {
    const [snapshotsResult, currentResult] = await Promise.all([
      db.platformCostSnapshot.findMany({ where: { statMonth: { gte: twelveMonthsAgo } }, orderBy: { statMonth: 'asc' } }),
      db.platformCostSnapshot.findFirst({ orderBy: { statMonth: 'desc' } }),
    ]);
    snapshots = snapshotsResult;
    if (currentResult) {
      mrr = Number((currentResult as { mrr?: unknown }).mrr ?? 0);
      totalCost = Number((currentResult as { totalCost?: unknown }).totalCost ?? 0);
    }
  } catch (_) { /* tables may not be seeded */ }

  let totalUsers = 0;
  let activeSubscriptions = 0;
  let keyUsersCount = 0;

  try {
    const [u, s, k] = await Promise.all([
      db.user.count(),
      db.subscription.count({ where: { status: 'ACTIVE', plan: { in: ['PRO', 'PRO_PLUS'] } } }),
      db.user.count({ where: { apiKeyStatus: 'valid' } }),
    ]);
    totalUsers = u;
    activeSubscriptions = s;
    keyUsersCount = k;
  } catch (_) { /* tables may not be seeded */ }

  let providerBreakdown: Record<string, number> = {};
  let providerStats: unknown[] = [];

  try {
    const rawStats = await db.userApiKeyUsageAggregate.groupBy({
      by: ['provider'],
      where: { statDate: { gte: last7Days } },
      _sum: { totalCalls: true, totalTokens: true },
    });
    providerStats = rawStats.map(p => ({
      provider: p.provider,
      totalCalls: p._sum.totalCalls || 0,
      totalTokens: p._sum.totalTokens || 0,
    }));
    providerBreakdown = Object.fromEntries(rawStats.map(p => [p.provider, p._sum.totalTokens || 0]));
  } catch (_) { /* table may not be seeded */ }

  const netProfit = mrr - totalCost;
  const profitMargin = mrr > 0 ? netProfit / mrr : 0;
  const keyPenetration = totalUsers > 0 ? keyUsersCount / totalUsers : 0;

  return NextResponse.json({
    data: {
      summary: {
        mrr,
        arr: mrr * 12,
        totalCost,
        netProfit,
        profitMargin,
        activeSubscriptions,
        totalUsers,
        keyUsersCount,
        keyPenetration,
      },
      current: null,
      trend: snapshots,
      providerBreakdown,
      providerStats,
    },
  });
}
