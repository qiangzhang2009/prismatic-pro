// Key Manager: CRUD + validation + routing
import { db } from '@/lib/db/client';
import { encryptApiKey, decryptApiKey, maskApiKey, hashApiKey, validateApiKeyFormat } from './encryption';
import type { ApiKeyProvider, ApiKeyStatus } from '@/lib/types';

interface KeyValidationResult {
  valid: boolean;
  status: ApiKeyStatus;
  provider?: ApiKeyProvider;
  error?: string;
}

export async function validateAndStoreApiKey(
  userId: string,
  key: string,
  provider: ApiKeyProvider
): Promise<{ success: boolean; masked: string; error?: string }> {
  // Validate format first
  if (!validateApiKeyFormat(key, provider)) {
    return { success: false, masked: '', error: `Invalid API key format for ${provider}` };
  }

  // Test with provider
  const testResult = await testApiKey(key, provider);
  if (!testResult.valid) {
    return { success: false, masked: '', error: testResult.error };
  }

  // Encrypt and store
  const { encrypted, iv } = encryptApiKey(key);

  await db.user.update({
    where: { id: userId },
    data: {
      apiKeyEncrypted: encrypted,
      apiKeyIv: iv,
      apiKeyHash: hashApiKey(key),
      apiKeyProvider: provider,
      apiKeyStatus: 'valid',
      apiKeySetAt: new Date(),
    },
  });

  return { success: true, masked: maskApiKey(key) };
}

export async function getUserDecryptedKey(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      apiKeyEncrypted: true,
      apiKeyIv: true,
      apiKeyStatus: true,
    },
  });

  if (!user?.apiKeyEncrypted || !user?.apiKeyIv) return null;
  if (user.apiKeyStatus !== 'valid') return null;

  try {
    return decryptApiKey(user.apiKeyEncrypted, user.apiKeyIv);
  } catch {
    return null;
  }
}

export async function getUserKeyStatus(userId: string): Promise<{
  hasKey: boolean;
  masked?: string;
  provider?: ApiKeyProvider;
  status?: ApiKeyStatus;
  setAt?: Date;
} | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      apiKeyHash: true,
      apiKeyProvider: true,
      apiKeyStatus: true,
      apiKeySetAt: true,
    },
  });

  if (!user || !user.apiKeyHash) return { hasKey: false };

  // Return masked version using hash prefix
  const masked = `****${user.apiKeyHash}...`;

  return {
    hasKey: true,
    masked,
    provider: user.apiKeyProvider as ApiKeyProvider,
    status: user.apiKeyStatus as ApiKeyStatus,
    setAt: user.apiKeySetAt || undefined,
  };
}

export async function deleteUserApiKey(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: {
      apiKeyEncrypted: null,
      apiKeyIv: null,
      apiKeyHash: null,
      apiKeyProvider: null,
      apiKeyStatus: 'inactive',
      apiKeySetAt: null,
    },
  });
}

// ── Provider key testing ──────────────────────────────────

async function testApiKey(key: string, provider: ApiKeyProvider): Promise<KeyValidationResult> {
  try {
    switch (provider) {
      case 'deepseek': {
        const res = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: 'hi' }],
            max_tokens: 5,
          }),
        });
        if (res.ok) return { valid: true, status: 'valid', provider };
        const err = await res.json().catch(() => ({}));
        return { valid: false, status: 'invalid', error: err.error?.message || `HTTP ${res.status}` };
      }
      case 'openai': {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${key}` },
        });
        if (res.ok) return { valid: true, status: 'valid', provider };
        return { valid: false, status: 'invalid', error: `HTTP ${res.status}` };
      }
      case 'anthropic': {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-haiku-20241022',
            messages: [{ role: 'user', content: 'hi' }],
            max_tokens: 5,
          }),
        });
        if (res.ok) return { valid: true, status: 'valid', provider };
        const err = await res.json().catch(() => ({}));
        return { valid: false, status: 'invalid', error: err.error?.message || `HTTP ${res.status}` };
      }
      default:
        return { valid: false, status: 'invalid', error: 'Unknown provider' };
    }
  } catch (err) {
    return { valid: false, status: 'invalid', error: String(err) };
  }
}
