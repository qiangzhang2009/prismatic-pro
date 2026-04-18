import { db } from '@/lib/db/client';
import { MASTERY_CONFIG, MAX_MASTERY } from '@/lib/constants';
import type { Achievement, DailyQuest, ConversationMode } from '@/lib/types';

// ── Mastery System ─────────────────────────────────────

export async function getOrCreateProgress(userId: string, personaId: string) {
  return db.gameProgress.upsert({
    where: { userId_personaId: { userId, personaId } },
    create: { userId, personaId },
    update: {},
  });
}

export async function updateMastery(
  userId: string,
  personaId: string,
  mode: ConversationMode,
  messageCount: number
): Promise<number> {
  const config = MASTERY_CONFIG[mode.toUpperCase() as keyof typeof MASTERY_CONFIG] || MASTERY_CONFIG.SOLO;
  const gain = config.baseGain * config.modeBonus * Math.log1p(messageCount);

  const progress = await getOrCreateProgress(userId, personaId);
  const newMastery = Math.min(MAX_MASTERY, progress.mastery + Math.round(gain));

  await db.gameProgress.update({
    where: { userId_personaId: { userId, personaId } },
    data: {
      mastery: newMastery,
      totalConversations: { increment: 1 },
      totalMessages: { increment: messageCount },
    },
  });

  // Check for milestone achievements
  await checkMilestoneAchievements(userId, personaId, newMastery);

  return newMastery;
}

// ── Achievement System ─────────────────────────────────

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-chat',
    name: 'First Steps',
    nameZh: '初次对话',
    description: 'Complete your first conversation',
    descriptionZh: '完成你的第一次对话',
    icon: '💬',
    rarity: 'common',
  },
  {
    id: 'diverse-thinker',
    name: 'Diverse Thinker',
    nameZh: '博采众长',
    description: 'Chat with 5 different personas',
    descriptionZh: '与5个不同的人物对话',
    icon: '🌐',
    rarity: 'common',
  },
  {
    id: 'master-mind',
    name: 'Master Mind',
    nameZh: '精通大师',
    description: 'Reach 80 mastery with any persona',
    descriptionZh: '任意人物掌握度达到80',
    icon: '🧠',
    rarity: 'rare',
  },
  {
    id: 'depth-seeker',
    name: 'Depth Seeker',
    nameZh: '深度探索',
    description: 'Complete a 20-turn conversation',
    descriptionZh: '完成一次20轮的对话',
    icon: '🔍',
    rarity: 'rare',
  },
  {
    id: 'debate-champion',
    name: 'Debate Champion',
    nameZh: '辩论冠军',
    description: 'Win a debate in the Arena',
    descriptionZh: '在智辩场赢得一场辩论',
    icon: '🏆',
    rarity: 'epic',
  },
  {
    id: 'prism-opener',
    name: 'Prism Opener',
    nameZh: '棱镜开启',
    description: 'Use Prism mode for the first time',
    descriptionZh: '首次使用棱镜模式',
    icon: '🌈',
    rarity: 'common',
  },
  {
    id: 'epoch-warrior',
    name: 'Epoch Warrior',
    nameZh: '时代战士',
    description: 'Survive a full Epoch debate session',
    descriptionZh: '完成一次完整时代辩论',
    icon: '⚔️',
    rarity: 'epic',
  },
  {
    id: 'legend',
    name: 'Legend',
    nameZh: '传奇',
    description: 'Max out mastery on 3 personas',
    descriptionZh: '3个人物达到满级掌握度',
    icon: '⭐',
    rarity: 'legendary',
  },
];

export async function checkMilestoneAchievements(
  userId: string,
  personaId: string,
  mastery: number
): Promise<Achievement[]> {
  const unlocked: Achievement[] = [];

  const progress = await db.gameProgress.findUnique({
    where: { userId_personaId: { userId, personaId } },
  });

  if (!progress) return unlocked;

  // Mastery milestones
  if (mastery >= 80 && !progress.achievements.includes('master-mind')) {
    const ach = ACHIEVEMENTS.find(a => a.id === 'master-mind')!;
    await unlockAchievement(userId, personaId, ach.id);
    unlocked.push(ach);
  }

  if (mastery >= MAX_MASTERY && !progress.achievements.includes('legend')) {
    const allProgress = await db.gameProgress.findMany({ where: { userId } });
    const maxed = allProgress.filter(p => p.mastery >= MAX_MASTERY);
    if (maxed.length >= 3) {
      const ach = ACHIEVEMENTS.find(a => a.id === 'legend')!;
      await unlockAchievement(userId, personaId, ach.id);
      unlocked.push(ach);
    }
  }

  return unlocked;
}

export async function unlockAchievement(
  userId: string,
  personaId: string,
  achievementId: string
): Promise<void> {
  const progress = await db.gameProgress.findUnique({
    where: { userId_personaId: { userId, personaId } },
  });

  if (!progress || progress.achievements.includes(achievementId)) return;

  await db.gameProgress.update({
    where: { userId_personaId: { userId, personaId } },
    data: { achievements: { push: achievementId } },
  });
}

export function getAllAchievements(): Achievement[] {
  return ACHIEVEMENTS;
}

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

// ── Daily Quests ─────────────────────────────────────

export function generateDailyQuests(): DailyQuest[] {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return [
    {
      id: 'daily-chat-1',
      title: 'Morning Thinking',
      titleZh: '晨间思考',
      description: 'Complete a conversation with any persona',
      descriptionZh: '与任意人物完成一次对话',
      type: 'chat',
      reward: 20,
      completed: false,
      expiresAt: today,
    },
    {
      id: 'daily-challenge',
      title: 'Intellectual Challenge',
      titleZh: '智识挑战',
      description: 'Complete an Epoch debate session',
      descriptionZh: '完成一次时代辩论',
      type: 'challenge',
      reward: 50,
      completed: false,
      expiresAt: today,
    },
    {
      id: 'daily-explore',
      title: 'New Territory',
      titleZh: '探索新领域',
      description: 'Chat with a persona you have never talked to',
      descriptionZh: '与一个新人物对话',
      type: 'explore',
      reward: 30,
      completed: false,
      expiresAt: today,
    },
  ];
}
