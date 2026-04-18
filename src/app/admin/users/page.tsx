'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/misc';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/misc';

interface User {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  createdAt: string;
  apiKeyStatus: string | null;
  subscription: { plan: string; status: string } | null;
  gameProgress: { _count: { personaId: number } };
}

interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function loadUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), search, pageSize: '20' });
      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { 'x-user-id': 'admin', 'x-user-role': 'ADMIN' },
      });
      const data: UsersResponse = await res.json();
      setUsers(data.data || []);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">用户管理</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">共 {total} 位用户</p>
        </div>
        <Button onClick={loadUsers} loading={loading}>刷新</Button>
      </div>

      <Card variant="elevated">
        <CardContent className="p-4">
          <Input
            placeholder="搜索邮箱或用户名..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (setPage(1), loadUsers())}
          />
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-tertiary)]">暂无用户数据</div>
      ) : (
        <div className="space-y-3">
          {users.map(user => (
            <Card key={user.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={user.name || user.email || 'User'} size="md" />
                <div>
                  <div className="font-medium">{user.name || '未设置昵称'}</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">{user.email || '无邮箱'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={user.apiKeyStatus === 'valid' ? 'green' : 'default'}>
                  {user.apiKeyStatus === 'valid' ? '已配置 Key' : '未配置'}
                </Badge>
                <Badge variant={user.subscription?.plan === 'PRO_PLUS' ? 'amber' : user.subscription?.plan === 'PRO' ? 'blue' : 'default'}>
                  {user.subscription?.plan || 'FREE'}
                </Badge>
                <Badge variant="default">{user.role}</Badge>
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => { setPage(p => p - 1); loadUsers(); }}>
            上一页
          </Button>
          <span className="px-3 py-1.5 text-sm text-[var(--color-text-secondary)]">
            第 {page} / {Math.ceil(total / 20)} 页
          </span>
          <Button variant="secondary" size="sm" disabled={page >= Math.ceil(total / 20)} onClick={() => { setPage(p => p + 1); loadUsers(); }}>
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}
