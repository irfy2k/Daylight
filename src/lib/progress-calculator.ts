import type { Task, Transaction, Mood } from './types';

export interface ProgressMetrics {
  productivity: number;
  wellness: number;
  completedTasks: number;
  totalTasks: number;
  dailyGoalProgress: number;
  streakDays: number;
}

export interface AppMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkActivity: number;
  sessionTime: number;
  dataPoints: number;
}

export function calculateProductivity(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  
  const completed = tasks.filter(task => task.completed).length;
  const total = tasks.length;
  const completionRate = (completed / total) * 100;
  
  // Boost score for having tasks (shows planning)
  const planningBonus = Math.min(total * 5, 20); // Up to 20% bonus for having tasks
  
  // Recent activity bonus (active task management)
  const activityBonus = total >= 3 ? 15 : total * 5; // Bonus for having multiple tasks
  
  return Math.min(100, Math.round(completionRate + planningBonus + activityBonus));
}

export function calculateWellness(mood: Mood | null): number {
  if (!mood) return 0;
  
  // Base mood scores
  const moodScores = {
    happy: 90,
    excited: 95,
    neutral: 60,
    sad: 30,
    anxious: 40,
    frustrated: 35
  };
  
  const baseScore = moodScores[mood];
  
  // Get mood history for consistency bonus
  const moodHistory = getMoodHistory();
  if (moodHistory.length >= 3) {
    const recentMoods = moodHistory.slice(-3);
    const positiveCount = recentMoods.filter(entry => 
      ['happy', 'excited'].includes(entry.mood)
    ).length;
    
    // Consistency bonus for positive streak
    const consistencyBonus = positiveCount >= 2 ? 10 : 0;
    return Math.min(100, baseScore + consistencyBonus);
  }
  
  // First-time user gets base score
  return baseScore;
}

function getMoodHistory(): Array<{ date: string; mood: Mood }> {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('daylight_mood_history');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getProgressMetrics(tasks: Task[], mood: Mood | null): ProgressMetrics {
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  
  // Daily goal: complete at least 3 tasks
  const dailyGoalProgress = Math.min(100, (completedTasks / 3) * 100);
  
  // Calculate streak days based on mood history
  const moodHistory = getMoodHistory();
  let streakDays = 0;
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toDateString();
    
    const entryForDate = moodHistory.find(entry => entry.date === dateStr);
    if (entryForDate) {
      streakDays++;
    } else {
      break; // Streak broken
    }
  }
  
  return {
    productivity: calculateProductivity(tasks),
    wellness: calculateWellness(mood),
    completedTasks,
    totalTasks,
    dailyGoalProgress: Math.round(dailyGoalProgress),
    streakDays
  };
}

export function getAppMetrics(): AppMetrics {
  // Simulate realistic performance metrics with some randomness
  const baseTime = Date.now();
  
  // CPU usage varies based on activity and time
  const cpuVariation = Math.sin(baseTime / 10000) * 10 + Math.random() * 15;
  const cpuUsage = Math.max(8, Math.min(45, 20 + cpuVariation));
  
  // Memory usage tends to slowly increase over time
  const sessionMinutes = Math.floor((baseTime % (24 * 60 * 60 * 1000)) / (60 * 1000));
  const memoryBase = 35 + (sessionMinutes * 0.01); // Slowly increases
  const memoryUsage = Math.max(30, Math.min(70, memoryBase + Math.random() * 10));
  
  // Network activity is more sporadic
  const networkBase = Math.sin(baseTime / 5000) * 20 + 25;
  const networkUsage = Math.max(5, Math.min(85, networkBase + Math.random() * 20));
  
  // Session time in minutes (simulated)
  const sessionTime = sessionMinutes % 240; // Reset every 4 hours for demo
  
  // Data points processed (tasks + mood entries + transactions)
  const dataPoints = getTotalDataPoints();
  
  return {
    cpuUsage: Math.round(cpuUsage),
    memoryUsage: Math.round(memoryUsage),
    networkActivity: Math.round(networkUsage),
    sessionTime,
    dataPoints
  };
}

function getTotalDataPoints(): number {
  if (typeof window === 'undefined') return 0;
  
  let count = 0;
  
  // Count tasks
  try {
    const tasks = localStorage.getItem('daylight_tasks');
    if (tasks) count += JSON.parse(tasks).length;
  } catch {}
  
  // Count mood entries
  try {
    const moods = localStorage.getItem('daylight_mood_history');
    if (moods) count += JSON.parse(moods).length;
  } catch {}
  
  // Count transactions
  try {
    const transactions = localStorage.getItem('daylight_transactions');
    if (transactions) count += JSON.parse(transactions).length;
  } catch {}
  
  return count;
}

export function formatSessionTime(minutes: number): string {
  if (minutes < 1) return 'Just started';
  if (minutes < 60) return `${Math.round(minutes)}m`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}
