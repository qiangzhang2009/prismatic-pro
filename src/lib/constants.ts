import type {
  ApiKeyProvider,
  ConversationMode,
} from './types';

// ── App Config ─────────────────────────────────────────────
export const APP_NAME = 'Prismatic Pro';
export const APP_TAGLINE = '借卓越灵魂之力，做更明智的决策';
export const APP_DESCRIPTION =
  '通过与历史上最伟大的思想家对话，获得深度洞察与决策辅助。';
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ── Subscription Plans ─────────────────────────────────────
export const SUBSCRIPTION_PRICES = {
  FREE: 0,
  PRO: 30,
  PRO_PLUS: 80,
} as const;

export const SUBSCRIPTION_FEATURES = {
  FREE: {
    personas: 5,
    dailyMessages: 10,
    modes: ['solo', 'prism'] as ConversationMode[],
    knowledgeGraph: false,
    distillationStudio: false,
  },
  PRO: {
    personas: 20,
    dailyMessages: Infinity,
    modes: ['solo', 'prism', 'roundtable', 'epoch', 'oracle'] as ConversationMode[],
    knowledgeGraph: true,
    distillationStudio: false,
  },
  PRO_PLUS: {
    personas: Infinity,
    dailyMessages: Infinity,
    modes: ['solo', 'prism', 'roundtable', 'epoch', 'oracle', 'synthesis'] as ConversationMode[],
    knowledgeGraph: true,
    distillationStudio: true,
  },
} as const;

// ── Persona Unlock Levels ──────────────────────────────────
export const PERSONA_LEVEL_0 = [
  'steve-jobs',
  'elon-musk',
  'charlie-munger',
  'richard-feynman',
  'confucius',
] as const;

export const PERSONA_LEVEL_1 = [
  'wang-yangming',
  'socrates',
  'seneca',
  'benjamin-graham',
  'peter-thiel',
] as const;

// ── Memory Decay Config ───────────────────────────────────
export const DECAY_CONFIG = {
  SHORT_TERM: { halfLifeMs: 60 * 60 * 1000, minConfidence: 0.3 },
  WORKING: { halfLifeMs: 7 * 24 * 60 * 60 * 1000, minConfidence: 0.5 },
  LONG_TERM: { halfLifeMs: 30 * 24 * 60 * 60 * 1000, minConfidence: 0.7 },
  CRYSTALLIZED: { halfLifeMs: Infinity, minConfidence: 0.9 },
} as const;

// ── Mastery Config ────────────────────────────────────────
export const MASTERY_CONFIG = {
  SOLO: { baseGain: 2, modeBonus: 1.0 },
  PRISM: { baseGain: 1, modeBonus: 1.5 },
  ROUNDTABLE: { baseGain: 1.5, modeBonus: 1.8 },
  EPOCH: { baseGain: 3, modeBonus: 2.0 },
  ORACLE: { baseGain: 2, modeBonus: 1.5 },
  SYNTHESIS: { baseGain: 1, modeBonus: 2.2 },
} as const;

export const MAX_MASTERY = 100;

// ── LLM Config ────────────────────────────────────────────
export const LLM_CONFIG = {
  DEFAULT_MODEL: 'deepseek-chat',
  DEFAULT_PROVIDER: 'deepseek' as ApiKeyProvider,
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.7,
  STREAM: true,
} as const;

export const MODEL_DISPLAY_NAMES: Record<string, string> = {
  'deepseek-chat': 'DeepSeek Chat',
  'deepseek-coder': 'DeepSeek Coder',
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o Mini',
  'claude-3-5-sonnet': 'Claude 3.5 Sonnet',
  'claude-3-5-haiku': 'Claude 3.5 Haiku',
};

// ── LLM Pricing (for reference, User-Pays) ────────────────
export const LLM_PRICING: Record<
  ApiKeyProvider,
  { inputPer1M: number; outputPer1M: number }
> = {
  deepseek: { inputPer1M: 0.27, outputPer1M: 1.1 },
  openai: { inputPer1M: 2.5, outputPer1M: 10 },
  anthropic: { inputPer1M: 3.0, outputPer1M: 15 },
};

// ── RBAC Permissions ──────────────────────────────────────
export const RBAC_PERMISSIONS = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'users:read',
    'users:write',
    'personas:read',
    'personas:write',
    'stats:read',
    'audit:read',
    'audit:write',
    'subscriptions:write',
    'points:write',
    'cost:read',
  ],
  OPERATOR: ['personas:read', 'campaigns:write', 'stats:read'],
  ANALYST: ['stats:read', 'export:read', 'cost:read'],
  SUPPORT: ['users:read', 'tickets:write'],
  MODERATOR: ['personas:read', 'stats:read'],
  GUEST: [],
  USER: [],
} as const;

// ── Admin Roles ──────────────────────────────────────────
export const ADMIN_ROLES = [
  { value: 'SUPER_ADMIN', label: '超级管理员', color: '#D4A853' },
  { value: 'ADMIN', label: '管理员', color: '#7CA1D4' },
  { value: 'OPERATOR', label: '运营', color: '#82C49A' },
  { value: 'ANALYST', label: '分析师', color: '#D482C4' },
  { value: 'SUPPORT', label: '客服', color: '#9A9AAF' },
] as const;

// ── Cost Alert Thresholds ─────────────────────────────────
export const COST_ALERT_THRESHOLD_YUAN = 500;
export const KEY_PENETRATION_WARNING = 0.3;

// ── Point Costs ───────────────────────────────────────────
export const POINT_COSTS = {
  unlockPersona: 500,
  unlockMode: 300,
  unlockKnowledgeGraph: 200,
  distillationRun: 1000,
} as const;

export const POINT_REWARDS = {
  dailyLogin: 10,
  dailyChallenge: 50,
  conversation: 5,
  achievement: 100,
} as const;

// ── Debate Config ─────────────────────────────────────────
export const DEBATE_CONFIG = {
  rounds: 3,
  roundTimeMs: 30000,
  votingDurationMs: 60000,
  minVotesToClose: 3,
} as const;

// ── Pagination ────────────────────────────────────────────
export const PAGE_SIZE_DEFAULT = 20;
export const PAGE_SIZE_MAX = 100;

// ── Domain Colors ─────────────────────────────────────────
export const DOMAIN_COLORS: Record<string, string> = {
  philosophy: '#C4A882',
  technology: '#7CA1D4',
  business: '#82C49A',
  science: '#D482C4',
  history: '#D4A87C',
  economics: '#82A8D4',
  psychology: '#A882C4',
  politics: '#C48282',
};
