'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/Button';
import { SimpleSidebar } from '@/components/ui/SimpleSidebar';
import { Reward } from '@/types';

interface RewardFormData {
  name: string;
  description: string;
  cost: number;
  category: string;
}

export function RewardsManagement() {
  const { 
    user,
    rewards, 
    isLoading,
    initializeApp,
    createReward,
    purchaseReward,
    deleteReward
  } = useGameStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Filter rewards
  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reward.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || reward.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const availableRewards = filteredRewards.filter(r => !r.isPurchased);
  const purchasedRewards = filteredRewards.filter(r => r.isPurchased);
  const categories = ['small', 'medium', 'large', 'major', 'custom'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading rewards...</p>
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
        {/* Create/Edit Reward Modal */}
        {(showCreateModal || editingReward) && (
          <RewardModal
            reward={editingReward}
            onClose={() => {
              setShowCreateModal(false);
              setEditingReward(null);
            }}
            onSave={async (rewardData) => {
              if (editingReward) {
                // TODO: Add update reward functionality
                console.log('Update reward:', rewardData);
              } else {
                await createReward(rewardData);
              }
              setShowCreateModal(false);
              setEditingReward(null);
            }}
          />
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 text-center hover-lift">
            <div className="text-2xl font-bold text-foreground">{rewards.length}</div>
            <div className="text-xs text-muted-foreground font-medium">Total Rewards</div>
          </div>
          <div className="card p-4 text-center hover-lift">
            <div className="text-2xl font-bold text-primary">{availableRewards.length}</div>
            <div className="text-xs text-muted-foreground font-medium">Available</div>
          </div>
          <div className="card p-4 text-center hover-lift">
            <div className="text-2xl font-bold text-success">{purchasedRewards.length}</div>
            <div className="text-xs text-muted-foreground font-medium">Purchased</div>
          </div>
          <div className="card p-4 text-center hover-lift">
            <div className="text-2xl font-bold text-warning">{user?.totalCurrency || 0}</div>
            <div className="text-xs text-muted-foreground font-medium">Goldens Balance</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Filters</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Search Rewards</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or description..."
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Available Rewards */}
        <div className="card mb-8">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Available Rewards</h2>
            <p className="text-sm text-muted-foreground mt-1">Spend your Goldens on these rewards</p>
          </div>
          <div className="p-6">
            {availableRewards.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎁</div>
                <p className="text-muted-foreground font-medium mb-2">No available rewards</p>
                <p className="text-sm text-muted-foreground">Create your first reward to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableRewards.map((reward) => (
                  <RewardCard
                    key={reward.id}
                    reward={reward}
                    userCurrency={user?.totalCurrency || 0}
                    onPurchase={() => purchaseReward(reward.id)}
                    onEdit={() => setEditingReward(reward)}
                    onDelete={() => {
                      if (confirm(`Are you sure you want to delete "${reward.name}"?`)) {
                        deleteReward(reward.id);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Purchased Rewards */}
        {purchasedRewards.length > 0 && (
          <div className="card">
            <div className="px-6 py-5 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Purchase History</h2>
              <p className="text-sm text-muted-foreground mt-1">Your earned rewards</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedRewards.map((reward) => (
                  <RewardCard
                    key={reward.id}
                    reward={reward}
                    userCurrency={user?.totalCurrency || 0}
                    isPurchased={true}
                    onEdit={() => setEditingReward(reward)}
                    onDelete={() => {
                      if (confirm(`Are you sure you want to delete "${reward.name}"?`)) {
                        deleteReward(reward.id);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RewardCard({
  reward,
  userCurrency,
  isPurchased = false,
  onPurchase,
  onEdit,
  onDelete
}: {
  reward: Reward;
  userCurrency: number;
  isPurchased?: boolean;
  onPurchase?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const canAfford = userCurrency >= reward.cost;

  const categoryColors = {
    small: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
    medium: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
    large: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800',
    major: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800',
    custom: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600'
  };

  const categoryEmojis = {
    small: '☕',
    medium: '🍿',
    large: '🎬',
    major: '🏖️',
    custom: '🎁'
  };

  return (
    <div className={`rounded-xl p-6 border transition-all duration-200 hover:shadow-md ${
      isPurchased 
        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 opacity-75' 
        : canAfford 
          ? 'border-border bg-white dark:bg-gray-800 hover:border-border-light' 
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{categoryEmojis[reward.category as keyof typeof categoryEmojis] || '🎁'}</span>
          <div>
            <h3 className={`font-semibold ${isPurchased ? 'line-through text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
              {reward.name}
            </h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              categoryColors[reward.category as keyof typeof categoryColors] || categoryColors.custom
            }`}>
              {reward.category.charAt(0).toUpperCase() + reward.category.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <span className="text-warning text-lg">💰</span>
          <span className="font-bold text-gray-900 dark:text-white">{reward.cost}</span>
        </div>
      </div>

      {reward.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{reward.description}</p>
      )}

      {isPurchased && reward.purchasedAt && (
        <div className="mb-4 p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <p className="text-green-800 dark:text-green-200 text-xs font-medium flex items-center space-x-1">
            <span>✅</span>
            <span>Purchased on {new Date(reward.purchasedAt).toLocaleDateString()}</span>
          </p>
        </div>
      )}

      <div className="flex space-x-2">
        {!isPurchased && onPurchase && (
          <Button
            onClick={onPurchase}
            disabled={!canAfford}
            className={`flex-1 ${
              canAfford 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {canAfford ? '🛒 Purchase' : '💸 Can\'t Afford'}
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
            className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3"
          >
            🗑️
          </Button>
        )}
      </div>
    </div>
  );
}

function RewardModal({
  reward,
  onClose,
  onSave
}: {
  reward?: Reward | null;
  onClose: () => void;
  onSave: (data: RewardFormData) => void;
}) {
  const [formData, setFormData] = useState<RewardFormData>({
    name: reward?.name || '',
    description: reward?.description || '',
    cost: reward?.cost || 50,
    category: reward?.category || 'small'
  });

  const suggestedPrices = {
    small: 50,   // Coffee, snack
    medium: 150, // Movie, treat
    large: 500,  // Dinner out, new item
    major: 1500  // Weekend activity, significant purchase
  };

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
            {reward ? 'Edit Reward' : 'Create New Reward'}
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
          {/* Name and Category Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reward Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="What's your reward?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value, cost: suggestedPrices[e.target.value as keyof typeof suggestedPrices] || prev.cost }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="small">☕ Small (Coffee, snacks)</option>
                <option value="medium">🍿 Medium (Movie, treats)</option>
                <option value="large">🎬 Large (Dinner out, items)</option>
                <option value="major">🏖️ Major (Activities, purchases)</option>
                <option value="custom">🎁 Custom</option>
              </select>
            </div>
          </div>

          {/* Description and Cost Row */}
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
                placeholder="Optional description of your reward..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cost (Goldens) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: parseInt(e.target.value) || 1 }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">💡 Suggested Pricing:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-800 dark:text-blue-300">
                  <div>☕ Small: 50 Goldens</div>
                  <div>🍿 Medium: 150 Goldens</div>
                  <div>🎬 Large: 500 Goldens</div>
                  <div>🏖️ Major: 1500 Goldens</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="submit"
              disabled={!formData.name.trim()}
              className="flex-1"
            >
              {reward ? 'Update Reward' : 'Create Reward'}
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