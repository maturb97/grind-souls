'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Quest, Subtask } from '@/types';
import { Difficulty, Priority } from '@/config/gameConfig';

interface SubtaskFormData {
  title: string;
  description: string;
  difficulty: Difficulty;
  priority: Priority;
}

interface SubtaskManagementProps {
  quest: Quest;
  subtasks: Subtask[];
}

export function SubtaskManagement({ quest, subtasks }: SubtaskManagementProps) {
  const { createSubtask, updateSubtask, completeSubtask, deleteSubtask } = useGameStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null);

  const questSubtasks = subtasks.filter(s => s.questId === quest.id);
  const completedSubtasks = questSubtasks.filter(s => s.isCompleted);
  const activeSubtasks = questSubtasks.filter(s => !s.isCompleted);

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Subtasks ({completedSubtasks.length}/{questSubtasks.length})
          </h3>
          {questSubtasks.length > 0 && (
            <ProgressBar
              current={completedSubtasks.length}
              max={questSubtasks.length}
              color="#6366f1"
              showText={true}
              animated={true}
            />
          )}
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          ➕ Add Subtask
        </Button>
      </div>

      {/* Create/Edit Subtask Modal */}
      {(showCreateModal || editingSubtask) && (
        <SubtaskModal
          subtask={editingSubtask}
          onClose={() => {
            setShowCreateModal(false);
            setEditingSubtask(null);
          }}
          onSave={async (subtaskData) => {
            if (editingSubtask) {
              await updateSubtask(editingSubtask.id, subtaskData);
            } else {
              await createSubtask({ ...subtaskData, questId: quest.id });
            }
            setShowCreateModal(false);
            setEditingSubtask(null);
          }}
        />
      )}

      {/* Subtasks List */}
      {questSubtasks.length === 0 ? (
        <div className="text-center py-8 border border-border rounded-lg bg-surface-elevated">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-muted-foreground font-medium mb-1">No subtasks yet</p>
          <p className="text-sm text-muted-foreground">Break this quest down into smaller steps</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Active Subtasks */}
          {activeSubtasks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Active</h4>
              {activeSubtasks.map((subtask) => (
                <SubtaskCard
                  key={subtask.id}
                  subtask={subtask}
                  onComplete={() => completeSubtask(subtask.id)}
                  onEdit={() => setEditingSubtask(subtask)}
                  onDelete={() => {
                    if (confirm(`Delete subtask "${subtask.title}"?`)) {
                      deleteSubtask(subtask.id);
                    }
                  }}
                />
              ))}
            </div>
          )}

          {/* Completed Subtasks */}
          {completedSubtasks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Completed</h4>
              {completedSubtasks.map((subtask) => (
                <SubtaskCard
                  key={subtask.id}
                  subtask={subtask}
                  onEdit={() => setEditingSubtask(subtask)}
                  onDelete={() => {
                    if (confirm(`Delete subtask "${subtask.title}"?`)) {
                      deleteSubtask(subtask.id);
                    }
                  }}
                  isCompleted={true}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SubtaskCard({
  subtask,
  onComplete,
  onEdit,
  onDelete,
  isCompleted = false
}: {
  subtask: Subtask;
  onComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isCompleted?: boolean;
}) {
  const difficultyColors = {
    trivial: 'bg-surface-elevated text-muted-foreground border border-border',
    easy: 'bg-success/10 text-success border border-success/20',
    medium: 'bg-warning/10 text-warning border border-warning/20',
    hard: 'bg-error/10 text-error border border-error/20',
    impossible: 'bg-primary/10 text-primary border border-primary/20'
  };

  return (
    <div className={`rounded-lg p-4 border transition-all duration-200 ${
      isCompleted 
        ? 'border-success/30 bg-success/5 opacity-75' 
        : 'border-border bg-surface hover:border-border-light hover:shadow-sm'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className={`font-medium text-sm ${
              isCompleted 
                ? 'line-through text-muted-foreground' 
                : 'text-foreground'
            }`}>
              {subtask.title}
            </h4>
            {subtask.priority === 'high' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-error/10 text-error border border-error/20">
                High Priority
              </span>
            )}
          </div>
          
          {subtask.description && (
            <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
              {subtask.description}
            </p>
          )}
          
          <div className="flex items-center gap-3 text-xs">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${difficultyColors[subtask.difficulty]}`}>
              {subtask.difficulty}
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-primary">⚡</span>
              <span className="font-medium text-foreground">{subtask.xpReward}</span>
              <span className="text-muted-foreground">XP</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-warning">💰</span>
              <span className="font-medium text-foreground">{subtask.currencyReward}</span>
              <span className="text-muted-foreground">Goldens</span>
            </div>
            {isCompleted && subtask.completedAt && (
              <div className="flex items-center space-x-1 text-success">
                <span>✅</span>
                <span>Completed {new Date(subtask.completedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1 ml-3">
          {!isCompleted && onComplete && (
            <Button
              onClick={onComplete}
              size="sm"
              className="bg-success hover:bg-success/90 text-white px-3 py-1"
            >
              ✓
            </Button>
          )}
          
          {onEdit && (
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="px-2 py-1"
            >
              ✏️
            </Button>
          )}
          
          {onDelete && (
            <Button
              onClick={onDelete}
              variant="outline"
              size="sm"
              className="text-error border-error hover:bg-error/10 px-2 py-1"
            >
              🗑️
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function SubtaskModal({
  subtask,
  onClose,
  onSave
}: {
  subtask?: Subtask | null;
  onClose: () => void;
  onSave: (data: SubtaskFormData) => void;
}) {
  const [formData, setFormData] = useState<SubtaskFormData>({
    title: subtask?.title || '',
    description: subtask?.description || '',
    difficulty: subtask?.difficulty || 'easy',
    priority: subtask?.priority || 'normal'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {subtask ? 'Edit Subtask' : 'Create New Subtask'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subtask Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What needs to be done?"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Optional details about this subtask..."
            />
          </div>

          {/* Difficulty and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as Difficulty }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="trivial">Trivial</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="impossible">Impossible</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="submit"
              disabled={!formData.title.trim()}
              className="flex-1"
            >
              {subtask ? 'Update Subtask' : 'Create Subtask'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}