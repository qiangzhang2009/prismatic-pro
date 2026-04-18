'use client';

import { useState, useEffect } from 'react';

export default function AuditPage() {
  const [logs, setLogs] = useState<unknown[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/audit?page=${page}&pageSize=50`)
      .then(r => r.json())
      .then(d => {
        setLogs(d.data ?? []);
        setTotalPages(d.pagination?.totalPages ?? 1);
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">审计日志</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-8">
        记录所有关键操作，支持合规审查
      </p>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-base)]">
              <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium">时间</th>
              <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium">用户</th>
              <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium">操作</th>
              <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium">详情</th>
              <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[var(--color-text-tertiary)]">
                  加载中...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[var(--color-text-tertiary)]">
                  暂无审计日志
                </td>
              </tr>
            ) : (
              logs.map((log: any, i: number) => (
                <tr key={i} className="border-b border-[var(--color-border-subtle)]">
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString('zh-CN') : '-'}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-primary)]">{log.userId || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded text-xs bg-[var(--color-prism-amber)]/10 text-[var(--color-prism-amber)]">
                      {log.action || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)] max-w-xs truncate">
                    {log.details || '-'}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)] font-mono text-xs">
                    {log.ipAddress || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-[var(--color-text-secondary)]">
          第 {page} / {totalPages} 页
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded border border-[var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-text-primary)]"
          >
            上一页
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded border border-[var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-text-primary)]"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
