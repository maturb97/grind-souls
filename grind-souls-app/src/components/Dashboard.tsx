'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { QuestCreateModal } from '@/components/QuestCreateModal';
import { Quest, LifeArea } from '@/types';
import { getRecurringQuestProgress, formatRecurringDescription } from '@/lib/recurringUtils';

export function Dashboard() {
  const { 
    user, 
    lifeAreas, 
    quests, 
    isLoading,
    initializeApp,
    calculateLevelProgress,
    getOverdueQuests
  } = useGameStore();

  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  const activeQuests = quests.filter(q => !q.isCompleted && (!q.recurrence || q.recurrence.completedCount < q.recurrence.targetCount));
  const completedTodayQuests = quests.filter(q => {
    if (!q.completedAt) return false;
    const today = new Date();
    const completedDate = new Date(q.completedAt);
    return completedDate.toDateString() === today.toDateString();
  });
  const overdueQuests = getOverdueQuests();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">⚔️ Grind Souls</h1>
              {user && (
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <span className="text-blue-600 dark:text-blue-400">⚡</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{user.totalXP} XP</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-600 dark:text-yellow-400">💰</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{user.totalCurrency} Souls</span>
                  </div>
                </div>
              )}
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              + Create Quest
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quest Creation Modal */}
        <QuestCreateModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-sm">📋</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Quests</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{activeQuests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-sm">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Today</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{completedTodayQuests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 text-sm">⚠️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{overdueQuests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 text-sm">🎯</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Life Areas</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{lifeAreas.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Life Areas Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Life Areas Progress</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {lifeAreas.map((lifeArea) => {
                const progress = calculateLevelProgress(lifeArea.id);
                return (
                  <div key={lifeArea.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{lifeArea.icon}</span>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{lifeArea.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Level {lifeArea.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{lifeArea.totalXP} XP</p>
                      </div>
                    </div>
                    <ProgressBar
                      current={progress.current}
                      max={progress.required}
                      color={lifeArea.color}
                      showText={true}
                      animated={true}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Quests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Quests */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Active Quests</h2>
            </div>
            <div className="p-6">
              {activeQuests.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No active quests. Time to start your adventure!
                </p>
              ) : (
                <div className="space-y-4">
                  {activeQuests.slice(0, 5).map((quest) => (
                    <QuestCard key={quest.id} quest={quest} lifeAreas={lifeAreas} />
                  ))}
                  {activeQuests.length > 5 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      And {activeQuests.length - 5} more quests...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Completions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Completions</h2>
            </div>
            <div className="p-6">
              {completedTodayQuests.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No quests completed today yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {completedTodayQuests.slice(0, 5).map((quest) => (
                    <QuestCard key={quest.id} quest={quest} lifeAreas={lifeAreas} completed />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function QuestCard({ quest, lifeAreas, completed = false }: { quest: Quest; lifeAreas: LifeArea[]; completed?: boolean }) {
  const { completeQuest, completeRecurringQuest } = useGameStore();
  const lifeArea = lifeAreas.find(la => la.id === quest.lifeAreaId);
  const isOverdue = quest.dueDate && new Date(quest.dueDate) < new Date() && !quest.isCompleted;
  const isRecurring = !!quest.recurrence;
  const recurringProgress = isRecurring ? getRecurringQuestProgress(quest) : null;

  const difficultyColors = {
    trivial: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    hard: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    impossible: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };

  return (
    <div className={`border rounded-lg p-4 ${isOverdue ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'} ${completed ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {lifeArea && <span className="text-lg">{lifeArea.icon}</span>}
            <h3 className={`font-medium ${completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
              {quest.title}
            </h3>
            {quest.priority === 'high' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                High Priority
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[quest.difficulty]}`}>
              {quest.difficulty}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              ⚡ {quest.xpReward} XP
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              💰 {quest.currencyReward} Souls
            </span>
            {quest.wasRareQuest && (
              <span className="text-yellow-600 dark:text-yellow-400">⭐ Rare!</span>
            )}
          </div>

          {quest.totalSubtasks > 0 && (
            <div className="mt-2">
              <ProgressBar
                current={quest.completedSubtasks}
                max={quest.totalSubtasks}
                color="#6366f1"
                showText={true}
                animated={true}
              />
            </div>
          )}

          {isRecurring && recurringProgress && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  🔄 {formatRecurringDescription(quest)}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Resets in {recurringProgress.timeUntilReset}
                </span>
              </div>
              <ProgressBar
                current={recurringProgress.completed}
                max={recurringProgress.target}
                color={recurringProgress.isCompleted ? "#10b981" : "#6366f1"}
                showText={true}
                animated={true}
              />
              {quest.recurrence!.streak > 0 && (
                <div className="flex items-center mt-1 text-xs text-orange-600 dark:text-orange-400">
                  🔥 {quest.recurrence!.streak} streak
                </div>
              )}
            </div>
          )}

          {isOverdue && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-2">
              ⚠️ Overdue since {new Date(quest.dueDate!).toLocaleDateString()}
            </p>
          )}
        </div>

        {!completed && (
          <Button
            size="sm"
            onClick={() => {
              if (isRecurring) {
                completeRecurringQuest(quest.id);
              } else {
                completeQuest(quest.id);
              }
            }}
            disabled={
              (quest.totalSubtasks > 0 && quest.completedSubtasks < quest.totalSubtasks) ||
              (isRecurring && recurringProgress?.isCompleted)
            }
            className="ml-4"
          >
            {isRecurring && recurringProgress?.isCompleted ? 'Completed' : 'Complete'}
          </Button>
        )}
      </div>
    </div>
  );
}