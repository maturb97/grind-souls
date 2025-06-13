export const GAME_CONFIG = {
  // XP Formula: Base XP * Priority Multiplier * Difficulty Multiplier
  xp: {
    base: {
      trivial: 5,
      easy: 15,
      medium: 35,
      hard: 70,
      impossible: 150
    },
    priorityMultiplier: {
      normal: 1.0,
      high: 1.5
    },
    // Level XP Requirements: Inspired by Dark Souls but scaled for productivity
    // Formula: Math.floor(level * (level + 1) * 15)
    levelRequirements: (level: number) => Math.floor(level * (level + 1) * 15),
    
    // Lower level areas get bonus XP to encourage balance
    levelBoostThreshold: 3, // If 3+ levels below highest area
    levelBoostMultiplier: 1.2 // 20% bonus XP
  },
  
  // Currency earned from XP (Souls currency)
  currency: {
    // Currency = XP / divisor (rounded up)
    xpToCurrencyDivisor: 4,
    
    // Rare quest bonuses
    rareQuestChance: 0.03, // 3% chance
    rareQuestMultiplier: 2.0 // Double currency and XP
  },
  
  // Default life areas inspired by Dark Souls
  defaultLifeAreas: [
    {
      id: 'vitality',
      name: 'Vitality',
      description: 'Health, fitness, and physical wellbeing',
      icon: '❤️',
      color: '#ef4444'
    },
    {
      id: 'attunement',
      name: 'Attunement',
      description: 'Focus, meditation, and mindfulness',
      icon: '🧘',
      color: '#8b5cf6'
    },
    {
      id: 'endurance',
      name: 'Endurance',
      description: 'Energy, stamina, and perseverance',
      icon: '⚡',
      color: '#f59e0b'
    },
    {
      id: 'strength',
      name: 'Strength',
      description: 'Physical goals and challenges',
      icon: '💪',
      color: '#dc2626'
    },
    {
      id: 'dexterity',
      name: 'Dexterity',
      description: 'Skills, hobbies, and craftsmanship',
      icon: '🎯',
      color: '#059669'
    },
    {
      id: 'resistance',
      name: 'Resistance',
      description: 'Stress management and resilience',
      icon: '🛡️',
      color: '#6366f1'
    },
    {
      id: 'intelligence',
      name: 'Intelligence',
      description: 'Learning, reading, and knowledge',
      icon: '📚',
      color: '#0891b2'
    },
    {
      id: 'faith',
      name: 'Faith',
      description: 'Relationships and personal beliefs',
      icon: '🤝',
      color: '#be185d'
    }
  ],
  
  // Default quest tags
  defaultTags: [
    'work', 'personal', 'health', 'learning', 'creative',
    'urgent', 'important', 'routine', 'project', 'social'
  ],
  
  // Suggested reward prices based on average earnings
  suggestedRewardPrices: {
    small: 50,   // Coffee, snack
    medium: 150, // Movie, treat
    large: 500,  // Dinner out, new item
    major: 1500  // Weekend activity, significant purchase
  },
  
  // Data retention
  dataRetention: {
    completedQuestsDays: null, // Keep all completed quests
    maxStorageMB: 100 // Alert if approaching limit
  }
} as const;

export type Difficulty = keyof typeof GAME_CONFIG.xp.base;
export type Priority = keyof typeof GAME_CONFIG.xp.priorityMultiplier;
export type RecurrenceType = 'daily' | 'weekly' | 'monthly';