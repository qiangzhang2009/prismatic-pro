import { NextRequest, NextResponse } from 'next/server';
import { validateAndStoreApiKey, getUserKeyStatus, deleteUserApiKey } from '@/lib/billing/key-manager';
import type { ApiKeyProvider } from '@/lib/types';

// GET /api/user/api-key — get key status
export async function GET(req: NextRequest) {
  // In production, get userId from session
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const status = await getUserKeyStatus(userId);
  return NextResponse.json({ data: status });
}

// POST /api/user/api-key — validate and store key
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { key, provider } = body as { key: string; provider: ApiKeyProvider };

    if (!key || !provider) {
      return NextResponse.json({ error: 'key and provider are required' }, { status: 400 });
    }

    const result = await validateAndStoreApiKey(userId, key, provider);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, masked: result.masked });
  } catch (err) {
    console.error('API key store error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// DELETE /api/user/api-key — remove key
export async function DELETE(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await deleteUserApiKey(userId);
  return NextResponse.json({ success: true });
}
