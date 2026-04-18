import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { canViewCosts, requirePermission } from '@/lib/admin';
import { formatCurrency } from '@/lib/utils';
import type { Role } from '@/lib/types';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  const userRole = (req.headers.get('x-user-role') || 'USER') as Role;

  if (!userId || !canViewCosts(userRole)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const snapshots = await db.platformCostSnapshot.findMany({
    where: { statMonth: { gte: twelveMonthsAgo } },
    orderBy: { statMonth: 'asc' },
  });

  const current = await db.platformCostSnapshot.findFirst({
    orderBy: { statMonth: 'desc' },
  });

  // Calculate key metrics
  const mrr = current?.mrr || 0;
  const totalCost = current?.totalCost || 0;
  const netProfit = Number(mrr) - Number(totalCost);
  const profitMargin = Number(mrr) > 0 ? netProfit / Number(mrr) : 0;

  // User stats
  const totalUsers = await db.user.count();
  const activeSubscriptions = await db.subscription.count({
    where: { status: 'ACTIVE', plan: { in: ['PRO', 'PRO_PLUS'] } },
  });
  const keyUsersCount = await db.user.count({
    where: { apiKeyStatus: 'valid' },
  });
  const keyPenetration = totalUsers > 0 ? keyUsersCount / totalUsers : 0;

  // Provider breakdown
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const providerStats = await db.userApiKeyUsageAggregate.groupBy({
    by: ['provider'],
    where: { statDate: { gte: last7Days } },
    _sum: { totalCalls: true, totalTokens: true },
  });

  const providerBreakdown = Object.fromEntries(
    providerStats.map(p => [p.provider, p._sum.totalTokens || 0])
  );

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
      current: current ? {
        statMonth: current.statMonth,
        mrr: Number(current.mrr),
        arr: Number(current.arr),
        totalCost: Number(current.totalCost),
        activeSubs: current.activeSubs,
        proSubs: current.proSubs,
        proPlusSubs: current.proPlusSubs,
        churnedSubs: current.churnedSubs,
        keyUsersCount: current.keyUsersCount,
        noKeyUsersCount: current.noKeyUsersCount,
        providerBreakdown: current.providerBreakdown,
        totalMessages: current.totalMessages,
        avgTokensPerMsg: current.avgTokensPerMsg,
      } : null,
      trend: snapshots.map(s => ({
        month: s.statMonth,
        mrr: Number(s.mrr),
        totalCost: Number(s.totalCost),
        netProfit: Number(s.mrr) - Number(s.totalCost),
        activeSubs: s.activeSubs,
        proSubs: s.proSubs,
        proPlusSubs: s.proPlusSubs,
      })),
      providerBreakdown,
      providerStats: providerStats.map(p => ({
        provider: p.provider,
        totalCalls: p._sum.totalCalls || 0,
        totalTokens: p._sum.totalTokens || 0,
      })),
    },
  });
}
