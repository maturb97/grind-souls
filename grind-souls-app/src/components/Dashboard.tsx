'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { SimpleSidebar } from '@/components/ui/SimpleSidebar';
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <SimpleSidebar 
        user={user}
        onCreateQuest={() => setShowCreateModal(true)}
      />
      
      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8">
        {/* Quest Creation Modal */}
        <QuestCreateModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass p-6 hover-lift">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                <span className="text-blue-500 text-xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Quests</p>
                <p className="text-3xl font-bold text-foreground">{activeQuests.length}</p>
              </div>
            </div>
          </div>

          <div className="glass p-6 hover-lift">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                <span className="text-green-500 text-xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                <p className="text-3xl font-bold text-foreground">{completedTodayQuests.length}</p>
              </div>
            </div>
          </div>

          <div className="glass p-6 hover-lift">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center">
                <span className="text-red-500 text-xl">⚠️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-3xl font-bold text-foreground">{overdueQuests.length}</p>
              </div>
            </div>
          </div>

          <div className="glass p-6 hover-lift">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                <span className="text-purple-500 text-xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Life Areas</p>
                <p className="text-3xl font-bold text-foreground">{lifeAreas.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Life Areas Progress */}
        <div className="glass mb-8">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Life Areas Progress</h2>
            <p className="text-sm text-muted-foreground mt-1">Level up your character stats by completing quests</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {lifeAreas.map((lifeArea) => {
                const progress = calculateLevelProgress(lifeArea.id);
                return (
                  <div key={lifeArea.id} className="glass p-4 hover-lift">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{lifeArea.icon}</span>
                        <div>
                          <h3 className="font-semibold text-foreground">{lifeArea.name}</h3>
                          <p className="text-sm text-muted-foreground">Level {lifeArea.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{lifeArea.totalXP.toLocaleString()} XP</p>
                        <p className="text-xs text-muted-foreground">Total earned</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Progress to Level {lifeArea.level + 1}</span>
                        <span className="font-medium text-foreground">{Math.round(progress.percentage)}%</span>
                      </div>
                      <ProgressBar
                        current={progress.current}
                        max={progress.required}
                        color={lifeArea.color}
                        showText={false}
                        animated={false}
                      />
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground p-3 bg-white/30 rounded-xl border border-gray-200/30">
                        {lifeArea.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Quests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Quests */}
          <div className="glass">
            <div className="px-6 py-5 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Active Quests</h2>
              <p className="text-sm text-muted-foreground mt-1">Your current adventures</p>
            </div>
            <div className="p-6">
              {activeQuests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚔️</div>
                  <p className="text-muted-foreground font-medium mb-2">No active quests</p>
                  <p className="text-sm text-muted-foreground">Time to start your adventure!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeQuests.slice(0, 5).map((quest) => (
                    <QuestCard key={quest.id} quest={quest} lifeAreas={lifeAreas} />
                  ))}
                  {activeQuests.length > 5 && (
                    <div className="text-center pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        And {activeQuests.length - 5} more quests...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Completions */}
          <div className="glass">
            <div className="px-6 py-5 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Recent Completions</h2>
              <p className="text-sm text-muted-foreground mt-1">Today&apos;s victories</p>
            </div>
            <div className="p-6">
              {completedTodayQuests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏆</div>
                  <p className="text-muted-foreground font-medium mb-2">No completions today</p>
                  <p className="text-sm text-muted-foreground">Complete your first quest!</p>
                </div>
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
      </div>
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
    trivial: 'bg-gray-100 text-gray-600 border border-gray-200',
    easy: 'bg-green-100 text-green-600 border border-green-200',
    medium: 'bg-yellow-100 text-yellow-600 border border-yellow-200',
    hard: 'bg-red-100 text-red-600 border border-red-200',
    impossible: 'bg-purple-100 text-purple-600 border border-purple-200'
  };

  return (
    <div className={`glass p-5 hover-lift ${
      isOverdue 
        ? 'border-red-300 bg-red-50' 
        : completed 
          ? 'opacity-80' 
          : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            {lifeArea && <span className="text-xl">{lifeArea.icon}</span>}
            <h3 className={`font-semibold text-sm ${
              completed 
                ? 'line-through text-muted-foreground' 
                : 'text-foreground'
            }`}>
              {quest.title}
            </h3>
            {quest.priority === 'high' && (
              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-xl border border-red-200">
                High Priority
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-xs mb-3">
            <span className={`px-2.5 py-1 rounded-xl font-medium ${difficultyColors[quest.difficulty]}`}>
              {quest.difficulty}
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-blue-500">⚡</span>
              <span className="font-medium">{quest.xpReward} XP</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-yellow-500">💰</span>
              <span className="font-medium">{quest.currencyReward} Goldens</span>
            </div>
            {quest.wasRareQuest && (
              <span className="text-yellow-500 flex items-center space-x-1">
                <span>⭐</span>
                <span className="font-medium">Rare!</span>
              </span>
            )}
          </div>

          {quest.totalSubtasks > 0 && (
            <div className="mt-2">
              <ProgressBar
                current={quest.completedSubtasks}
                max={quest.totalSubtasks}
                color="#007AFF"
                showText={true}
                animated={false}
              />
            </div>
          )}

          {isRecurring && recurringProgress && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">
                  🔄 {formatRecurringDescription(quest)}
                </span>
                <span className="text-muted-foreground">
                  Resets in {recurringProgress.timeUntilReset}
                </span>
              </div>
              <ProgressBar
                current={recurringProgress.completed}
                max={recurringProgress.target}
                color={recurringProgress.isCompleted ? "#30d158" : "#007AFF"}
                showText={true}
                animated={false}
              />
              {quest.recurrence!.streak > 0 && (
                <div className="flex items-center mt-1 text-xs text-yellow-500">
                  🔥 {quest.recurrence!.streak} streak
                </div>
              )}
            </div>
          )}

          {isOverdue && (
            <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded-xl">
              <p className="text-red-600 text-xs font-medium flex items-center space-x-1">
                <span>⚠️</span>
                <span>Overdue since {new Date(quest.dueDate!).toLocaleDateString()}</span>
              </p>
            </div>
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
            className="ml-4 bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-xl"
          >
            {isRecurring && recurringProgress?.isCompleted ? '✓ Completed' : '✓ Complete'}
          </Button>
        )}
      </div>
    </div>
  );
}