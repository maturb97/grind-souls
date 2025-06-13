import { Difficulty, Priority, RecurrenceType } from '@/config/gameConfig';

export interface User {
  id: string;
  name: string;
  totalXP: number;
  totalCurrency: number;
  weekStartsOnSunday: boolean;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface LifeArea {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  level: number;
  currentXP: number;
  totalXP: number;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Sync support
  syncId?: string;
  lastSyncAt?: Date;
}

export interface Quest {
  id: string;
  title: string;
  description?: string;
  difficulty: Difficulty;
  priority: Priority;
  lifeAreaId: string;
  tags: string[];
  
  // Progress tracking
  isCompleted: boolean;
  completedAt?: Date;
  completedSubtasks: number;
  totalSubtasks: number;
  
  // Rewards
  xpReward: number;
  currencyReward: number;
  wasRareQuest: boolean;
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  
  // Recurring
  recurrence?: {
    type: RecurrenceType;
    frequency: number; // e.g., 3 for "3 times per week"
    completedCount: number;
    lastReset: Date;
  };
  
  // Long-term quest support
  milestones?: Milestone[];
  
  // Sync support
  syncId?: string;
  lastSyncAt?: Date;
}

export interface Subtask {
  id: string;
  questId: string;
  title: string;
  description?: string;
  difficulty: Difficulty;
  priority: Priority;
  isCompleted: boolean;
  completedAt?: Date;
  xpReward: number;
  currencyReward: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Sync support
  syncId?: string;
  lastSyncAt?: Date;
}

export interface Milestone {
  id: string;
  questId: string;
  title: string;
  description?: string;
  targetDate?: Date;
  isCompleted: boolean;
  completedAt?: Date;
  xpBonus: number;
  currencyBonus: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reward {
  id: string;
  name: string;
  description?: string;
  cost: number;
  category: string;
  isCustom: boolean;
  isPurchased: boolean;
  purchasedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Sync support
  syncId?: string;
  lastSyncAt?: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'quest_count' | 'xp_milestone' | 'streak' | 'life_area_level' | 'custom';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requirement: Record<string, any>;
  isUnlocked: boolean;
  unlockedAt?: Date;
  xpReward: number;
  currencyReward: number;
}

export interface UserStats {
  id: string;
  userId: string;
  date: Date;
  questsCompleted: number;
  xpEarned: number;
  currencyEarned: number;
  lifeAreaProgress: Record<string, number>;
  streakDays: number;
}

// UI/UX Types
export interface ProgressBarProps {
  current: number;
  max: number;
  color?: string;
  showText?: boolean;
  animated?: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  overdueReminders: boolean;
  dailySummary: boolean;
  achievements: boolean;
  customTimes: {
    dailySummary: string; // HH:MM format
    overdueCheck: string;
  };
}

// Database Schema Types
export interface DatabaseSchema {
  users: User;
  lifeAreas: LifeArea;
  quests: Quest;
  subtasks: Subtask;
  milestones: Milestone;
  rewards: Reward;
  achievements: Achievement;
  userStats: UserStats;
}