// ── Core Domain Types ─────────────────────────────────────────

export type SubscriptionPlan = 'FREE' | 'PRO' | 'PRO_PLUS';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
export type ApiKeyProvider = 'deepseek' | 'openai' | 'anthropic';
export type ApiKeyStatus = 'inactive' | 'valid' | 'invalid' | 'expired';
export type MemoryTier = 'SHORT_TERM' | 'WORKING' | 'LONG_TERM' | 'CRYSTALLIZED';
export type ConversationMode = 'solo' | 'prism' | 'roundtable' | 'epoch' | 'oracle' | 'synthesis';
export type EngagementLevel = 'casual' | 'regular' | 'power';
export type PaymentIntent = 'free' | 'trial' | 'paid';
export type UnlockTrigger = 'mastery' | 'purchase' | 'admin';
export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

// ── Memory Types ──────────────────────────────────────────────

export interface MemoryEntry {
  id: string;
  content: string;
  tier: MemoryTier;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
  supersededBy?: string;
  supersedes?: string[];
  tags: string[];
  source?: string;
}

// ── Persona Types ─────────────────────────────────────────────

export interface PersonaCore {
  id: string;
  name: string;
  nameZh?: string;
  shortBio: string;
  avatarUrl?: string;
  domain: string[];
  level: 0 | 1 | 2 | 3;
  mentalModels: string[];
  beliefs: string[];
  heuristics: string[];
  expressionDNA: ExpressionDNA;
  knowledgeGraph?: KnowledgeSnapshot;
  skills: string[];
}

export interface ExpressionDNA {
  vocabularySignature: string[];
  sentencePatterns: string[];
  rhetoricalMoves: string[];
  toneProfile: {
    formality: number;
    emotionality: number;
    directness: number;
  };
  punctuationHabits?: string[];
  commonPhrases?: string[];
}

export interface KnowledgeSnapshot {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ── Knowledge Graph ───────────────────────────────────────────

export type GraphNodeType = 'persona' | 'mental_model' | 'concept' | 'value';

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  personaId?: string;
  modelId?: string;
  size: number;
  color: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'inspired_by' | 'opposes' | 'shares' | 'derives_from' | 'uses';
  strength: number;
  label?: string;
}

// ── Orchestrator ─────────────────────────────────────────────

export type PipelineStage = 'think' | 'plan' | 'build' | 'review' | 'test' | 'ship';

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system' | 'agent';
  content: string;
  agentId?: string;
  confidence?: number;
  modelUsed?: string;
  providerUsed?: ApiKeyProvider;
  tokensUsed?: number;
  latencyMs?: number;
}

export interface OrchestratorConfig {
  mode: ConversationMode;
  personas: string[];
  pipeline?: Partial<Record<PipelineStage, boolean>>;
}

export interface SprintState {
  currentStage: PipelineStage;
  thinkResult?: string;
  planResult?: string;
  buildResult?: string;
  reviewResult?: string;
  testResult?: string;
  shipResult?: string;
  confidence: number;
  iterations: number;
}

// ── Streaming ────────────────────────────────────────────────

export interface StreamChunk {
  type: 'text' | 'confidence' | 'source' | 'thinking' | 'done' | 'error';
  content: string;
  agentId?: string;
  confidence?: number;
  personaId?: string;
  providerUsed?: ApiKeyProvider;
  modelUsed?: string;
  tokensUsed?: number;
}

// ── Analytics ─────────────────────────────────────────────────

export type AnalyticsEvent =
  | { type: 'page_view'; page: string; referrer?: string }
  | { type: 'chat_start'; mode: ConversationMode; personas: string[] }
  | { type: 'chat_message'; tokens_used: number; latency_ms: number }
  | { type: 'persona_unlock'; persona_id: string; trigger: UnlockTrigger }
  | { type: 'subscription'; plan: 'pro' | 'pro_plus'; source: string }
  | { type: 'retention'; day: 1 | 7 | 30; returned: boolean }
  | { type: 'api_key_set'; provider: ApiKeyProvider }
  | { type: 'daily_challenge_complete'; challengeId: string }
  | { type: 'debate_participate'; topic: string }
  | { type: 'knowledge_graph_explore'; nodes_viewed: number };

// ── Game & Gamification ───────────────────────────────────────

export interface Achievement {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

export interface DailyQuest {
  id: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  type: 'chat' | 'persona' | 'challenge' | 'explore';
  reward: number;
  completed: boolean;
  expiresAt: Date;
}

// ── Debate ──────────────────────────────────────────────────

export interface DebateRound {
  roundNumber: number;
  speakerId: string;
  content: string;
  confidence: number;
  timestamp: Date;
}

export interface DebateSession {
  id: string;
  topic: string;
  affirmativePersona: string;
  negativePersona: string;
  moderatorId: string;
  rounds: DebateRound[];
  winner?: string;
  votesFor: number;
  votesAgainst: number;
  spectatorCount: number;
}

// ── Distillation ──────────────────────────────────────────────

export interface DistillationJob {
  id: string;
  personaId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  score?: {
    voice: number;
    knowledge: number;
    reasoning: number;
    safety: number;
    overall: number;
  };
}

// ── API Response ─────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
