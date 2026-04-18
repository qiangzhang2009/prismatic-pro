import CostDashboard from '@/components/admin/cost-dashboard';

export default function AdminCostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">运营成本测算</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          User-Pays 模式下，平台无 AI 成本，核心指标 = 订阅收入 − 固定平台成本
        </p>
      </div>
      <CostDashboard />
    </div>
  );
}
