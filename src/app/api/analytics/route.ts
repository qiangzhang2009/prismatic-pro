import { NextRequest, NextResponse } from 'next/server';
import { recordEvents } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { events } = body;

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: 'No events provided' }, { status: 400 });
    }

    await recordEvents(events);

    return NextResponse.json({ success: true, count: events.length });
  } catch (err) {
    console.error('Analytics error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
