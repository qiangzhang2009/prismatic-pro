import { db } from '@/lib/db/client';

export async function adjustPoints(
  userId: string,
  amount: number,
  reason: string
): Promise<{ newBalance: number }> {
  const transactions = await db.pointTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 1,
  });

  const currentBalance = transactions[0]?.balance ?? 0;
  const newBalance = currentBalance + amount;

  await db.pointTransaction.create({
    data: { userId, amount, reason, balance: newBalance },
  });

  return { newBalance };
}

export async function getPointBalance(userId: string): Promise<number> {
  const tx = await db.pointTransaction.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return tx?.balance ?? 0;
}

export async function getPointHistory(
  userId: string,
  limit = 50
): Promise<Array<{ amount: number; reason: string; balance: number; createdAt: Date }>> {
  const txs = await db.pointTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { amount: true, reason: true, balance: true, createdAt: true },
  });
  return txs;
}
