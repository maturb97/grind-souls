import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/database';
import { 
  User, 
  LifeArea, 
  Quest, 
  Subtask, 
  Reward 
} from '@/types';
import { GAME_CONFIG } from '@/config/gameConfig';
import { shouldResetRecurringQuest, getNextResetDate } from '@/lib/recurringUtils';

interface GameState {
  // User data
  user: User | null;
  lifeAreas: LifeArea[];
  quests: Quest[];
  subtasks: Subtask[];
  rewards: Reward[];
  
  // UI state
  isLoading: boolean;
  selectedLifeArea: string | null;
  
  // Actions
  initializeApp: () => Promise<void>;
  
  // Quest actions
  createQuest: (quest: Partial<Quest>) => Promise<void>;
  updateQuest: (id: string, updates: Partial<Quest>) => Promise<void>;
  completeQuest: (id: string) => Promise<void>;
  deleteQuest: (id: string) => Promise<void>;
  
  // Subtask actions
  createSubtask: (subtask: Partial<Subtask>) => Promise<void>;
  updateSubtask: (id: string, updates: Partial<Subtask>) => Promise<void>;
  completeSubtask: (id: string) => Promise<void>;
  deleteSubtask: (id: string) => Promise<void>;
  
  // Life area actions
  createLifeArea: (lifeArea: Partial<LifeArea>) => Promise<void>;
  updateLifeArea: (id: string, updates: Partial<LifeArea>) => Promise<void>;
  deleteLifeArea: (id: string) => Promise<void>;
  
  // Reward actions
  createReward: (reward: Partial<Reward>) => Promise<void>;
  purchaseReward: (id: string) => Promise<void>;
  deleteReward: (id: string) => Promise<void>;
  
  // Utility actions
  calculateLevelProgress: (lifeAreaId: string) => { current: number; required: number; percentage: number };
  getOverdueQuests: () => Quest[];
  refreshData: () => Promise<void>;
  
  // Recurring quest actions
  checkAndResetRecurringQuests: () => Promise<void>;
  completeRecurringQuest: (id: string) => Promise<void>;
}

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        lifeAreas: [],
        quests: [],
        subtasks: [],
        rewards: [],
        isLoading: false,
        selectedLifeArea: null,

        // Initialize app
        initializeApp: async () => {
          set({ isLoading: true });
          try {
            await db.initializeDefaultData();
            await get().refreshData();
            await get().checkAndResetRecurringQuests();
          } catch (error) {
            console.error('Failed to initialize app:', error);
          } finally {
            set({ isLoading: false });
          }
        },

        // Refresh all data from database
        refreshData: async () => {
          try {
            const [user, lifeAreas, quests, subtasks, rewards] = await Promise.all([
              db.users.limit(1).first(),
              db.lifeAreas.orderBy('name').toArray(),
              db.quests.orderBy('createdAt').reverse().toArray(),
              db.subtasks.orderBy('createdAt').toArray(),
              db.rewards.orderBy('name').toArray()
            ]);

            set({
              user: user || null,
              lifeAreas,
              quests,
              subtasks,
              rewards
            });
          } catch (error) {
            console.error('Failed to refresh data:', error);
          }
        },

        // Quest actions
        createQuest: async (questData) => {
          try {
            const quest: Quest = {
              id: uuidv4(),
              title: questData.title || '',
              description: questData.description,
              difficulty: questData.difficulty || 'easy',
              priority: questData.priority || 'normal',
              lifeAreaId: questData.lifeAreaId || '',
              tags: questData.tags || [],
              isCompleted: false,
              completedSubtasks: 0,
              totalSubtasks: 0,
              xpReward: 0, // Will be calculated by database hook
              currencyReward: 0, // Will be calculated by database hook
              wasRareQuest: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              dueDate: questData.dueDate,
              recurrence: questData.recurrence
            };

            await db.quests.add(quest);
            await get().refreshData();
          } catch (error) {
            console.error('Failed to create quest:', error);
          }
        },

        updateQuest: async (id, updates) => {
          try {
            await db.quests.update(id, updates);
            await get().refreshData();
          } catch (error) {
            console.error('Failed to update quest:', error);
          }
        },

        completeQuest: async (id) => {
          try {
            const quest = await db.quests.get(id);
            if (!quest || quest.isCompleted) return;

            // Check for rare quest bonus
            const isRareQuest = Math.random() < GAME_CONFIG.currency.rareQuestChance;
            const multiplier = isRareQuest ? GAME_CONFIG.currency.rareQuestMultiplier : 1;

            // Calculate final rewards
            let finalXP = quest.xpReward * multiplier;
            let finalCurrency = quest.currencyReward * multiplier;

            // Check for level boost bonus
            const { lifeAreas, user } = get();
            const currentLifeArea = lifeAreas.find(la => la.id === quest.lifeAreaId);
            if (currentLifeArea && user) {
              const maxLevel = Math.max(...lifeAreas.map(la => la.level));
              const levelDifference = maxLevel - currentLifeArea.level;
              
              if (levelDifference >= GAME_CONFIG.xp.levelBoostThreshold) {
                finalXP *= GAME_CONFIG.xp.levelBoostMultiplier;
                finalCurrency *= GAME_CONFIG.xp.levelBoostMultiplier;
              }
            }

            // Update quest
            await db.quests.update(id, {
              isCompleted: true,
              completedAt: new Date(),
              wasRareQuest: isRareQuest,
              xpReward: Math.floor(finalXP),
              currencyReward: Math.floor(finalCurrency)
            });

            // Update user totals
            if (user) {
              await db.users.update(user.id, {
                totalXP: user.totalXP + Math.floor(finalXP),
                totalCurrency: user.totalCurrency + Math.floor(finalCurrency),
                lastActiveAt: new Date()
              });
            }

            // Update life area
            if (currentLifeArea) {
              const newTotalXP = currentLifeArea.totalXP + Math.floor(finalXP);
              const nextLevelXP = GAME_CONFIG.xp.levelRequirements(currentLifeArea.level + 1);
              
              let newLevel = currentLifeArea.level;
              let newCurrentXP = currentLifeArea.currentXP + Math.floor(finalXP);
              
              // Level up logic
              while (newCurrentXP >= nextLevelXP) {
                newCurrentXP -= nextLevelXP;
                newLevel++;
              }

              await db.lifeAreas.update(currentLifeArea.id, {
                level: newLevel,
                currentXP: newCurrentXP,
                totalXP: newTotalXP,
                updatedAt: new Date()
              });
            }

            await get().refreshData();
          } catch (error) {
            console.error('Failed to complete quest:', error);
          }
        },

        deleteQuest: async (id) => {
          try {
            // Delete associated subtasks
            await db.subtasks.where('questId').equals(id).delete();
            await db.quests.delete(id);
            await get().refreshData();
          } catch (error) {
            console.error('Failed to delete quest:', error);
          }
        },

        // Subtask actions
        createSubtask: async (subtaskData) => {
          try {
            const subtask: Subtask = {
              id: uuidv4(),
              questId: subtaskData.questId || '',
              title: subtaskData.title || '',
              description: subtaskData.description,
              difficulty: subtaskData.difficulty || 'easy',
              priority: subtaskData.priority || 'normal',
              isCompleted: false,
              xpReward: 0, // Will be calculated by database hook
              currencyReward: 0, // Will be calculated by database hook
              createdAt: new Date(),
              updatedAt: new Date()
            };

            await db.subtasks.add(subtask);
            
            // Update parent quest's total subtasks count
            const quest = await db.quests.get(subtask.questId);
            if (quest) {
              await db.quests.update(quest.id, {
                totalSubtasks: quest.totalSubtasks + 1
              });
            }

            await get().refreshData();
          } catch (error) {
            console.error('Failed to create subtask:', error);
          }
        },

        updateSubtask: async (id, updates) => {
          try {
            await db.subtasks.update(id, updates);
            await get().refreshData();
          } catch (error) {
            console.error('Failed to update subtask:', error);
          }
        },

        completeSubtask: async (id) => {
          try {
            const subtask = await db.subtasks.get(id);
            if (!subtask || subtask.isCompleted) return;

            await db.subtasks.update(id, {
              isCompleted: true,
              completedAt: new Date()
            });

            // Update parent quest's completed subtasks count
            const quest = await db.quests.get(subtask.questId);
            if (quest) {
              const newCompletedCount = quest.completedSubtasks + 1;
              await db.quests.update(quest.id, {
                completedSubtasks: newCompletedCount
              });

              // If all subtasks are completed, complete the parent quest
              if (newCompletedCount >= quest.totalSubtasks && quest.totalSubtasks > 0) {
                await get().completeQuest(quest.id);
              }
            }

            await get().refreshData();
          } catch (error) {
            console.error('Failed to complete subtask:', error);
          }
        },

        deleteSubtask: async (id) => {
          try {
            const subtask = await db.subtasks.get(id);
            if (!subtask) return;

            await db.subtasks.delete(id);

            // Update parent quest's total subtasks count
            const quest = await db.quests.get(subtask.questId);
            if (quest) {
              const newTotal = Math.max(0, quest.totalSubtasks - 1);
              const newCompleted = subtask.isCompleted 
                ? Math.max(0, quest.completedSubtasks - 1)
                : quest.completedSubtasks;

              await db.quests.update(quest.id, {
                totalSubtasks: newTotal,
                completedSubtasks: Math.min(newCompleted, newTotal)
              });
            }

            await get().refreshData();
          } catch (error) {
            console.error('Failed to delete subtask:', error);
          }
        },

        // Life area actions
        createLifeArea: async (lifeAreaData) => {
          try {
            const lifeArea: LifeArea = {
              id: uuidv4(),
              name: lifeAreaData.name || '',
              description: lifeAreaData.description || '',
              icon: lifeAreaData.icon || '⭐',
              color: lifeAreaData.color || '#6366f1',
              level: 1,
              currentXP: 0,
              totalXP: 0,
              isCustom: true,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            await db.lifeAreas.add(lifeArea);
            await get().refreshData();
          } catch (error) {
            console.error('Failed to create life area:', error);
          }
        },

        updateLifeArea: async (id, updates) => {
          try {
            await db.lifeAreas.update(id, updates);
            await get().refreshData();
          } catch (error) {
            console.error('Failed to update life area:', error);
          }
        },

        deleteLifeArea: async (id) => {
          try {
            // Check if there are active quests using this life area
            const activeQuestsUsingArea = await db.quests.where('lifeAreaId').equals(id).and(quest => !quest.isCompleted).count();
            if (activeQuestsUsingArea > 0) {
              throw new Error(`Cannot delete life area: ${activeQuestsUsingArea} active quests are still using it. Complete or delete the quests first.`);
            }
            
            // Only allow deletion of custom life areas
            const lifeArea = await db.lifeAreas.get(id);
            if (lifeArea && !lifeArea.isCustom) {
              throw new Error('Cannot delete default life areas. You can deactivate them instead.');
            }
            
            await db.lifeAreas.delete(id);
            await get().refreshData();
          } catch (error) {
            console.error('Failed to delete life area:', error);
            throw error; // Re-throw to show user the error message
          }
        },

        // Reward actions
        createReward: async (rewardData) => {
          try {
            const reward: Reward = {
              id: uuidv4(),
              name: rewardData.name || '',
              description: rewardData.description,
              cost: rewardData.cost || GAME_CONFIG.suggestedRewardPrices.medium,
              category: rewardData.category || 'custom',
              isCustom: true,
              isPurchased: false,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            await db.rewards.add(reward);
            await get().refreshData();
          } catch (error) {
            console.error('Failed to create reward:', error);
          }
        },

        purchaseReward: async (id) => {
          try {
            const { user, rewards } = get();
            const reward = rewards.find(r => r.id === id);
            
            if (!reward || !user || reward.isPurchased) return;
            if (user.totalCurrency < reward.cost) return; // Insufficient currency

            // Deduct currency and mark reward as purchased
            await db.users.update(user.id, {
              totalCurrency: user.totalCurrency - reward.cost
            });

            await db.rewards.update(id, {
              isPurchased: true,
              purchasedAt: new Date()
            });

            await get().refreshData();
          } catch (error) {
            console.error('Failed to purchase reward:', error);
          }
        },

        deleteReward: async (id) => {
          try {
            await db.rewards.delete(id);
            await get().refreshData();
          } catch (error) {
            console.error('Failed to delete reward:', error);
          }
        },

        // Utility functions
        calculateLevelProgress: (lifeAreaId) => {
          const { lifeAreas } = get();
          const lifeArea = lifeAreas.find(la => la.id === lifeAreaId);
          
          if (!lifeArea) {
            return { current: 0, required: 0, percentage: 0 };
          }

          const current = lifeArea.currentXP;
          const required = GAME_CONFIG.xp.levelRequirements(lifeArea.level + 1);
          const percentage = Math.min((current / required) * 100, 100);

          return { current, required, percentage };
        },

        getOverdueQuests: () => {
          const { quests } = get();
          const now = new Date();
          
          return quests.filter(quest => 
            !quest.isCompleted && 
            quest.dueDate && 
            new Date(quest.dueDate) < now
          );
        },

        // Recurring quest functions
        checkAndResetRecurringQuests: async () => {
          try {
            const { quests, user } = get();
            const recurringQuests = quests.filter(q => q.recurrence && q.recurrence.isActive);
            
            for (const quest of recurringQuests) {
              if (shouldResetRecurringQuest(quest)) {
                const newNextReset = getNextResetDate(
                  quest.recurrence!.type, 
                  user?.weekStartsOnSunday ?? true
                );
                
                // Check if quest was completed this period
                const wasCompleted = quest.recurrence!.completedCount >= quest.recurrence!.targetCount;
                const newStreak = wasCompleted ? quest.recurrence!.streak + 1 : 0;
                
                // Reset the quest for new period
                await db.quests.update(quest.id, {
                  recurrence: {
                    ...quest.recurrence!,
                    completedCount: 0,
                    lastReset: new Date(),
                    nextReset: newNextReset,
                    streak: newStreak
                  },
                  isCompleted: false,
                  completedAt: undefined
                });
              }
            }
            
            await get().refreshData();
          } catch (error) {
            console.error('Failed to reset recurring quests:', error);
          }
        },

        completeRecurringQuest: async (id) => {
          try {
            const quest = await db.quests.get(id);
            if (!quest || !quest.recurrence) return;

            const newCompletedCount = quest.recurrence.completedCount + 1;
            const isFullyCompleted = newCompletedCount >= quest.recurrence.targetCount;

            // Calculate XP/currency rewards (same as regular quest completion)
            const isRareQuest = Math.random() < GAME_CONFIG.currency.rareQuestChance;
            const multiplier = isRareQuest ? GAME_CONFIG.currency.rareQuestMultiplier : 1;

            let finalXP = quest.xpReward * multiplier;
            let finalCurrency = quest.currencyReward * multiplier;

            // Check for level boost bonus
            const { lifeAreas, user } = get();
            const currentLifeArea = lifeAreas.find(la => la.id === quest.lifeAreaId);
            if (currentLifeArea && user) {
              const maxLevel = Math.max(...lifeAreas.map(la => la.level));
              const levelDifference = maxLevel - currentLifeArea.level;
              
              if (levelDifference >= GAME_CONFIG.xp.levelBoostThreshold) {
                finalXP *= GAME_CONFIG.xp.levelBoostMultiplier;
                finalCurrency *= GAME_CONFIG.xp.levelBoostMultiplier;
              }
            }

            // Update quest with new completion count
            await db.quests.update(id, {
              recurrence: {
                ...quest.recurrence,
                completedCount: newCompletedCount
              },
              isCompleted: isFullyCompleted,
              completedAt: isFullyCompleted ? new Date() : undefined,
              wasRareQuest: isRareQuest,
              xpReward: Math.floor(finalXP),
              currencyReward: Math.floor(finalCurrency)
            });

            // Award XP and currency
            if (user) {
              await db.users.update(user.id, {
                totalXP: user.totalXP + Math.floor(finalXP),
                totalCurrency: user.totalCurrency + Math.floor(finalCurrency),
                lastActiveAt: new Date()
              });
            }

            // Update life area
            if (currentLifeArea) {
              const newTotalXP = currentLifeArea.totalXP + Math.floor(finalXP);
              const nextLevelXP = GAME_CONFIG.xp.levelRequirements(currentLifeArea.level + 1);
              
              let newLevel = currentLifeArea.level;
              let newCurrentXP = currentLifeArea.currentXP + Math.floor(finalXP);
              
              // Level up logic
              while (newCurrentXP >= nextLevelXP) {
                newCurrentXP -= nextLevelXP;
                newLevel++;
              }

              await db.lifeAreas.update(currentLifeArea.id, {
                level: newLevel,
                currentXP: newCurrentXP,
                totalXP: newTotalXP,
                updatedAt: new Date()
              });
            }

            await get().refreshData();
          } catch (error) {
            console.error('Failed to complete recurring quest:', error);
          }
        }
      }),
      {
        name: 'grind-souls-storage',
        partialize: (state) => ({
          selectedLifeArea: state.selectedLifeArea
        })
      }
    )
  )
);