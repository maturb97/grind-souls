'use client';

import { ProgressBarProps } from '@/types';

export function ProgressBar({ 
  current, 
  max, 
  color = '#6366f1', 
  showText = true, 
  animated = true 
}: ProgressBarProps) {
  const percentage = Math.min((current / max) * 100, 100);
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        {showText && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {current} / {max}
          </span>
        )}
        {showText && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${animated ? 'ease-out' : ''}`}
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
}