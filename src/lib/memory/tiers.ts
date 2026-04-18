import { db } from '@/lib/db/client';
import type { MemoryEntry, MemoryTier } from '@/lib/types';
import { DECAY_CONFIG } from '@/lib/constants';

export type { MemoryTier };
export type { MemoryEntry as MemoryEntry };

// ── Memory Tier Manager ────────────────────────────────────

export async function createMemoryEntry(
  userId: string,
  content: string,
  tier: MemoryTier = 'WORKING',
  options?: {
    tags?: string[];
    source?: string;
    confidence?: number;
  }
) {
  return db.memoryEntry.create({
    data: {
      userId,
      content,
      tier,
      tags: options?.tags || [],
      source: options?.source,
      confidence: options?.confidence ?? 0.5,
    },
  });
}

export async function getMemoryEntries(
  userId: string,
  tier?: MemoryTier
) {
  return db.memoryEntry.findMany({
    where: { userId, ...(tier ? { tier } : {}) },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getActiveMemory(
  userId: string,
  options?: { limit?: number }
) {
  return db.memoryEntry.findMany({
    where: {
      userId,
      tier: { in: ['SHORT_TERM', 'WORKING'] },
      confidence: { gte: 0.3 },
    },
    orderBy: [{ confidence: 'desc' }, { updatedAt: 'desc' }],
    take: options?.limit || 50,
  });
}

export async function getCrystallizedMemory(userId: string) {
  return db.memoryEntry.findMany({
    where: { userId, tier: 'CRYSTALLIZED', confidence: { gte: 0.9 } },
    orderBy: { confidence: 'desc' },
  });
}

// ── Decay Engine ───────────────────────────────────────────

function calculateDecay(
  initialConfidence: number,
  elapsedMs: number,
  halfLifeMs: number
): number {
  if (halfLifeMs === Infinity) return initialConfidence;
  const decayFactor = Math.pow(0.5, elapsedMs / halfLifeMs);
  return initialConfidence * decayFactor;
}

export async function applyDecay(userId: string): Promise<number> {
  const now = new Date();
  let totalDecayed = 0;

  for (const [tier, config] of Object.entries(DECAY_CONFIG)) {
    const entries = await db.memoryEntry.findMany({
      where: { userId, tier: tier as MemoryTier },
    });

    for (const entry of entries) {
      const elapsed = now.getTime() - entry.updatedAt.getTime();
      const newConfidence = calculateDecay(
        entry.confidence,
        elapsed,
        config.halfLifeMs
      );

      if (newConfidence < config.minConfidence) {
        // Forget: delete or archive
        if (tier !== 'SHORT_TERM') {
          await db.memoryEntry.delete({ where: { id: entry.id } });
          totalDecayed++;
        } else {
          // Short-term: just remove
          await db.memoryEntry.delete({ where: { id: entry.id } });
        }
      } else if (Math.abs(newConfidence - entry.confidence) > 0.01) {
        await db.memoryEntry.update({
          where: { id: entry.id },
          data: { confidence: newConfidence },
        });
      }
    }
  }

  return totalDecayed;
}

// ── Consolidation Engine ───────────────────────────────────

export async function consolidateMemory(userId: string): Promise<void> {
  // Move high-confidence WorkingMemory → LongTerm
  const candidates = await db.memoryEntry.findMany({
    where: {
      userId,
      tier: 'WORKING',
      confidence: { gte: 0.75 },
    },
  });

  for (const entry of candidates) {
    await db.memoryEntry.update({
      where: { id: entry.id },
      data: { tier: 'LONG_TERM' },
    });
  }

  // Crystallize: LongTerm → Crystallized
  const crystallize = await db.memoryEntry.findMany({
    where: {
      userId,
      tier: 'LONG_TERM',
      confidence: { gte: 0.9 },
    },
  });

  for (const entry of crystallize) {
    await db.memoryEntry.update({
      where: { id: entry.id },
      data: { tier: 'CRYSTALLIZED' },
    });
  }
}

// ── Supersession: New knowledge replaces old ────────────────

export async function supersedeKnowledge(
  userId: string,
  newEntryId: string,
  supersededIds: string[]
): Promise<void> {
  await db.$transaction(
    supersededIds.map(id =>
      db.memoryEntry.update({
        where: { id },
        data: {
          supersededBy: newEntryId,
          confidence: 0, // mark as superseded
        },
      })
    )
  );

  await db.memoryEntry.update({
    where: { id: newEntryId },
    data: { supersedes: supersededIds },
  });
}

// ── Memory to Context ─────────────────────────────────────

export async function buildMemoryContext(
  userId: string,
  options?: { maxTokens?: number }
): Promise<string> {
  const shortTerm = await getMemoryEntries(userId, 'SHORT_TERM');
  const working = await getMemoryEntries(userId, 'WORKING');
  const crystallized = await getCrystallizedMemory(userId);

  const all = [...shortTerm, ...working, ...crystallized]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 30);

  const context = all
    .filter(e => e.confidence > 0.3)
    .map(e => `[${e.tier.toLowerCase()}] ${e.content}`)
    .join('\n');

  return context;
}

// ── Store conversation insight as memory ─────────────────

export async function storeConversationInsight(
  userId: string,
  content: string,
  source: string,
  confidence = 0.7
) {
  return createMemoryEntry(userId, content, 'WORKING', {
    source,
    confidence,
    tags: ['conversation'],
  });
}
