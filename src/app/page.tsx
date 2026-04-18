import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MODES = [
  {
    id: 'solo',
    name: 'Solo 对话',
    nameZh: '独思',
    description: '与单一思想家深度对话，专注理解其独特视角',
    icon: '💭',
    color: '#D4A853',
    level: 0,
  },
  {
    id: 'prism',
    name: 'Prism 折射',
    nameZh: '折射',
    description: '多视角同时呈现，看到同一问题的不同解答',
    icon: '🌈',
    color: '#7CA1D4',
    level: 0,
  },
  {
    id: 'roundtable',
    name: 'Roundtable 圆桌',
    nameZh: '圆桌',
    description: '多位思想家围坐，共议一个话题，碰撞智慧',
    icon: '🎭',
    color: '#82C49A',
    level: 1,
  },
  {
    id: 'epoch',
    name: 'Epoch 时代',
    nameZh: '时代',
    description: '跨时代思想对决，让不同时代的巨人辩论同一问题',
    icon: '⚔️',
    color: '#D48282',
    level: 2,
  },
];

const FEATURED_PERSONAS = [
  { id: 'confucius', name: '孔子', domain: '哲学', color: '#C4A882' },
  { id: 'elon-musk', name: '马斯克', domain: '科技/商业', color: '#7CA1D4' },
  { id: 'charlie-munger', name: '芒格', domain: '投资/心理', color: '#82C49A' },
  { id: 'socrates', name: '苏格拉底', domain: '哲学', color: '#D482C4' },
  { id: 'richard-feynman', name: '费曼', domain: '科学', color: '#D4A87C' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        {/* Ambient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #D4A853 0%, transparent 70%)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-8 blur-3xl" style={{ background: 'radial-gradient(circle, #7CA1D4 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-[var(--color-border-amber)] text-[var(--color-prism-amber)] bg-[var(--color-prism-amber-glow)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-prism-amber)] animate-pulse" />
            Prismatic Pro — 重塑智识工具
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            借
            <span className="glow-text-amber text-[var(--color-prism-amber)]">卓越灵魂</span>
            之力
            <br />
            做更明智的决策
          </h1>

          <p className="text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed">
            与历史上最伟大的思想家对话——哲学家、投资大师、科学家、创业者。
            用他们的智慧，照亮你的决策之路。
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Link href="/chat">
              <Button size="lg" className="text-base px-8">
                开始对话
                <span className="ml-2">→</span>
              </Button>
            </Link>
            <Link href="/personas">
              <Button variant="outline" size="lg" className="text-base">
                探索人物档案馆
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Modes ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold">对话模式</h2>
          <p className="text-[var(--color-text-secondary)] mt-2">选择你的探索方式</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODES.map((mode, i) => (
            <Card
              key={mode.id}
              variant="default"
              className={`p-6 cursor-pointer hover:border-[var(--color-border-amber)] transition-all animate-fade-in-up stagger-${i + 1}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: `${mode.color}15`, border: `1px solid ${mode.color}30` }}
                >
                  {mode.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{mode.name}</h3>
                    {mode.level > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]">
                        Level {mode.level}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">{mode.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Featured Personas ── */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">思想家档案馆</h2>
          <p className="text-[var(--color-text-secondary)] mt-2">与人类历史上最伟大的灵魂对话</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {FEATURED_PERSONAS.map((persona, i) => (
            <Link key={persona.id} href={`/personas/${persona.id}`}>
              <Card
                variant="default"
                className={`p-4 text-center cursor-pointer hover:border-[var(--color-border-amber)] transition-all animate-fade-in-up stagger-${i + 1}`}
              >
                <div
                  className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-xl font-bold mb-3"
                  style={{ background: `${persona.color}15`, border: `1px solid ${persona.color}30`, color: persona.color }}
                >
                  {persona.name[0]}
                </div>
                <div className="font-medium text-sm">{persona.name}</div>
                <div className="text-xs text-[var(--color-text-tertiary)] mt-1">{persona.domain}</div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link href="/personas">
            <Button variant="ghost" size="sm">
              查看全部人物 →
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--color-border)] py-8 mt-20">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-[var(--color-text-tertiary)]">
          <span>Prismatic Pro — 借卓越灵魂之力</span>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-[var(--color-text-secondary)] transition-colors">管理后台</Link>
            <Link href="/chat" className="hover:text-[var(--color-text-secondary)] transition-colors">开始使用</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
