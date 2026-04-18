import type { MemoryEntry as MemoryEntry } from '@/lib/types';


// Long-term memory: persistent storage with BM25-style retrieval
// Query by keywords, tags, or confidence threshold

export class LongTermMemory {
  async search(
    entries: MemoryEntry[],
    query: string,
    options?: {
      limit?: number;
      minConfidence?: number;
      tags?: string[];
    }
  ): Promise<MemoryEntry[]> {
    const keywords = query.toLowerCase().split(/\s+/);

    let results = entries.filter(e => e.tier === 'LONG_TERM');

    if (options?.minConfidence !== undefined) {
      results = results.filter(e => e.confidence >= options.minConfidence!);
    }

    if (options?.tags && options.tags.length > 0) {
      results = results.filter(e =>
        options.tags!.some(t => e.tags.includes(t))
      );
    }

    // BM25-like scoring
    const scored = results.map(entry => {
      const content = entry.content.toLowerCase();
      const tags = entry.tags.join(' ').toLowerCase();
      let score = 0;

      for (const kw of keywords) {
        const contentMatches = (content.match(new RegExp(kw, 'g')) || []).length;
        const tagMatches = (tags.match(new RegExp(kw, 'g')) || []).length;
        score += contentMatches * 1.0 + tagMatches * 2.0;
      }

      // Boost by confidence
      score *= (0.5 + entry.confidence * 0.5);

      return { entry, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored
      .slice(0, options?.limit || 10)
      .map(s => s.entry);
  }

  async getContext(
    entries: MemoryEntry[],
    query: string,
    options?: { limit?: number }
  ): Promise<string> {
    const relevant = await this.search(entries, query, {
      limit: options?.limit || 5,
      minConfidence: 0.5,
    });

    return relevant
      .map(e => `[long-term] ${e.content}`)
      .join('\n');
  }
}

export function createLongTermMemory(): LongTermMemory {
  return new LongTermMemory();
}
