import { db } from '@/lib/db/client';
import type { EngagementLevel, PaymentIntent } from '@/lib/types';

export async function buildUserProfile(userId: string): Promise<void> {
  // Count recent messages
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const messageCount = await db.message.count({
    where: {
      conversation: { userId },
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  // Get top personas
  const personaUsage = await db.message.groupBy({
    by: ['personaId'],
    where: {
      conversation: { userId },
      personaId: { not: null },
    },
    _count: { id: true },
  });

  const topPersonas = personaUsage
    .sort((a, b) => b._count.id - a._count.id)
    .slice(0, 3)
    .map(p => p.personaId!)
    .filter(Boolean);

  // Determine engagement
  let engagement: EngagementLevel = 'casual';
  if (messageCount >= 100) engagement = 'power';
  else if (messageCount >= 20) engagement = 'regular';

  // Check subscription
  const sub = await db.subscription.findUnique({ where: { userId } });
  let paymentIntent: PaymentIntent = 'free';
  if (sub?.plan === 'PRO_PLUS') paymentIntent = 'paid';
  else if (sub?.plan === 'PRO') paymentIntent = 'trial';

  await db.userProfile.upsert({
    where: { userId },
    create: {
      userId,
      engagement,
      paymentIntent,
      topPersonas,
      lastActive: new Date(),
    },
    update: {
      engagement,
      paymentIntent,
      topPersonas,
      lastActive: new Date(),
    },
  });
}
