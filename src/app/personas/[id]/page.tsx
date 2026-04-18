'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/misc';
import { Badge } from '@/components/ui/misc';
import { Button } from '@/components/ui/button';
import { getPersona } from '@/lib/personas';
import { DOMAIN_COLORS } from '@/lib/constants';

export default function PersonaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const persona = getPersona(id);

  if (!persona) return notFound();

  const domainColor = DOMAIN_COLORS[persona.domain[0]] || '#D4A853';

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/personas" className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] mb-6 inline-block">
        ← 返回档案馆
      </Link>

      {/* ── Header ── */}
      <div className="flex items-start gap-6 mb-10">
        <Avatar
          name={persona.name}
          size="xl"
          ring
          domainColor={domainColor}
        />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{persona.name}</h1>
            {persona.level > 0 && (
              <Badge variant="amber">Level {persona.level}</Badge>
            )}
          </div>
          {persona.nameZh && (
            <div className="text-lg text-[var(--color-text-secondary)]">{persona.nameZh}</div>
          )}
          <p className="text-[var(--color-text-secondary)] mt-2">{persona.shortBio}</p>
          <div className="flex gap-2 mt-3">
            {persona.domain.map(d => (
              <Badge key={d} variant="default">{d}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Core Beliefs ── */}
        <Card variant="elevated">
          <CardContent className="pt-5">
            <h2 className="text-lg font-semibold mb-4">核心信念</h2>
            <ul className="space-y-3">
              {persona.beliefs.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-[var(--color-prism-amber)] mt-1 shrink-0">—</span>
                  <span className="text-[var(--color-text-secondary)]">{b}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* ── Mental Models ── */}
        <Card variant="elevated">
          <CardContent className="pt-5">
            <h2 className="text-lg font-semibold mb-4">思维模型</h2>
            <div className="flex flex-wrap gap-2">
              {persona.mentalModels.map(m => (
                <span
                  key={m}
                  className="px-3 py-1.5 rounded-lg text-sm"
                  style={{ background: `${domainColor}15`, border: `1px solid ${domainColor}30`, color: domainColor }}
                >
                  {m}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Decision Heuristics ── */}
        <Card variant="elevated">
          <CardContent className="pt-5">
            <h2 className="text-lg font-semibold mb-4">决策启发式</h2>
            <ul className="space-y-2">
              {persona.heuristics.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-xs text-[var(--color-text-tertiary)] shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-[var(--color-text-secondary)]">{h}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* ── Communication Style ── */}
        <Card variant="elevated">
          <CardContent className="pt-5">
            <h2 className="text-lg font-semibold mb-4">表达风格</h2>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">语调</div>
                <div className="flex gap-2">
                  {[
                    { label: '正式', value: persona.expressionDNA.toneProfile.formality },
                    { label: '情感', value: persona.expressionDNA.toneProfile.emotionality },
                    { label: '直接', value: persona.expressionDNA.toneProfile.directness },
                  ].map(t => (
                    <div key={t.label} className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--color-text-secondary)]">{t.label}</span>
                        <span className="text-[var(--color-text-tertiary)]">{Math.round(t.value * 100)}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-[var(--color-bg-elevated)]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${t.value * 100}%`, background: domainColor }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {persona.expressionDNA.commonPhrases && persona.expressionDNA.commonPhrases.length > 0 && (
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">常用表达</div>
                  <div className="flex flex-wrap gap-1">
                    {persona.expressionDNA.commonPhrases.map(p => (
                      <span key={p} className="text-xs px-2 py-1 rounded bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]">
                        &quot;{p}&quot;
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Skills ── */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardContent className="pt-5">
            <h2 className="text-lg font-semibold mb-4">专业领域</h2>
            <div className="flex flex-wrap gap-2">
              {persona.skills.map(s => (
                <Badge key={s} variant="default">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── CTA ── */}
      <div className="mt-10 text-center">
        <Link href="/(main)/chat">
          <Button size="lg" className="px-12">
            与 {persona.name} 开始对话 →
          </Button>
        </Link>
      </div>
    </main>
  );
}
