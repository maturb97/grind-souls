import { Quest } from '@/types';

export function getNextResetDate(type: 'daily' | 'weekly' | 'monthly', weekStartsOnSunday = true): Date {
  const now = new Date();
  const nextReset = new Date(now);

  switch (type) {
    case 'daily':
      nextReset.setDate(nextReset.getDate() + 1);
      nextReset.setHours(0, 0, 0, 0);
      break;
    
    case 'weekly':
      const daysUntilReset = weekStartsOnSunday 
        ? (7 - nextReset.getDay()) % 7 || 7
        : (8 - nextReset.getDay()) % 7 || 7;
      nextReset.setDate(nextReset.getDate() + daysUntilReset);
      nextReset.setHours(0, 0, 0, 0);
      break;
    
    case 'monthly':
      nextReset.setMonth(nextReset.getMonth() + 1, 1);
      nextReset.setHours(0, 0, 0, 0);
      break;
  }

  return nextReset;
}

export function shouldResetRecurringQuest(quest: Quest): boolean {
  if (!quest.recurrence || !quest.recurrence.isActive) return false;
  
  const now = new Date();
  const nextReset = quest.recurrence.nextReset ? new Date(quest.recurrence.nextReset) : null;
  
  return nextReset ? now >= nextReset : false;
}

export function getRecurringQuestProgress(quest: Quest): {
  completed: number;
  target: number;
  percentage: number;
  isCompleted: boolean;
  daysUntilReset: number;
  timeUntilReset: string;
} {
  if (!quest.recurrence) {
    return {
      completed: 0,
      target: 1,
      percentage: quest.isCompleted ? 100 : 0,
      isCompleted: quest.isCompleted,
      daysUntilReset: 0,
      timeUntilReset: ''
    };
  }

  const { completedCount, targetCount, nextReset } = quest.recurrence;
  const percentage = Math.min((completedCount / targetCount) * 100, 100);
  const isCompleted = completedCount >= targetCount;
  
  let daysUntilReset = 0;
  let timeUntilReset = '';
  
  if (nextReset) {
    const now = new Date();
    const resetDate = new Date(nextReset);
    const timeDiff = resetDate.getTime() - now.getTime();
    
    if (timeDiff > 0) {
      daysUntilReset = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      if (daysUntilReset === 1) {
        const hoursUntilReset = Math.ceil(timeDiff / (1000 * 60 * 60));
        timeUntilReset = hoursUntilReset <= 24 ? `${hoursUntilReset}h` : '1 day';
      } else {
        timeUntilReset = `${daysUntilReset} days`;
      }
    } else {
      timeUntilReset = 'Ready to reset';
    }
  }
  
  return {
    completed: completedCount,
    target: targetCount,
    percentage,
    isCompleted,
    daysUntilReset,
    timeUntilReset
  };
}

export function getRecurringQuestStatus(quest: Quest): 'active' | 'completed' | 'pending_reset' | 'inactive' {
  if (!quest.recurrence || !quest.recurrence.isActive) return 'inactive';
  
  if (shouldResetRecurringQuest(quest)) return 'pending_reset';
  
  const progress = getRecurringQuestProgress(quest);
  return progress.isCompleted ? 'completed' : 'active';
}

export function formatRecurringDescription(quest: Quest): string {
  if (!quest.recurrence) return '';
  
  const { type, targetCount } = quest.recurrence;
  const period = type.slice(0, -2); // Remove 'ly' from daily/weekly/monthly
  
  if (targetCount === 1) {
    return `Complete once ${period}`;
  } else {
    return `Complete ${targetCount} times per ${period}`;
  }
}