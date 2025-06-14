'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/Button';
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Quest</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quest Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What do you want to accomplish?"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Optional description..."
            />
          </div>

          {/* Difficulty and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as Difficulty }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="trivial">Trivial (5 XP)</option>
                <option value="easy">Easy (15 XP)</option>
                <option value="medium">Medium (35 XP)</option>
                <option value="hard">Hard (70 XP)</option>
                <option value="impossible">Impossible (150 XP)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="normal">Normal (1.0x XP)</option>
                <option value="high">High Priority (1.5x XP)</option>
              </select>
            </div>
          </div>

          {/* Life Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Life Area *
            </label>
            <select
              value={formData.lifeAreaId}
              onChange={(e) => setFormData(prev => ({ ...prev, lifeAreaId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Recurring Options */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isRecurring" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                🔄 Make this a recurring quest
              </label>
            </div>

            {formData.isRecurring && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Frequency
                    </label>
                    <select
                      value={formData.recurrenceType}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceType: e.target.value as RecurrenceType }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.recurrenceTarget}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceTarget: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                  Complete <span className="font-medium text-gray-900 dark:text-white">{formData.recurrenceTarget}</span> time{formData.recurrenceTarget !== 1 ? 's' : ''} per {formData.recurrenceType.slice(0, -2)}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
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
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a tag..."
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                Add
              </Button>
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Suggested tags:</p>
              <div className="flex flex-wrap gap-1">
                {['work', 'personal', 'health', 'learning', 'creative', 'urgent', 'important', 'routine'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (!formData.tags.includes(tag)) {
                        setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                      }
                    }}
                    className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="submit"
              disabled={!formData.title.trim() || !formData.lifeAreaId || isSubmitting}
              isLoading={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Creating...' : 'Create Quest'}
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
  );
}