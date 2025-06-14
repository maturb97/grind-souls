'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, actualTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    {
      value: 'light' as const,
      label: 'Light',
      icon: '☀️',
      description: 'Light theme'
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      icon: '🌙',
      description: 'Dark theme'
    },
    {
      value: 'system' as const,
      label: 'System',
      icon: '💻',
      description: 'Follow system preference'
    }
  ];

  const currentTheme = themes.find(t => t.value === theme);
  const currentIcon = actualTheme === 'dark' ? '🌙' : '☀️';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-surface-elevated hover:bg-gray-100 dark:hover:bg-gray-700 border border-border transition-all duration-200"
        aria-label="Toggle theme"
      >
        <span className="text-lg">{currentIcon}</span>
        <span className="text-sm font-medium text-foreground hidden sm:block">
          {currentTheme?.label}
        </span>
        <svg 
          className={`w-4 h-4 text-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-fade-in">
            <div className="py-2">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    theme === themeOption.value 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <span className="text-lg">{themeOption.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{themeOption.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {themeOption.description}
                    </div>
                  </div>
                  {theme === themeOption.value && (
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}