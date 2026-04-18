import { db } from '@/lib/db/client';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userRole = req.headers.get('x-user-role');
  if (userRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '50'), 200);

  try {
    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.auditLog.count(),
    ]);

    return NextResponse.json({
      data: logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch {
    return NextResponse.json({ data: [], pagination: { page: 1, pageSize, total: 0, totalPages: 0 } });
  }
}
