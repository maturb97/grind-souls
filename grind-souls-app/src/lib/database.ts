import Dexie, { Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';
import { 
  User, 
  LifeArea, 
  Quest, 
  Subtask, 
  Milestone, 
  Reward, 
  Achievement, 
  UserStats
} from '@/types';
import { GAME_CONFIG } from '@/config/gameConfig';

export class GrindSoulsDB extends Dexie {
  users!: Table<User>;
  lifeAreas!: Table<LifeArea>;
  quests!: Table<Quest>;
  subtasks!: Table<Subtask>;
  milestones!: Table<Milestone>;
  rewards!: Table<Reward>;
  achievements!: Table<Achievement>;
  userStats!: Table<UserStats>;

  constructor() {
    super('GrindSoulsDB');
    
    this.version(1).stores({
      users: 'id, name, createdAt, lastActiveAt',
      lifeAreas: 'id, name, level, totalXP, isCustom, createdAt, updatedAt',
      quests: 'id, title, difficulty, priority, lifeAreaId, isCompleted, completedAt, createdAt, updatedAt, dueDate, [lifeAreaId+isCompleted]',
      subtasks: 'id, questId, title, difficulty, priority, isCompleted, completedAt, createdAt, updatedAt',
      milestones: 'id, questId, title, isCompleted, completedAt, targetDate, createdAt, updatedAt',
      rewards: 'id, name, cost, category, isCustom, isPurchased, purchasedAt, createdAt, updatedAt',
      achievements: 'id, name, type, isUnlocked, unlockedAt',
      userStats: 'id, userId, date, questsCompleted, xpEarned, currencyEarned, streakDays'
    });

    // Version 2: Add isActive field to lifeAreas
    this.version(2).stores({
      users: 'id, name, createdAt, lastActiveAt',
      lifeAreas: 'id, name, level, totalXP, isCustom, isActive, createdAt, updatedAt',
      quests: 'id, title, difficulty, priority, lifeAreaId, isCompleted, completedAt, createdAt, updatedAt, dueDate, [lifeAreaId+isCompleted]',
      subtasks: 'id, questId, title, difficulty, priority, isCompleted, completedAt, createdAt, updatedAt',
      milestones: 'id, questId, title, isCompleted, completedAt, targetDate, createdAt, updatedAt',
      rewards: 'id, name, cost, category, isCustom, isPurchased, purchasedAt, createdAt, updatedAt',
      achievements: 'id, name, type, isUnlocked, unlockedAt',
      userStats: 'id, userId, date, questsCompleted, xpEarned, currencyEarned, streakDays'
    }).upgrade(async tx => {
      // Set all existing life areas as active by default
      await tx.table('lifeAreas').toCollection().modify((lifeArea: Partial<LifeArea>) => {
        lifeArea.isActive = true;
      });
    });

    // Hooks for automatic timestamp updates
    this.lifeAreas.hook('creating', (primKey, obj) => {
      obj.id = obj.id || uuidv4();
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
      obj.syncId = uuidv4();
    });

    this.lifeAreas.hook('updating', (modifications) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (modifications as any).updatedAt = new Date();
    });

    this.quests.hook('creating', (primKey, obj) => {
      obj.id = obj.id || uuidv4();
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
      obj.syncId = uuidv4();
      
      // Calculate XP and currency rewards
      const baseXP = GAME_CONFIG.xp.base[obj.difficulty];
      const priorityMultiplier = GAME_CONFIG.xp.priorityMultiplier[obj.priority];
      obj.xpReward = Math.floor(baseXP * priorityMultiplier);
      obj.currencyReward = Math.ceil(obj.xpReward / GAME_CONFIG.currency.xpToCurrencyDivisor);
      obj.wasRareQuest = false;
    });

    this.quests.hook('updating', (modifications) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (modifications as any).updatedAt = new Date();
    });

    this.subtasks.hook('creating', (primKey, obj) => {
      obj.id = obj.id || uuidv4();
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
      obj.syncId = uuidv4();
      
      // Calculate XP and currency rewards for subtasks
      const baseXP = GAME_CONFIG.xp.base[obj.difficulty];
      const priorityMultiplier = GAME_CONFIG.xp.priorityMultiplier[obj.priority];
      obj.xpReward = Math.floor((baseXP * priorityMultiplier) * 0.3); // Subtasks give 30% of normal XP
      obj.currencyReward = Math.ceil(obj.xpReward / GAME_CONFIG.currency.xpToCurrencyDivisor);
    });

    this.subtasks.hook('updating', (modifications) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (modifications as any).updatedAt = new Date();
    });

    this.rewards.hook('creating', (primKey, obj) => {
      obj.id = obj.id || uuidv4();
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.rewards.hook('updating', (modifications) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (modifications as any).updatedAt = new Date();
    });
  }

  async initializeDefaultData() {
    const existingUser = await this.users.limit(1).first();
    if (existingUser) return; // Already initialized

    // Create default user
    const userId = uuidv4();
    await this.users.add({
      id: userId,
      name: 'Chosen Undead',
      totalXP: 0,
      totalCurrency: 0,
      weekStartsOnSunday: true,
      createdAt: new Date(),
      lastActiveAt: new Date()
    });

    // Create default life areas
    const lifeAreas = GAME_CONFIG.defaultLifeAreas.map(area => ({
      ...area,
      level: 1,
      currentXP: 0,
      totalXP: 0,
      isCustom: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await this.lifeAreas.bulkAdd(lifeAreas);

    // Create some default rewards
    const defaultRewards = [
      {
        id: uuidv4(),
        name: 'Coffee Break',
        description: 'Enjoy a premium coffee',
        cost: GAME_CONFIG.suggestedRewardPrices.small,
        category: 'food',
        isCustom: false,
        isPurchased: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Movie Night',
        description: 'Watch a movie of your choice',
        cost: GAME_CONFIG.suggestedRewardPrices.medium,
        category: 'entertainment',
        isCustom: false,
        isPurchased: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Dinner Out',
        description: 'Treat yourself to a nice dinner',
        cost: GAME_CONFIG.suggestedRewardPrices.large,
        category: 'food',
        isCustom: false,
        isPurchased: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await this.rewards.bulkAdd(defaultRewards);
  }
}

export const db = new GrindSoulsDB();