import type { MemoryEntry as MemoryEntry } from '@/lib/types';


// Crystallized memory: high-confidence knowledge with zero decay
// Threshold: confidence >= 0.9

const CRYSTALLIZATION_THRESHOLD = 0.9;

export function shouldCrystallize(entry: MemoryEntry): boolean {
  return (
    entry.tier !== 'CRYSTALLIZED' &&
    entry.confidence >= CRYSTALLIZATION_THRESHOLD
  );
}

export function isCrystallized(entry: MemoryEntry): boolean {
  return entry.tier === 'CRYSTALLIZED';
}

export class CrystallizedMemory {
  private entries: MemoryEntry[] = [];

  load(entries: MemoryEntry[]): void {
    this.entries = entries
      .filter(e => e.tier === 'CRYSTALLIZED')
      .sort((a, b) => b.confidence - a.confidence);
  }

  getAll(): MemoryEntry[] {
    return [...this.entries];
  }

  getContext(maxEntries = 10): string {
    return this.entries
      .slice(0, maxEntries)
      .map(e => `[crystallized] ${e.content}`)
      .join('\n');
  }

  getByDomain(domain: string): MemoryEntry[] {
    return this.entries.filter(e =>
      e.tags.some(t => t.toLowerCase().includes(domain.toLowerCase()))
    );
  }

  get count(): number {
    return this.entries.length;
  }

  add(entry: MemoryEntry): void {
    if (isCrystallized(entry)) {
      this.entries.push(entry);
      this.entries.sort((a, b) => b.confidence - a.confidence);
    }
  }
}

export function createCrystallizedMemory(): CrystallizedMemory {
  return new CrystallizedMemory();
}
