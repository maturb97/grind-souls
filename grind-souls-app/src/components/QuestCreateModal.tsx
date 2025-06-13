'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/Button';
import { GAME_CONFIG } from '@/config/gameConfig';
import { Difficulty, Priority, RecurrenceType } from '@/config/gameConfig';

interface QuestCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuestCreateModal({ isOpen, onClose }: QuestCreateModalProps) {
  const { lifeAreas, createQuest } = useGameStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy' as Difficulty,
    priority: 'normal' as Priority,
    lifeAreaId: '',
    tags: [] as string[],
    dueDate: '',
    isRecurring: false,
    recurrenceType: 'daily' as RecurrenceType,
    recurrenceFrequency: 1,
    recurrenceTarget: 1
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.lifeAreaId) return;

    setIsSubmitting(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const questData: any = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        difficulty: formData.difficulty,
        priority: formData.priority,
        lifeAreaId: formData.lifeAreaId,
        tags: formData.tags,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined
      };

      if (formData.isRecurring) {
        const now = new Date();
        const nextReset = new Date(now);
        
        // Calculate next reset date
        switch (formData.recurrenceType) {
          case 'daily':
            nextReset.setDate(nextReset.getDate() + 1);
            nextReset.setHours(0, 0, 0, 0);
            break;
          case 'weekly':
            nextReset.setDate(nextReset.getDate() + (7 - nextReset.getDay()));
            nextReset.setHours(0, 0, 0, 0);
            break;
          case 'monthly':
            nextReset.setMonth(nextReset.getMonth() + 1, 1);
            nextReset.setHours(0, 0, 0, 0);
            break;
        }

        questData.recurrence = {
          type: formData.recurrenceType,
          frequency: formData.recurrenceFrequency,
          completedCount: 0,
          targetCount: formData.recurrenceTarget,
          lastReset: now,
          nextReset,
          isActive: true,
          streak: 0
        };
      }

      await createQuest(questData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        difficulty: 'easy',
        priority: 'normal',
        lifeAreaId: lifeAreas[0]?.id || '',
        tags: [],
        dueDate: '',
        isRecurring: false,
        recurrenceType: 'daily',
        recurrenceFrequency: 1,
        recurrenceTarget: 1
      });
      setTagInput('');
      onClose();
    } catch (error) {
      console.error('Failed to create quest:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-surface border border-border rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Create New Quest</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-surface-elevated rounded-lg"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Quest Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="What do you want to accomplish?"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                placeholder="Optional description..."
              />
            </div>

            {/* Difficulty and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as Difficulty }))}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="trivial">Trivial ({GAME_CONFIG.xp.base.trivial} XP)</option>
                  <option value="easy">Easy ({GAME_CONFIG.xp.base.easy} XP)</option>
                  <option value="medium">Medium ({GAME_CONFIG.xp.base.medium} XP)</option>
                  <option value="hard">Hard ({GAME_CONFIG.xp.base.hard} XP)</option>
                  <option value="impossible">Impossible ({GAME_CONFIG.xp.base.impossible} XP)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="normal">Normal (1.0x XP)</option>
                  <option value="high">High Priority (1.5x XP)</option>
                </select>
              </div>
            </div>

            {/* Life Area */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Life Area *
              </label>
              <select
                value={formData.lifeAreaId}
                onChange={(e) => setFormData(prev => ({ ...prev, lifeAreaId: e.target.value }))}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                required
              >
                <option value="">Select Life Area</option>
                {lifeAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.icon} {area.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Recurring Options */}
            <div className="border border-border rounded-lg p-4 bg-surface-elevated">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  className="h-4 w-4 text-primary border-border rounded focus:ring-primary/20"
                />
                <label htmlFor="isRecurring" className="ml-3 text-sm font-medium text-foreground">
                  🔄 Make this a recurring quest
                </label>
              </div>

              {formData.isRecurring && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Frequency
                      </label>
                      <select
                        value={formData.recurrenceType}
                        onChange={(e) => setFormData(prev => ({ ...prev, recurrenceType: e.target.value as RecurrenceType }))}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Target Count
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={formData.recurrenceTarget}
                        onChange={(e) => setFormData(prev => ({ ...prev, recurrenceTarget: parseInt(e.target.value) || 1 }))}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>

                    <div className="flex items-end">
                      <div className="text-xs text-muted-foreground p-3 bg-primary/5 rounded-lg border border-primary/10">
                        Complete <span className="font-medium text-foreground">{formData.recurrenceTarget}</span> time{formData.recurrenceTarget !== 1 ? 's' : ''} per {formData.recurrenceType.slice(0, -2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-primary hover:text-primary/80 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Add a tag..."
                />
                <Button type="button" onClick={addTag} variant="outline" size="sm">
                  Add
                </Button>
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-2">Suggested tags:</p>
                <div className="flex flex-wrap gap-2">
                  {GAME_CONFIG.defaultTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (!formData.tags.includes(tag)) {
                          setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                        }
                      }}
                      className="text-xs px-3 py-1.5 rounded-full bg-surface-elevated border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={!formData.title.trim() || !formData.lifeAreaId || isSubmitting}
                isLoading={isSubmitting}
                className="flex-1"
              >
                Create Quest
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}