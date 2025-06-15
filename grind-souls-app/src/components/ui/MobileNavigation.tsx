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

export function MobileNavigation({ user, onCreateAction }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/quests', label: 'Quests', icon: '📋' },
    { path: '/rewards', label: 'Rewards', icon: '🏆' },
    { path: '/life-areas', label: 'Life Areas', icon: '🎯' },
  ];

  const currentPage = navigationItems.find(item => item.path === pathname);

  return (
    <>
      {/* Top Header - Mobile */}
      <header className="md:hidden sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Menu"
          >
            <svg 
              className={`w-6 h-6 text-gray-600 dark:text-gray-300 transition-transform duration-200 ${isMenuOpen ? 'rotate-90' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Center: Page Title */}
          <div className="flex items-center space-x-2">
            <span className="text-lg">{currentPage?.icon}</span>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentPage?.label || 'Grind Souls'}
            </h1>
          </div>

          {/* Right: Create Button */}
          {onCreateAction && (
            <button
              onClick={onCreateAction}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              ✨
            </button>
          )}
        </div>

        {/* User Stats Bar */}
        {user && (
          <div className="flex items-center justify-center space-x-4 px-4 pb-2">
            <div className="flex items-center space-x-1 text-sm">
              <span className="text-blue-600">⚡</span>
              <span className="font-medium text-gray-900 dark:text-white">{user.totalXP.toLocaleString()}</span>
              <span className="text-gray-500 dark:text-gray-400">XP</span>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <span className="text-yellow-600">💰</span>
              <span className="font-medium text-gray-900 dark:text-white">{user.totalCurrency.toLocaleString()}</span>
              <span className="text-gray-500 dark:text-gray-400">Goldens</span>
            </div>
          </div>
        )}
      </header>

      {/* Slide-out Menu */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 z-50 md:hidden transform transition-transform duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⚔️</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">Grind Souls</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      router.push(item.path);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      pathname === item.path
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-colors ${
                pathname === item.path
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom padding for mobile navigation */}
      <div className="md:hidden h-20" />
    </>
  );
}

export function DesktopNavigation({ user, onCreateAction, createActionLabel = "Create" }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/quests', label: 'Quests', icon: '📋' },
    { path: '/rewards', label: 'Rewards', icon: '🏆' },
    { path: '/life-areas', label: 'Life Areas', icon: '🎯' },
  ];

  return (
    <header className="hidden md:block sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⚔️</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Grind Souls</span>
            </div>
            
            {user && (
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-3 py-2 rounded-full border border-gray-200/50 dark:border-gray-700/50">
                  <span className="text-blue-600 text-lg">⚡</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{user.totalXP.toLocaleString()}</span>
                  <span className="text-gray-500 dark:text-gray-400">XP</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-3 py-2 rounded-full border border-gray-200/50 dark:border-gray-700/50">
                  <span className="text-yellow-600 text-lg">💰</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{user.totalCurrency.toLocaleString()}</span>
                  <span className="text-gray-500 dark:text-gray-400">Goldens</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <nav className="flex items-center space-x-2">
              {navigationItems.filter(item => item.path !== pathname).map((item) => (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <span>{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-3">
              <ThemeToggle />
              {onCreateAction && (
                <button
                  onClick={onCreateAction}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
                >
                  ✨ {createActionLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}