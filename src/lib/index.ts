// Core library exports
export { db } from './db/client';
export { createShortTermMemory, ShortTermMemory } from './memory/short-term';
export { createWorkingMemory, WorkingMemory } from './memory/working-memory';
export { createLongTermMemory, LongTermMemory } from './memory/long-term';
export { createCrystallizedMemory, CrystallizedMemory, shouldCrystallize } from './memory/crystallized';
export type { MemoryTier } from './memory/tiers';
export {
  createMemoryEntry,
  getMemoryEntries,
  getActiveMemory,
  getCrystallizedMemory,
  applyDecay,
  consolidateMemory,
  supersedeKnowledge,
  buildMemoryContext,
  storeConversationInsight,
} from './memory/tiers';
