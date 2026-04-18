// AES-256-GCM encryption for User API Keys
// Key derivation: ENCRYPTION_KEY from environment variable

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  // Ensure 32 bytes for AES-256
  return crypto.createHash('sha256').update(key).digest();
}

export interface EncryptedPayload {
  encrypted: string; // base64
  iv: string;        // base64
}

export function encryptApiKey(plaintext: string): EncryptedPayload {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Combine encrypted data + auth tag
  const combined = Buffer.concat([encrypted, authTag]);

  return {
    encrypted: combined.toString('base64'),
    iv: iv.toString('base64'),
  };
}

export function decryptApiKey(encrypted: string, iv: string): string {
  const key = getEncryptionKey();
  const ivBuf = Buffer.from(iv, 'base64');
  const combined = Buffer.from(encrypted, 'base64');

  // Split encrypted data and auth tag
  const authTag = combined.subarray(-AUTH_TAG_LENGTH);
  const encryptedData = combined.subarray(0, -AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuf);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

export function maskApiKey(key: string): string {
  if (key.length <= 8) return '***';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex').slice(0, 8);
}

export function validateApiKeyFormat(key: string, provider: string): boolean {
  switch (provider) {
    case 'deepseek':
      return key.startsWith('sk-') && key.length > 10;
    case 'openai':
      return key.startsWith('sk-') && key.length > 10;
    case 'anthropic':
      return key.startsWith('sk-ant') && key.length > 10;
    default:
      return key.length > 5;
  }
}
