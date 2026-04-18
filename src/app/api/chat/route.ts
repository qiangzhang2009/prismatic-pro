import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { getUserDecryptedKey } from '@/lib/billing/key-manager';
import { createProvider } from '@/lib/llm/providers';
import { getPersonaPrompt } from '@/lib/personas';
import type { StreamChunk } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') || 'demo-user';
    const body = await req.json();
    const { personaId, messages, mode, stream = true } = body as {
      personaId: string;
      messages: Array<{ role: string; content: string }>;
      mode: string;
      stream?: boolean;
    };

    if (!personaId || !messages?.length) {
      return NextResponse.json({ error: 'personaId and messages required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });

    if (stream) {
      // Streaming response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            let provider;
            if (user?.apiKeyEncrypted && user.apiKeyStatus === 'valid') {
              const key = await getUserDecryptedKey(userId);
              if (key) {
                provider = createProvider((user.apiKeyProvider || 'deepseek') as any, key);
              }
            }

            if (!provider) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', content: 'API_KEY_REQUIRED' })}\n\n`));
              controller.close();
              return;
            }

            const personaPrompt = getPersonaPrompt(personaId) || '';
            const allMessages = [
              { role: 'system', content: personaPrompt },
              ...messages.slice(-10), // last 10 messages
            ];

            const response = await provider.streamChat(allMessages, {
              temperature: 0.7,
              maxTokens: 4096,
            }, (chunk: StreamChunk) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            });

            // Record usage (non-critical, skip in streaming mode)
            // In production: write to a queue for async processing

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', content: '', tokensUsed: response.tokensUsed })}\n\n`));
            controller.close();
          } catch (err) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', content: String(err) })}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming
    if (!user?.apiKeyEncrypted || user.apiKeyStatus !== 'valid') {
      return NextResponse.json({ error: 'API_KEY_REQUIRED' }, { status: 402 });
    }

    const key = await getUserDecryptedKey(userId);
    if (!key) return NextResponse.json({ error: 'API_KEY_REQUIRED' }, { status: 402 });

    const provider = createProvider((user.apiKeyProvider || 'deepseek') as any, key);
    const personaPrompt = getPersonaPrompt(personaId) || '';
    const allMessages = [{ role: 'system', content: personaPrompt }, ...messages.slice(-10)];

    const response = await provider.chat(allMessages, { maxTokens: 4096 });

    return NextResponse.json({ content: response.content, tokens: response.tokensUsed });
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
