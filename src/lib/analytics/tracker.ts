// Analytics Tracker: browser-side event collection
import type { AnalyticsEvent } from '@/lib/types';

const QUEUE_KEY = 'prismatic_events';
const FLUSH_INTERVAL = 5000; // 5s
const MAX_QUEUE = 20;

let queue: Array<{ event: AnalyticsEvent; timestamp: number; sessionId: string }> = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let sessionId: string = '';

function getSessionId(): string {
  if (sessionId) return sessionId;
  sessionId = localStorage.getItem('session_id') || `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  localStorage.setItem('session_id', sessionId);
  return sessionId;
}

export function track(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return; // server-side guard

  queue.push({ event, timestamp: Date.now(), sessionId: getSessionId() });

  if (queue.length >= MAX_QUEUE) {
    flush();
  } else if (!flushTimer) {
    flushTimer = setTimeout(flush, FLUSH_INTERVAL);
  }
}

export async function flush(): Promise<void> {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (queue.length === 0) return;

  const batch = [...queue];
  queue = [];

  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: batch }),
      keepalive: true,
    });
  } catch {
    // Re-queue on failure (up to a limit)
    queue = [...batch.slice(-5), ...queue];
  }
}

// Convenience wrappers
export function trackPageView(page: string, referrer?: string): void {
  track({ type: 'page_view', page, referrer });
}

export function trackChatStart(mode: string, personas: string[]): void {
  track({ type: 'chat_start', mode: mode as any, personas });
}

export function trackChatMessage(tokensUsed: number, latencyMs: number): void {
  track({ type: 'chat_message', tokens_used: tokensUsed, latency_ms: latencyMs });
}

export function trackPersonaUnlock(personaId: string, trigger: 'mastery' | 'purchase' | 'admin'): void {
  track({ type: 'persona_unlock', persona_id: personaId, trigger });
}

export function trackSubscription(plan: 'pro' | 'pro_plus', source: string): void {
  track({ type: 'subscription', plan, source });
}
