// Short-term memory: current session context
// Lives in-memory, not persisted to DB
// Maximum ~4K tokens, decays per conversation turn

import type { MemoryEntry } from '@/lib/types';

const MAX_SHORT_TERM_ENTRIES = 50;
const MAX_TOKENS_APPROX = 4096;
const AVG_TOKEN_PER_ENTRY = 80; // rough estimate

export class ShortTermMemory {
  private entries: MemoryEntry[] = [];
  private tokensUsed = 0;

  add(content: string, source?: string, confidence = 0.8): MemoryEntry {
    const entry: MemoryEntry = {
      id: `stm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      content,
      tier: 'SHORT_TERM',
      confidence,
      tags: [],
      source,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.entries.push(entry);
    this.tokensUsed += Math.ceil(content.length / 4);

    // Evict oldest if over limit
    if (this.entries.length > MAX_SHORT_TERM_ENTRIES) {
      const evicted = this.entries.shift();
      if (evicted) this.tokensUsed -= Math.ceil(evicted.content.length / 4);
    }

    // If over token budget, remove lowest confidence entries
    while (this.tokensUsed > MAX_TOKENS_APPROX && this.entries.length > 1) {
      const lowest = this.entries.reduce((min, e) =>
        e.confidence < min.confidence ? e : min
      );
      this.entries = this.entries.filter(e => e.id !== lowest.id);
      this.tokensUsed -= Math.ceil(lowest.content.length / 4);
    }

    return entry;
  }

  getAll(): MemoryEntry[] {
    return [...this.entries].sort((a, b) => b.confidence - a.confidence);
  }

  getContext(maxEntries = 20): string {
    return this.entries
      .slice(0, maxEntries)
      .map(e => e.content)
      .join('\n');
  }

  get tokens(): number {
    return this.tokensUsed;
  }

  get count(): number {
    return this.entries.length;
  }

  // Apply decay per turn
  decay(rate = 0.05): void {
    this.entries = this.entries.map(e => ({
      ...e,
      confidence: Math.max(0, e.confidence - rate),
      updatedAt: new Date(),
    }));
    // Remove entries that fell below threshold
    this.entries = this.entries.filter(e => e.confidence >= 0.3);
  }

  clear(): void {
    this.entries = [];
    this.tokensUsed = 0;
  }
}

// Factory
export function createShortTermMemory(): ShortTermMemory {
  return new ShortTermMemory();
}
