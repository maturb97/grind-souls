'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { QuestCreateModal } from '@/components/QuestCreateModal';
import { Quest, LifeArea } from '@/types';
import { Difficulty, Priority } from '@/config/gameConfig';
import { getRecurringQuestProgress, formatRecurringDescription } from '@/lib/recurringUtils';

type FilterType = 'all' | 'active' | 'completed' | 'overdue' | 'recurring';
type SortType = 'newest' | 'oldest' | 'priority' | 'difficulty' | 'due-date' | 'alphabetical';

export function QuestManagement() {
  const router = useRouter();
  const { 
    user,
    lifeAreas, 
    quests, 
    isLoading,
    initializeApp,
    completeQuest,
    completeRecurringQuest,
    deleteQuest,
    getOverdueQuests
  } = useGameStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('newest');
  const [selectedLifeArea, setSelectedLifeArea] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | ''>('');
  const [selectedPriority, setSelectedPriority] = useState<Priority | ''>('');

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Filter and sort quests
  const filteredAndSortedQuests = () => {
    let filtered = [...quests];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(quest => 
        quest.title.toLowerCase().includes(term) ||
        quest.description?.toLowerCase().includes(term) ||
        quest.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'active':
        filtered = filtered.filter(q => !q.isCompleted && (!q.recurrence || q.recurrence.completedCount < q.recurrence.targetCount));
        break;
      case 'completed':
        filtered = filtered.filter(q => q.isCompleted || (q.recurrence && q.recurrence.completedCount >= q.recurrence.targetCount));
        break;
      case 'overdue':
        const overdueIds = getOverdueQuests().map(q => q.id);
        filtered = filtered.filter(q => overdueIds.includes(q.id));
        break;
      case 'recurring':
        filtered = filtered.filter(q => !!q.recurrence);
        break;
    }

    // Apply life area filter
    if (selectedLifeArea) {
      filtered = filtered.filter(q => q.lifeAreaId === selectedLifeArea);
    }

    // Apply difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }

    // Apply priority filter
    if (selectedPriority) {
      filtered = filtered.filter(q => q.priority === selectedPriority);
    }

    // Apply sorting
    switch (sortType) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'priority':
        filtered.sort((a, b) => {
          const priorityOrder = { high: 2, normal: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
        break;
      case 'difficulty':
        filtered.sort((a, b) => {
          const difficultyOrder = { impossible: 5, hard: 4, medium: 3, easy: 2, trivial: 1 };
          return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
        });
        break;
      case 'due-date':
        filtered.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  };

  const displayedQuests = filteredAndSortedQuests();
  const stats = {
    total: quests.length,
    active: quests.filter(q => !q.isCompleted && (!q.recurrence || q.recurrence.completedCount < q.recurrence.targetCount)).length,
    completed: quests.filter(q => q.isCompleted || (q.recurrence && q.recurrence.completedCount >= q.recurrence.targetCount)).length,
    overdue: getOverdueQuests().length,
    recurring: quests.filter(q => !!q.recurrence).length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading quest management...</p>
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
              <h1 className="text-3xl font-bold text-foreground tracking-tight">📋 Quest Management</h1>
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
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <div className="flex space-x-3">
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="px-4 py-2"
                >
                  🏠 Dashboard
                </Button>
                <Button
                  onClick={() => router.push('/rewards')}
                  variant="outline"
                  className="px-4 py-2"
                >
                  🏆 Rewards
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quest Creation Modal */}
        <QuestCreateModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="card p-4 text-center hover:scale-105 transition-transform duration-200 animate-fade-in">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground font-medium">Total Quests</div>
          </div>
          <div className="card p-4 text-center hover:scale-105 transition-transform duration-200 animate-fade-in">
            <div className="text-2xl font-bold text-primary">{stats.active}</div>
            <div className="text-xs text-muted-foreground font-medium">Active</div>
          </div>
          <div className="card p-4 text-center hover:scale-105 transition-transform duration-200 animate-fade-in">
            <div className="text-2xl font-bold text-success">{stats.completed}</div>
            <div className="text-xs text-muted-foreground font-medium">Completed</div>
          </div>
          <div className="card p-4 text-center hover:scale-105 transition-transform duration-200 animate-fade-in">
            <div className="text-2xl font-bold text-error">{stats.overdue}</div>
            <div className="text-xs text-muted-foreground font-medium">Overdue</div>
          </div>
          <div className="card p-4 text-center hover:scale-105 transition-transform duration-200 animate-fade-in">
            <div className="text-2xl font-bold text-info">{stats.recurring}</div>
            <div className="text-xs text-muted-foreground font-medium">Recurring</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-8 animate-fade-in">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Filters & Search</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Search Quests</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, description, or tags..."
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as FilterType)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="all">All ({stats.total})</option>
                  <option value="active">Active ({stats.active})</option>
                  <option value="completed">Completed ({stats.completed})</option>
                  <option value="overdue">Overdue ({stats.overdue})</option>
                  <option value="recurring">Recurring ({stats.recurring})</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Life Area</label>
                <select
                  value={selectedLifeArea}
                  onChange={(e) => setSelectedLifeArea(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">All Areas</option>
                  {lifeAreas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.icon} {area.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty | '')}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">All Levels</option>
                  <option value="trivial">Trivial</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="impossible">Impossible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as Priority | '')}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">All Priorities</option>
                  <option value="normal">Normal</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
                <select
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value as SortType)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priority">Priority</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="due-date">Due Date</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setSelectedLifeArea('');
                    setSelectedDifficulty('');
                    setSelectedPriority('');
                    setSortType('newest');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  🔄 Reset
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quests List */}
        <div className="card animate-fade-in">
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Quests ({displayedQuests.length})
              </h2>
              {displayedQuests.length !== quests.length && (
                <p className="text-sm text-muted-foreground">
                  Showing {displayedQuests.length} of {quests.length} quests
                </p>
              )}
            </div>
          </div>
          <div className="divide-y divide-border">
            {displayedQuests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-muted-foreground font-medium mb-2">No quests found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              displayedQuests.map((quest) => (
                <QuestRow 
                  key={quest.id} 
                  quest={quest} 
                  lifeAreas={lifeAreas}
                  onComplete={(questId) => {
                    if (quest.recurrence) {
                      completeRecurringQuest(questId);
                    } else {
                      completeQuest(questId);
                    }
                  }}
                  onDelete={deleteQuest}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function QuestRow({ 
  quest, 
  lifeAreas, 
  onComplete, 
  onDelete 
}: { 
  quest: Quest; 
  lifeAreas: LifeArea[];
  onComplete: (questId: string) => void;
  onDelete: (questId: string) => void;
}) {
  const lifeArea = lifeAreas.find(la => la.id === quest.lifeAreaId);
  const isOverdue = quest.dueDate && new Date(quest.dueDate) < new Date() && !quest.isCompleted;
  const isRecurring = !!quest.recurrence;
  const recurringProgress = isRecurring ? getRecurringQuestProgress(quest) : null;
  const isCompleted = quest.isCompleted || (isRecurring && recurringProgress?.isCompleted);

  const difficultyColors = {
    trivial: 'bg-surface-elevated text-muted-foreground border border-border',
    easy: 'bg-success/10 text-success border border-success/20',
    medium: 'bg-warning/10 text-warning border border-warning/20',
    hard: 'bg-error/10 text-error border border-error/20',
    impossible: 'bg-primary/10 text-primary border border-primary/20'
  };

  return (
    <div className={`p-6 hover:bg-surface-elevated transition-colors ${
      isOverdue ? 'bg-error/5 border-l-4 border-l-error' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            {lifeArea && <span className="text-xl">{lifeArea.icon}</span>}
            <h3 className={`font-semibold ${
              isCompleted 
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
            {isRecurring && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-info/10 text-info border border-info/20">
                🔄 Recurring
              </span>
            )}
          </div>

          {quest.description && (
            <p className="text-sm text-muted-foreground mb-3">{quest.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-xs mb-3">
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
            {quest.dueDate && (
              <div className="flex items-center space-x-1">
                <span className="text-muted-foreground">📅</span>
                <span className={`font-medium ${isOverdue ? 'text-error' : 'text-foreground'}`}>
                  {new Date(quest.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {quest.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {quest.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {quest.totalSubtasks > 0 && (
            <div className="mb-3">
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
            <div className="mb-3">
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

        <div className="flex space-x-2 ml-4">
          {!isCompleted && (
            <Button
              size="sm"
              onClick={() => onComplete(quest.id)}
              disabled={
                (quest.totalSubtasks > 0 && quest.completedSubtasks < quest.totalSubtasks) ||
                (isRecurring && recurringProgress?.isCompleted)
              }
              className="bg-success hover:bg-success/90 text-white font-medium px-4 py-2"
            >
              {isRecurring && recurringProgress?.isCompleted ? '✓ Completed' : '✓ Complete'}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (confirm(`Are you sure you want to delete "${quest.title}"?`)) {
                onDelete(quest.id);
              }
            }}
            className="text-error border-error hover:bg-error/10"
          >
            🗑️ Delete
          </Button>
        </div>
      </div>
    </div>
  );
}