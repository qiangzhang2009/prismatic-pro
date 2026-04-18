import { db } from '@/lib/db/client';
import { Prisma } from '@prisma/client';
import type { SubscriptionPlan, SubscriptionStatus } from '@/lib/types';

export async function getOrCreateSubscription(userId: string) {
  return db.subscription.upsert({
    where: { userId },
    create: { userId, plan: 'FREE', status: 'ACTIVE' },
    update: {},
  });
}

export async function updateSubscription(
  userId: string,
  plan: SubscriptionPlan,
  options?: {
    stripeCustomerId?: string;
    stripeSubId?: string;
    stripePriceId?: string;
  }
) {
  return db.subscription.update({
    where: { userId },
    data: {
      plan,
      status: 'ACTIVE',
      stripeCustomerId: options?.stripeCustomerId,
      stripeSubId: options?.stripeSubId,
      stripePriceId: options?.stripePriceId,
      startedAt: new Date(),
    },
  });
}

export async function cancelSubscription(userId: string, atPeriodEnd = true) {
  return db.subscription.update({
    where: { userId },
    data: {
      status: 'ACTIVE',
      cancelAtPeriodEnd: atPeriodEnd,
    },
  });
}

export async function getSubscriptionStatus(userId: string): Promise<{
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  isActive: boolean;
  expiresAt?: Date;
}> {
  const sub = await db.subscription.findUnique({ where: { userId } });
  if (!sub) return { plan: 'FREE', status: 'ACTIVE', isActive: true };

  const isActive = sub.status === 'ACTIVE' && (!sub.expiresAt || sub.expiresAt > new Date());

  return {
    plan: sub.plan as SubscriptionPlan,
    status: sub.status as SubscriptionStatus,
    isActive,
    expiresAt: sub.expiresAt || undefined,
  };
}

export async function recordAuditLog(
  userId: string | null,
  action: string,
  resourceType: string,
  resourceId?: string,
  metadata?: Record<string, unknown>,
  ipAddress?: string
) {
  return db.auditLog.create({
    data: {
      userId,
      action,
      resourceType,
      resourceId,
      metadata: (metadata || {}) as Prisma.InputJsonValue,
      ipAddress,
    },
  });
}
