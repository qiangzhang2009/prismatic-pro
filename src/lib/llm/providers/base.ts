// LLM Provider Abstraction
import type { ApiKeyProvider, StreamChunk } from '@/lib/types';

export interface LLMResponse {
  content: string;
  model: string;
  provider: ApiKeyProvider;
  tokensUsed?: number;
  finishReason?: string;
}

export interface LLMProvider {
  provider: ApiKeyProvider;
  model: string;
  chat(messages: Array<{ role: string; content: string }>, options?: LLMOptions): Promise<LLMResponse>;
  streamChat(
    messages: Array<{ role: string; content: string }>,
    options?: LLMOptions,
    onChunk?: (chunk: StreamChunk) => void
  ): Promise<LLMResponse>;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  systemPrompt?: string;
}

// ── DeepSeek Provider ─────────────────────────────────────

export class DeepSeekProvider implements LLMProvider {
  provider: ApiKeyProvider = 'deepseek';
  model: string;

  constructor(apiKey: string, model = 'deepseek-chat') {
    this.apiKey = apiKey;
    this.model = model;
  }

  private apiKey: string;

  async chat(
    messages: Array<{ role: string; content: string }>,
    options?: LLMOptions
  ): Promise<LLMResponse> {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
        stream: false,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`DeepSeek API error: ${err.error?.message || res.status}`);
    }

    const data = await res.json();
    return {
      content: data.choices[0]?.message?.content || '',
      model: this.model,
      provider: 'deepseek',
      tokensUsed: data.usage?.total_tokens,
      finishReason: data.choices[0]?.finish_reason,
    };
  }

  async streamChat(
    messages: Array<{ role: string; content: string }>,
    options?: LLMOptions,
    onChunk?: (chunk: StreamChunk) => void
  ): Promise<LLMResponse> {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
        stream: true,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`DeepSeek API error: ${err.error?.message || res.status}`);
    }

    if (!res.body) throw new Error('No response body for streaming');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let usage: { total_tokens?: number } = {};

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            onChunk?.({ type: 'done', content: '' });
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullContent += delta;
              onChunk?.({ type: 'text', content: delta, providerUsed: 'deepseek' as ApiKeyProvider });
            }
            if (parsed.usage) usage = parsed.usage;
          } catch {
            // skip malformed JSON
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return {
      content: fullContent,
      model: this.model,
      provider: 'deepseek',
      tokensUsed: usage.total_tokens,
    };
  }
}

// ── OpenAI Provider ─────────────────────────────────────

export class OpenAIProvider implements LLMProvider {
  provider: ApiKeyProvider = 'openai';
  model: string;

  constructor(apiKey: string, model = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.model = model;
  }

  private apiKey: string;

  async chat(
    messages: Array<{ role: string; content: string }>,
    options?: LLMOptions
  ): Promise<LLMResponse> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${err.error?.message || res.status}`);
    }

    const data = await res.json();
    return {
      content: data.choices[0]?.message?.content || '',
      model: this.model,
      provider: 'openai',
      tokensUsed: data.usage?.total_tokens,
    };
  }

  async streamChat(
    messages: Array<{ role: string; content: string }>,
    options?: LLMOptions,
    onChunk?: (chunk: StreamChunk) => void
  ): Promise<LLMResponse> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
        stream: true,
      }),
    });

    if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
    if (!res.body) throw new Error('No response body');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            onChunk?.({ type: 'done', content: '' });
            continue;
          }
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullContent += delta;
              onChunk?.({ type: 'text', content: delta, providerUsed: 'openai' as ApiKeyProvider });
            }
          } catch {
            // skip
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return { content: fullContent, model: this.model, provider: 'openai' };
  }
}

// ── Anthropic Provider ───────────────────────────────────

export class AnthropicProvider implements LLMProvider {
  provider: ApiKeyProvider = 'anthropic';
  model: string;

  constructor(apiKey: string, model = 'claude-3-5-haiku-20241022') {
    this.apiKey = apiKey;
    this.model = model;
  }

  private apiKey: string;

  async chat(
    messages: Array<{ role: string; content: string }>,
    options?: LLMOptions
  ): Promise<LLMResponse> {
    const system = options?.systemPrompt;
    const userMsgs = messages.filter(m => m.role !== 'system');
    const systemMsg = messages.find(m => m.role === 'system');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        messages: userMsgs,
        system: system || systemMsg?.content,
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Anthropic API error: ${err.error?.message || res.status}`);
    }

    const data = await res.json();
    return {
      content: data.content?.[0]?.text || '',
      model: this.model,
      provider: 'anthropic',
      tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
    };
  }

  async streamChat(
    messages: Array<{ role: string; content: string }>,
    options?: LLMOptions,
    onChunk?: (chunk: StreamChunk) => void
  ): Promise<LLMResponse> {
    // Anthropic streaming uses event stream
    const system = options?.systemPrompt;
    const userMsgs = messages.filter(m => m.role !== 'system');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'interleaved-thinking-2025-05-14',
      },
      body: JSON.stringify({
        model: this.model,
        messages: userMsgs,
        system,
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.7,
        stream: true,
      }),
    });

    if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);
    if (!res.body) throw new Error('No response body');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter(Boolean);

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta') {
              const delta = parsed.delta?.text || '';
              if (delta) {
                fullContent += delta;
                onChunk?.({ type: 'text', content: delta, providerUsed: 'anthropic' as ApiKeyProvider });
              }
            } else if (parsed.type === 'message_delta') {
              onChunk?.({ type: 'done', content: '' });
            }
          } catch {
            // skip
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return { content: fullContent, model: this.model, provider: 'anthropic' };
  }
}

// ── Factory ──────────────────────────────────────────────

export function createProvider(
  provider: ApiKeyProvider,
  apiKey: string,
  model?: string
): LLMProvider {
  switch (provider) {
    case 'deepseek':
      return new DeepSeekProvider(apiKey, model);
    case 'openai':
      return new OpenAIProvider(apiKey, model);
    case 'anthropic':
      return new AnthropicProvider(apiKey, model);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
