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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">⚔️ Grind Souls</h1>
              {user && (
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2 bg-surface-elevated px-3 py-2 rounded-full border border-border">
                    <span className="text-primary text-lg">⚡</span>
                    <span className="font-semibold text-foreground">{user.totalXP.toLocaleString()}</span>
                    <span className="text-muted-foreground">XP</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-surface-elevated px-3 py-2 rounded-full border border-border">
                    <span className="text-warning text-lg">💰</span>
                    <span className="font-semibold text-foreground">{user.totalCurrency.toLocaleString()}</span>
                    <span className="text-muted-foreground">Souls</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => window.location.href = './quests'}
                variant="outline"
                className="px-4 py-2.5 font-medium"
              >
                📋 Manage Quests
              </Button>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                ✨ Create Quest
              </Button>
            </div>
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
          <div className="card p-6 hover:scale-105 transition-transform duration-200 animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="text-primary text-xl">📋</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Quests</p>
                <p className="text-3xl font-bold text-foreground">{activeQuests.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 hover:scale-105 transition-transform duration-200 animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <span className="text-success text-xl">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                <p className="text-3xl font-bold text-foreground">{completedTodayQuests.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 hover:scale-105 transition-transform duration-200 animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center">
                  <span className="text-error text-xl">⚠️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-3xl font-bold text-foreground">{overdueQuests.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 hover:scale-105 transition-transform duration-200 animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center">
                  <span className="text-info text-xl">🎯</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Life Areas</p>
                <p className="text-3xl font-bold text-foreground">{lifeAreas.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Life Areas Progress */}
        <div className="card mb-8 animate-fade-in">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Life Areas Progress</h2>
            <p className="text-sm text-muted-foreground mt-1">Level up your character stats by completing quests</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {lifeAreas.map((lifeArea) => {
                const progress = calculateLevelProgress(lifeArea.id);
                return (
                  <div key={lifeArea.id} className="group relative">
                    <div className="space-y-4 p-4 rounded-xl border border-border hover:border-border-light transition-all duration-200 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl drop-shadow-sm">{lifeArea.icon}</span>
                          <div>
                            <h3 className="font-semibold text-foreground">{lifeArea.name}</h3>
                            <p className="text-sm text-muted-foreground font-medium">Level {lifeArea.level}</p>
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
                          animated={true}
                        />
                      </div>
                      
                      {/* Always visible description */}
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground leading-relaxed p-3 bg-surface-elevated rounded-lg border border-border-light">
                          {lifeArea.description}
                        </p>
                      </div>
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
          <div className="card animate-fade-in">
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
          <div className="card animate-fade-in">
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
    trivial: 'bg-surface-elevated text-muted-foreground border border-border',
    easy: 'bg-success/10 text-success border border-success/20',
    medium: 'bg-warning/10 text-warning border border-warning/20',
    hard: 'bg-error/10 text-error border border-error/20',
    impossible: 'bg-primary/10 text-primary border border-primary/20'
  };

  return (
    <div className={`rounded-xl p-5 border transition-all duration-200 hover:shadow-md ${
      isOverdue 
        ? 'border-error/30 bg-error/5' 
        : completed 
          ? 'border-border bg-surface opacity-80' 
          : 'border-border bg-surface hover:border-border-light'
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
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error/10 text-error border border-error/20">
                High Priority
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-xs mb-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-medium ${difficultyColors[quest.difficulty]}`}>
              {quest.difficulty}
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-primary">⚡</span>
              <span className="font-medium text-foreground">{quest.xpReward}</span>
              <span className="text-muted-foreground">XP</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-warning">💰</span>
              <span className="font-medium text-foreground">{quest.currencyReward}</span>
              <span className="text-muted-foreground">Souls</span>
            </div>
            {quest.wasRareQuest && (
              <span className="text-warning flex items-center space-x-1">
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
                color="#6366f1"
                showText={true}
                animated={true}
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
                color={recurringProgress.isCompleted ? "#10b981" : "#6366f1"}
                showText={true}
                animated={true}
              />
              {quest.recurrence!.streak > 0 && (
                <div className="flex items-center mt-1 text-xs text-warning">
                  🔥 {quest.recurrence!.streak} streak
                </div>
              )}
            </div>
          )}

          {isOverdue && (
            <div className="mt-3 p-2 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-error text-xs font-medium flex items-center space-x-1">
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
            className="ml-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            {isRecurring && recurringProgress?.isCompleted ? '✓ Completed' : '✓ Complete'}
          </Button>
        )}
      </div>
    </div>
  );
}