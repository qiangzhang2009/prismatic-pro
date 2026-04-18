import type { MemoryEntry as MemoryEntry } from '@/lib/types';


// Working memory: active knowledge aggregation
// Dynamically exchanged with conversation context
// Uses LLM summarization to compress entries

export class WorkingMemory {
  private entries: MemoryEntry[] = [];
  private readonly maxEntries = 30;

  async add(entry: Omit<MemoryEntry, 'id' | 'tier' | 'createdAt' | 'updatedAt'>): Promise<MemoryEntry> {
    const newEntry: MemoryEntry = {
      ...entry,
      id: `wm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tier: 'WORKING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.entries.push(newEntry);

    if (this.entries.length > this.maxEntries) {
      // Compress: remove lowest confidence
      const lowest = this.entries.reduce((min, e) =>
        e.confidence < min.confidence ? e : min
      );
      this.entries = this.entries.filter(e => e.id !== lowest.id);
    }

    return newEntry;
  }

  getAll(): MemoryEntry[] {
    return [...this.entries].sort((a, b) => b.confidence - a.confidence);
  }

  getContext(): string {
    return this.entries
      .filter(e => e.confidence >= 0.5)
      .sort((a, b) => b.confidence - a.confidence)
      .map(e => `[${e.tags.join(',') || 'general'}] ${e.content}`)
      .join('\n');
  }

  promote(entryId: string): void {
    const entry = this.entries.find(e => e.id === entryId);
    if (entry) entry.confidence = Math.min(1, entry.confidence + 0.1);
  }

  demote(entryId: string): void {
    const entry = this.entries.find(e => e.id === entryId);
    if (entry) {
      entry.confidence -= 0.1;
      if (entry.confidence < 0.3) {
        this.entries = this.entries.filter(e => e.id !== entryId);
      }
    }
  }

  loadFromEntries(entries: MemoryEntry[]): void {
    this.entries = entries
      .filter(e => e.tier === 'WORKING' && e.confidence >= 0.3)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.maxEntries);
  }

  get count(): number {
    return this.entries.length;
  }
}

export function createWorkingMemory(): WorkingMemory {
  return new WorkingMemory();
}
