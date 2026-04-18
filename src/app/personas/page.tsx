import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/misc';
import { Avatar } from '@/components/ui/misc';
import { getAllPersonas } from '@/lib/personas';
import { DOMAIN_COLORS } from '@/lib/constants';

export const metadata = {
  title: '人物档案馆 — Prismatic Pro',
};

export default function PersonasPage() {
  const personas = getAllPersonas();
  const byDomain = personas.reduce<Record<string, typeof personas>>((acc, p) => {
    for (const d of p.domain) {
      if (!acc[d]) acc[d] = [];
      acc[d].push(p);
    }
    return acc;
  }, {});

  const domainOrder = ['philosophy', 'business', 'technology', 'science', 'history'];

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">人物档案馆</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">
          与人类历史上最伟大的灵魂对话 — {personas.length} 位思想家
        </p>
      </div>

      {domainOrder.filter(d => byDomain[d]).map(domain => (
        <section key={domain} className="mb-12">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: DOMAIN_COLORS[domain] || '#9A9AAF' }}
            />
            {domain.charAt(0).toUpperCase() + domain.slice(1)}
            <Badge variant="default">{byDomain[domain].length}</Badge>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {byDomain[domain].map(persona => (
              <Link key={persona.id} href={`/personas/${persona.id}`}>
                <Card
                  variant="default"
                  className="p-5 cursor-pointer hover:border-[var(--color-border-amber)] transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <Avatar
                      name={persona.name}
                      size="lg"
                      ring
                      domainColor={DOMAIN_COLORS[domain]}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold group-hover:text-[var(--color-prism-amber)] transition-colors">
                          {persona.name}
                        </h3>
                        {persona.level > 0 && (
                          <Badge variant="amber">Level {persona.level}</Badge>
                        )}
                      </div>
                      {persona.nameZh && (
                        <div className="text-sm text-[var(--color-text-secondary)]">{persona.nameZh}</div>
                      )}
                      <p className="text-sm text-[var(--color-text-tertiary)] mt-1 line-clamp-2">
                        {persona.shortBio}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {persona.mentalModels.slice(0, 2).map(m => (
                          <span
                            key={m}
                            className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <div className="text-center py-8">
        <p className="text-[var(--color-text-tertiary)] text-sm">
          更多人物持续更新中 · 订阅 Pro+ 解锁全部人物
        </p>
      </div>
    </main>
  );
}
