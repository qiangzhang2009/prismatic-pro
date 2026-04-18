'use client';

import { useState } from 'react';

export default function PointsPage() {
  const [page] = useState(1);
  const [pageSize] = useState(20);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">点数管理</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-8">
        管理平台点数系统，用于解锁 Pro 功能
      </p>

      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <div className="text-2xl font-bold text-[var(--color-prism-amber)]">0</div>
          <div className="text-sm text-[var(--color-text-secondary)]">总点数发放</div>
        </div>
        <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">0</div>
          <div className="text-sm text-[var(--color-text-secondary)]">总点数消耗</div>
        </div>
        <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">0</div>
          <div className="text-sm text-[var(--color-text-secondary)]">活跃用户</div>
        </div>
        <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">¥0</div>
          <div className="text-sm text-[var(--color-text-secondary)]">点数充值收入</div>
        </div>
      </div>

      <div className="mb-4 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">点数规则配置</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">新用户注册奖励</span>
            <span className="text-[var(--color-text-primary)] font-mono">+100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">每日登录奖励</span>
            <span className="text-[var(--color-text-primary)] font-mono">+10</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">对话完成奖励</span>
            <span className="text-[var(--color-text-primary)] font-mono">+5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">解锁高级 Persona</span>
            <span className="text-[var(--color-text-primary)] font-mono">-50</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-base)]">
              <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium">用户</th>
              <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium">当前余额</th>
              <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium">变动</th>
              <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium">类型</th>
              <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium">时间</th>
              <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[var(--color-border-subtle)]">
              <td colSpan={6} className="px-4 py-12 text-center text-[var(--color-text-tertiary)]">
                暂无点数记录
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
