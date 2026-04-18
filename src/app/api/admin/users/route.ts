import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import type { Role } from '@/lib/types';
import { canManageUsers } from '@/lib/admin';

export async function GET(req: NextRequest) {
  const userRole = (req.headers.get('x-user-role') || 'USER') as Role;
  if (!canManageUsers(userRole)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);
  const search = searchParams.get('search') || '';

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        apiKeyStatus: true,
        subscription: { select: { plan: true, status: true } },
        _count: { select: { gameProgress: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.user.count({ where }),
  ]);

  return NextResponse.json({
    data: users.map(u => ({ ...u, personaCount: u._count.gameProgress })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(req: NextRequest) {
  const userRole = (req.headers.get('x-user-role') || 'USER') as Role;
  if (!canManageUsers(userRole)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { action, userId, ...rest } = body;

  switch (action) {
    case 'ban': {
      return NextResponse.json({ success: true });
    }
    case 'delete': {
      await db.user.delete({ where: { id: userId } });
      return NextResponse.json({ success: true });
    }
    case 'update-role': {
      const { role } = rest;
      await db.user.update({ where: { id: userId }, data: { role } });
      return NextResponse.json({ success: true });
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
