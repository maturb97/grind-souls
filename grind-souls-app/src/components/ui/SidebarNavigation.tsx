'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface NavigationProps {
  user?: {
    totalXP: number;
    totalCurrency: number;
  } | null;
  onCreateAction?: () => void;
  createActionLabel?: string;
}

export function SidebarNavigation({ user, onCreateAction, createActionLabel = "Create" }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/quests', label: 'Quests', icon: '📋' },
    { path: '/rewards', label: 'Rewards', icon: '🏆' },
    { path: '/life-areas', label: 'Life Areas', icon: '🎯' },
  ];


  return (
    <div className={`sidebar fixed left-0 top-0 h-full z-40 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } md:relative md:w-64`}>
      <div className="flex flex-col h-full p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⚔️</span>
              <span className="text-xl font-bold text-foreground">Grind Souls</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-surface-elevated transition-colors md:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* User Stats */}
        {user && !isCollapsed && (
          <div className="mb-6 p-4 glass-card rounded-md">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">XP</span>
                <div className="flex items-center space-x-1">
                  <span className="text-primary text-lg">⚡</span>
                  <span className="font-semibold text-foreground">{user.totalXP.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Goldens</span>
                <div className="flex items-center space-x-1">
                  <span className="text-warning text-lg">💰</span>
                  <span className="font-semibold text-foreground">{user.totalCurrency.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`sidebar-item w-full flex items-center space-x-3 px-3 py-3 text-left transition-colors ${
                pathname === item.path ? 'active' : ''
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : ''}
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Create Action Button */}
        {onCreateAction && (
          <div className="mt-6">
            <button
              onClick={onCreateAction}
              className={`glass-button w-full flex items-center justify-center space-x-2 px-4 py-3 font-medium text-primary transition-colors ${
                isCollapsed ? 'text-xl' : ''
              }`}
            >
              <span>✨</span>
              {!isCollapsed && <span>{createActionLabel}</span>}
            </button>
          </div>
        )}

        {/* Theme Toggle */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && <span className="text-sm font-medium text-muted-foreground">Theme</span>}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobileTopBar({ user, currentPage, onMenuClick }: {
  user?: NavigationProps['user'];
  currentPage?: { label: string; icon: string };
  onMenuClick: () => void;
}) {
  return (
    <header className="md:hidden sticky top-0 z-30 glass-card border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex items-center space-x-2">
          <span className="text-lg">{currentPage?.icon}</span>
          <h1 className="text-lg font-semibold">{currentPage?.label || 'Grind Souls'}</h1>
        </div>

        {user && (
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-1">
              <span className="text-primary">⚡</span>
              <span className="font-medium">{user.totalXP.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-warning">💰</span>
              <span className="font-medium">{user.totalCurrency.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}