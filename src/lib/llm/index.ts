// LLM Gateway: routes requests to user API keys or platform fallback
import { getUserDecryptedKey } from '@/lib/billing/key-manager';
import { createProvider, type LLMProvider, type LLMResponse, type LLMOptions } from './providers';
import type { ApiKeyProvider, StreamChunk } from '@/lib/types';

export { createProvider };
export type { LLMProvider, LLMResponse, LLMOptions };

export async function getLLMProviderForUser(
  userId: string,
  preferredProvider?: ApiKeyProvider
): Promise<LLMProvider> {
  const key = await getUserDecryptedKey(userId);

  if (!key) {
    throw new Error('API_KEY_REQUIRED');
  }

  // Use user's preferred provider or default
  const provider = preferredProvider || 'deepseek';

  return createProvider(provider, key);
}

export async function chatWithUserKey(
  userId: string,
  messages: Array<{ role: string; content: string }>,
  options?: LLMOptions,
  preferredProvider?: ApiKeyProvider
): Promise<LLMResponse> {
  const provider = await getLLMProviderForUser(userId, preferredProvider);
  return provider.chat(messages, options);
}

export async function streamChatWithUserKey(
  userId: string,
  messages: Array<{ role: string; content: string }>,
  options: LLMOptions | undefined,
  onChunk: (chunk: StreamChunk) => void,
  preferredProvider?: ApiKeyProvider
): Promise<LLMResponse> {
  const provider = await getLLMProviderForUser(userId, preferredProvider);
  return provider.streamChat(messages, options, onChunk);
}

// Platform fallback: only used when PLATFORM_DEEPSEEK_KEY is set
export async function chatWithPlatformKey(
  messages: Array<{ role: string; content: string }>,
  options?: LLMOptions
): Promise<LLMResponse> {
  const key = process.env.PLATFORM_DEEPSEEK_KEY;
  if (!key) throw new Error('PLATFORM_KEY_NOT_CONFIGURED');

  const provider = createProvider('deepseek', key);
  return provider.chat(messages, options);
}
