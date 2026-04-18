import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { canViewCosts, requirePermission } from '@/lib/admin';
import { formatCurrency } from '@/lib/utils';
import type { Role } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = (req.headers.get('x-user-role') || 'USER') as Role;

    if (!userId || !canViewCosts(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    let snapshots: unknown[] = [];
    let current: unknown = null;

    try {
      snapshots = await db.platformCostSnapshot.findMany({
        where: { statMonth: { gte: twelveMonthsAgo } },
        orderBy: { statMonth: 'asc' },
      });
    } catch (_) { /* table may not be seeded */ }

    try {
      current = await db.platformCostSnapshot.findFirst({
        orderBy: { statMonth: 'desc' },
      });
    } catch (_) { /* table may not be seeded */ }

    const mrr = (current as { mrr?: unknown })?.mrr || 0;
    const totalCost = (current as { totalCost?: unknown })?.totalCost || 0;
    const netProfit = Number(mrr) - Number(totalCost);
    const profitMargin = Number(mrr) > 0 ? netProfit / Number(mrr) : 0;

    const totalUsers = await db.user.count();
    const activeSubscriptions = await db.subscription.count({
      where: { status: 'ACTIVE', plan: { in: ['PRO', 'PRO_PLUS'] } },
    });
    const keyUsersCount = await db.user.count({
      where: { apiKeyStatus: 'valid' },
    });
    const keyPenetration = totalUsers > 0 ? keyUsersCount / totalUsers : 0;

    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
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
      providerBreakdown = Object.fromEntries(
        rawStats.map(p => [p.provider, p._sum.totalTokens || 0])
      );
    } catch (_) { /* table may not be seeded */ }

    return NextResponse.json({
      data: {
        summary: {
          mrr: Number(mrr),
          arr: Number(mrr) * 12,
          totalCost: Number(totalCost),
          netProfit,
          profitMargin,
          activeSubscriptions,
          totalUsers,
          keyUsersCount,
          keyPenetration,
        },
        current,
        trend: snapshots,
        providerBreakdown,
        providerStats,
      },
    });
  } catch (err) {
    console.error('[/api/admin/cost-dashboard]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
