'use client';

import { useState } from 'react';

export default function SubscriptionsPage() {
  const [page] = useState(1);
  const [pageSize] = useState(20);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">订阅管理</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-8">
        管理用户订阅计划与账单
      </p>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <div className="text-2xl font-bold text-[var(--color-prism-amber)]">0</div>
          <div className="text-sm text-[var(--color-text-secondary)]">活跃订阅</div>
        </div>
        <div className="flex-1 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">0</div>
          <div className="text-sm text-[var(--color-text-secondary)]">Pro 订阅</div>
        </div>
        <div className="flex-1 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">¥0</div>
          <div className="text-sm text-[var(--color-text-secondary)]">月度收入</div>
        </div>
        <div className="flex-1 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">0%</div>
          <div className="text-sm text-[var(--color-text-secondary)]">流失率</div>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-base)]">
              <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium">用户</th>
              <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium">计划</th>
              <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium">状态</th>
              <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium">开始日期</th>
              <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium">到期日期</th>
              <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[var(--color-border-subtle)]">
              <td colSpan={6} className="px-4 py-12 text-center text-[var(--color-text-tertiary)]">
                暂无订阅数据 — 用户可通过 Stripe 完成首次订阅
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
        <span>显示第 {(page - 1) * pageSize + 1}–{page * pageSize} 条，共 0 条</span>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded border border-[var(--color-border)] opacity-50 cursor-not-allowed" disabled>上一页</button>
          <button className="px-3 py-1.5 rounded border border-[var(--color-border)] opacity-50 cursor-not-allowed" disabled>下一页</button>
        </div>
      </div>
    </div>
  );
}
