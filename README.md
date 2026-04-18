# Prismatic Pro

借卓越灵魂之力，做更明智的决策。

## 技术栈

- **框架**: Next.js 16 (App Router) + TypeScript
- **样式**: Tailwind CSS v4 + CSS Variables
- **数据库**: Prisma + Neon PostgreSQL
- **AI**: User-Pays (用户自备 API Key)
- **认证**: Magic Link + NextAuth v5
- **支付**: Stripe (订阅)

## 快速开始

```bash
cd prismatic-pro
npm install
npx prisma generate
# 配置环境变量
npm run dev
```

## 环境变量

```bash
# .env.local
DATABASE_URL="postgresql://..."
ENCRYPTION_KEY="your-32-byte-random-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 可选：平台 DeepSeek Key（无用户 Key 时的体验回退）
PLATFORM_DEEPSEEK_KEY="sk-..."
```

## 架构

```
src/
├── app/              # Next.js App Router 页面
│   ├── (main)/chat  # 主对话页（流式输出）
│   ├── personas/     # 人物档案馆
│   ├── admin/       # 后台管理
│   └── api/         # API 路由
├── components/
│   ├── ui/          # 共享 UI 组件
│   └── admin/       # 管理组件
└── lib/
    ├── personas/    # Persona 数据层（蒸馏核心）
    ├── memory/       # 四层记忆系统
    ├── orchestrator/ # 多智能体编排器
    ├── llm/          # LLM 网关
    ├── billing/      # User-Pays 计费
    ├── game/         # 游戏化系统
    ├── analytics/    # 行为采集
    ├── admin/        # 后台管理逻辑
    └── knowledge/    # 知识图谱
```

## 关键设计

- **User-Pays**: 开发者零基础设施成本，用户自备 API Key
- **无向量检索**: Persona 核心 JSON 直接注入 Prompt
- **四层记忆**: ShortTerm → WorkingMemory → LongTerm → Crystallized
- **真实多智能体**: Sprint Pipeline (Think→Plan→Build→Review→Test→Ship)

## 订阅等级

| 等级 | 价格 | Personas | 对话模式 |
|------|------|----------|----------|
| Free | 免费 | 5个 | Solo + Prism |
| Pro | ¥30/月 | 20个 | 全部模式 |
| Pro+ | ¥80/月 | 全部 | + 蒸馏 Studio |
