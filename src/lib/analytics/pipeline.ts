import { db } from '@/lib/db/client';
import { Prisma } from '@prisma/client';

export async function recordEvents(
  events: Array<{
    event: Record<string, unknown>;
    timestamp: number;
    sessionId: string;
  }>
): Promise<void> {
  await db.analyticsEvent.createMany({
    data: events.map(e => ({
      eventType: (e.event as { type: string }).type || 'unknown',
      payload: e.event as unknown as Prisma.InputJsonValue,
      sessionId: e.sessionId,
      createdAt: new Date(e.timestamp),
    })),
    skipDuplicates: true,
  });
}

// ── Usage Aggregate ─────────────────────────────────────

export async function aggregateDailyUsage(): Promise<void> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const messages = await db.message.groupBy({
    by: ['providerUsed'],
    where: {
      createdAt: { gte: today },
      providerUsed: { not: null },
    },
    _count: { id: true },
    _sum: { tokensUsed: true },
  });

  for (const group of messages) {
    if (!group.providerUsed) continue;
    await db.userApiKeyUsageAggregate.upsert({
      where: {
        statDate_provider: {
          statDate: today,
          provider: group.providerUsed,
        },
      },
      create: {
        statDate: today,
        provider: group.providerUsed,
        totalCalls: group._count.id,
        totalTokens: group._sum.tokensUsed || 0,
      },
      update: {
        totalCalls: { increment: group._count.id },
        totalTokens: { increment: group._sum.tokensUsed || 0 },
      },
    });
  }
}
