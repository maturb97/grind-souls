'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface SidebarProps {
  user?: {
    totalXP: number;
    totalCurrency: number;
  } | null;
  onCreateQuest?: () => void;
}

export function SimpleSidebar({ user, onCreateQuest }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/quests', label: 'Quests', icon: '📋' },
    { path: '/rewards', label: 'Rewards', icon: '🏆' },
    { path: '/life-areas', label: 'Life Areas', icon: '🎯' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-3 bg-white/80 backdrop-blur-xl rounded-xl border border-gray-200/50 shadow-lg md:hidden"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 md:w-64 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <span className="text-2xl">⚔️</span>
            <span className="text-xl font-bold">Grind Souls</span>
          </div>

          {/* User Stats */}
          {user && (
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-gray-200/30">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">XP</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-blue-500">⚡</span>
                    <span className="font-semibold">{user.totalXP.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Goldens</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">💰</span>
                    <span className="font-semibold">{user.totalCurrency.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  pathname === item.path
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-white/50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Create Quest Button */}
          {onCreateQuest && (
            <button
              onClick={onCreateQuest}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 mt-6"
            >
              <span>✨</span>
              <span>Create Quest</span>
            </button>
          )}

          {/* Theme Toggle */}
          <div className="mt-4 pt-4 border-t border-gray-200/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}