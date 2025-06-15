'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/Button';
import { MobileNavigation, DesktopNavigation } from '@/components/ui/MobileNavigation';
import { LifeArea } from '@/types';

interface LifeAreaFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
}

export function LifeAreasManagement() {
  const { 
    user,
    lifeAreas, 
    isLoading,
    initializeApp,
    createLifeArea,
    updateLifeArea,
    deleteLifeArea
  } = useGameStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLifeArea, setEditingLifeArea] = useState<LifeArea | null>(null);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  const activeLifeAreas = lifeAreas.filter(area => area.isActive);
  const inactiveLifeAreas = lifeAreas.filter(area => !area.isActive);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading life areas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background liquid-container">
      {/* Liquid Background */}
      <div className="liquid-bg"></div>
      
      {/* Navigation */}
      <MobileNavigation 
        user={user}
        onCreateAction={() => setShowCreateModal(true)}
        createActionLabel="Create Life Area"
      />
      <DesktopNavigation 
        user={user}
        onCreateAction={() => setShowCreateModal(true)}
        createActionLabel="Create Life Area"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create/Edit Life Area Modal */}
        {(showCreateModal || editingLifeArea) && (
          <LifeAreaModal
            lifeArea={editingLifeArea}
            onClose={() => {
              setShowCreateModal(false);
              setEditingLifeArea(null);
            }}
            onSave={async (lifeAreaData) => {
              if (editingLifeArea) {
                await updateLifeArea(editingLifeArea.id, lifeAreaData);
              } else {
                await createLifeArea(lifeAreaData);
              }
              setShowCreateModal(false);
              setEditingLifeArea(null);
            }}
          />
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4 text-center card-hover animate-spring-in animate-float">
            <div className="text-2xl font-bold text-foreground">{lifeAreas.length}</div>
            <div className="text-xs text-muted-foreground font-medium">Total Areas</div>
          </div>
          <div className="glass-card p-4 text-center card-hover animate-spring-in animate-float" style={{ animationDelay: '0.1s' }}>
            <div className="text-2xl font-bold text-success">{activeLifeAreas.length}</div>
            <div className="text-xs text-muted-foreground font-medium">Active Areas</div>
          </div>
          <div className="glass-card p-4 text-center card-hover animate-spring-in animate-float" style={{ animationDelay: '0.2s' }}>
            <div className="text-2xl font-bold text-muted-foreground">{inactiveLifeAreas.length}</div>
            <div className="text-xs text-muted-foreground font-medium">Inactive Areas</div>
          </div>
          <div className="glass-card p-4 text-center card-hover animate-spring-in animate-float" style={{ animationDelay: '0.3s' }}>
            <div className="text-2xl font-bold text-info">{Math.max(...lifeAreas.map(a => a.level))}</div>
            <div className="text-xs text-muted-foreground font-medium">Highest Level</div>
          </div>
        </div>

        {/* Active Life Areas */}
        <div className="glass-card card-hover mb-8 animate-spring-in" style={{ animationDelay: '0.4s' }}>
          <div className="px-6 py-5 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Active Life Areas</h2>
            <p className="text-sm text-muted-foreground mt-1">Areas you&apos;re currently focusing on for quests</p>
          </div>
          <div className="p-6">
            {activeLifeAreas.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">😴</div>
                <p className="text-muted-foreground font-medium mb-2">No active life areas</p>
                <p className="text-sm text-muted-foreground">Activate some areas to start creating quests!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {activeLifeAreas.map((lifeArea) => (
                  <LifeAreaCard
                    key={lifeArea.id}
                    lifeArea={lifeArea}
                    onEdit={() => setEditingLifeArea(lifeArea)}
                    onToggle={async () => {
                      await updateLifeArea(lifeArea.id, { isActive: false });
                    }}
                    onDelete={lifeArea.isCustom ? async () => {
                      try {
                        if (confirm(`Are you sure you want to delete "${lifeArea.name}"? This action cannot be undone.`)) {
                          await deleteLifeArea(lifeArea.id);
                        }
                      } catch (error) {
                        alert(error instanceof Error ? error.message : 'Failed to delete life area');
                      }
                    } : undefined}
                    isActive={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inactive Life Areas */}
        {inactiveLifeAreas.length > 0 && (
          <div className="glass-card card-hover animate-spring-in" style={{ animationDelay: '0.5s' }}>
            <div className="px-6 py-5 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Inactive Life Areas</h2>
              <p className="text-sm text-muted-foreground mt-1">Areas you can reactivate when needed</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {inactiveLifeAreas.map((lifeArea) => (
                  <LifeAreaCard
                    key={lifeArea.id}
                    lifeArea={lifeArea}
                    onEdit={() => setEditingLifeArea(lifeArea)}
                    onToggle={async () => {
                      await updateLifeArea(lifeArea.id, { isActive: true });
                    }}
                    onDelete={lifeArea.isCustom ? async () => {
                      try {
                        if (confirm(`Are you sure you want to delete "${lifeArea.name}"? This action cannot be undone.`)) {
                          await deleteLifeArea(lifeArea.id);
                        }
                      } catch (error) {
                        alert(error instanceof Error ? error.message : 'Failed to delete life area');
                      }
                    } : undefined}
                    isActive={false}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function LifeAreaCard({
  lifeArea,
  onEdit,
  onToggle,
  onDelete,
  isActive
}: {
  lifeArea: LifeArea;
  onEdit?: () => void;
  onToggle?: () => void;
  onDelete?: () => void;
  isActive: boolean;
}) {
  return (
    <div 
      className={`rounded-xl p-6 border transition-all duration-200 hover:shadow-md ${
        isActive 
          ? 'border-border bg-surface hover:border-border-light' 
          : 'border-border bg-surface-elevated opacity-75'
      }`}
      style={{ borderLeftColor: lifeArea.color, borderLeftWidth: '4px' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{lifeArea.icon}</span>
          <div>
            <h3 className="font-semibold text-foreground">{lifeArea.name}</h3>
            <p className="text-sm text-muted-foreground">Level {lifeArea.level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">{lifeArea.totalXP.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total XP</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed mb-4 p-3 bg-surface-elevated rounded-lg border border-border-light">
        {lifeArea.description}
      </p>

      <div className="flex space-x-2">
        {onToggle && (
          <Button
            onClick={onToggle}
            variant="outline"
            size="sm"
            className={`flex-1 ${
              isActive 
                ? 'text-warning border-warning hover:bg-warning/10' 
                : 'text-success border-success hover:bg-success/10'
            }`}
          >
            {isActive ? '⏸️ Deactivate' : '▶️ Activate'}
          </Button>
        )}
        
        {onEdit && (
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="px-3"
          >
            ✏️
          </Button>
        )}
        
        {onDelete && (
          <Button
            onClick={onDelete}
            variant="outline"
            size="sm"
            className="text-error border-error hover:bg-error/10 px-3"
          >
            🗑️
          </Button>
        )}
      </div>
    </div>
  );
}

function LifeAreaModal({
  lifeArea,
  onClose,
  onSave
}: {
  lifeArea?: LifeArea | null;
  onClose: () => void;
  onSave: (data: LifeAreaFormData) => void;
}) {
  const [formData, setFormData] = useState<LifeAreaFormData>({
    name: lifeArea?.name || '',
    description: lifeArea?.description || '',
    icon: lifeArea?.icon || '⭐',
    color: lifeArea?.color || '#6366f1'
  });

  const suggestedIcons = ['⭐', '🎯', '🚀', '💎', '🔥', '⚡', '🌟', '🎪', '🎨', '🎵', '🏆', '💰', '📚', '💻', '🏋️', '🧘', '🌱', '🍎'];
  const suggestedColors = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {lifeArea ? 'Edit Life Area' : 'Create New Life Area'}
          </h2>
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
          {/* Name and Icon Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Life Area Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter life area name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Icon
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl"
                placeholder="⭐"
                maxLength={2}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestedIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                    className={`p-2 rounded border text-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      formData.icon === icon ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description and Color Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Describe what this life area represents..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color Theme
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm"
              />
              <div className="mt-2 grid grid-cols-6 gap-2">
                {suggestedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-full h-8 rounded border-2 ${
                      formData.color === color ? 'border-gray-900 dark:border-white' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview
            </label>
            <div 
              className="rounded-lg p-4 border-l-4 bg-gray-50 dark:bg-gray-800"
              style={{ borderLeftColor: formData.color }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{formData.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{formData.name || 'Life Area Name'}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Level 1</p>
                </div>
              </div>
              {formData.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{formData.description}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="submit"
              disabled={!formData.name.trim()}
              className="flex-1"
            >
              {lifeArea ? 'Update Life Area' : 'Create Life Area'}
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