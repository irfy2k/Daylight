"use client";

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Task, Transaction, Mood } from '@/lib/types';
import { moodOptions } from './mood-logger';
import { ArrowDown, ArrowUp, Zap, Target, DollarSign, Brain, TrendingUp, Calendar } from 'lucide-react';

interface DailySummaryProps {
  mood: Mood | null;
  notes: string;
  tasks: Task[];
  transactions: Transaction[];
}

const DailySummary: FC<DailySummaryProps> = ({ mood, notes, tasks, transactions }) => {
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const tasksProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const selectedMood = mood ? moodOptions.find(option => option.value === mood) : null;

  // Calculate dynamic figures
  const getEnergyLevel = () => {
    if (!mood) return 'UNKNOWN';
    const energyMap: Record<Mood, string> = {
      'excited': 'HIGH',
      'happy': 'HIGH', 
      'neutral': 'MEDIUM',
      'sad': 'LOW',
      'anxious': 'LOW',
      'frustrated': 'MEDIUM'
    };
    return energyMap[mood];
  };

  const getFocusScore = () => {
    if (totalTasks === 0) return 0;
    const baseScore = tasksProgress;
    const moodBonus = mood === 'excited' || mood === 'happy' ? 15 : 
                     mood === 'frustrated' || mood === 'anxious' ? -10 : 0;
    return Math.min(100, Math.max(0, Math.round(baseScore + moodBonus)));
  };

  const getTrend = () => {
    const focus = getFocusScore();
    const energy = getEnergyLevel();
    
    if (focus >= 80 || energy === 'HIGH') return '↗ UP';
    if (focus <= 30 || energy === 'LOW') return '↘ DOWN';
    return '→ STABLE';
  };

  return (
    <div className="space-y-4">
      {/* Overview Header */}
      <div className="bg-black border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="size-6 text-white animate-pulse" />
          <div>
            <h2 className="text-lg font-bold text-white font-mono">TODAY'S OVERVIEW</h2>
            <div className="text-xs text-gray-400 font-mono">YOUR DAILY SNAPSHOT • {new Date().toLocaleDateString()}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-gray-900 border border-gray-600 rounded p-2 text-center card-hover transition-all duration-300 hover:bg-black">
            <Zap className="size-4 text-white mx-auto mb-1" />
            <div className="text-xs text-white font-mono">ENERGY</div>
            <div className="text-sm font-bold text-white">{getEnergyLevel()}</div>
          </div>
          <div className="bg-gray-900 border border-gray-600 rounded p-2 text-center card-hover transition-all duration-300 hover:bg-black">
            <Target className="size-4 text-white mx-auto mb-1" />
            <div className="text-xs text-white font-mono">FOCUS</div>
            <div className="text-sm font-bold text-white">{getFocusScore()}%</div>
          </div>
          <div className="bg-gray-900 border border-gray-600 rounded p-2 text-center card-hover transition-all duration-300 hover:bg-black">
            <TrendingUp className="size-4 text-white mx-auto mb-1" />
            <div className="text-xs text-white font-mono">TREND</div>
            <div className="text-sm font-bold text-white">{getTrend()}</div>
          </div>
        </div>
      </div>

      {/* Current Mood */}
      {selectedMood && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
          <div className="flex items-center gap-3 mb-3">
            <selectedMood.icon className="size-8 text-white animate-pulse" />
            <div>
              <h3 className="text-sm font-semibold text-white font-mono">HOW YOU'RE FEELING</h3>
              <div className="text-lg font-bold text-white capitalize">{selectedMood.label}</div>
            </div>
          </div>
          {notes && (
            <div className="bg-black border border-gray-600 rounded p-3 mt-3 card-hover transition-all duration-300 hover:bg-black">
              <div className="text-xs text-gray-400 font-mono mb-1">YOUR THOUGHTS:</div>
              <div className="text-sm text-gray-300 italic">"{notes}"</div>
            </div>
          )}
        </div>
      )}

      {/* Your Tasks */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
        <div className="flex items-center gap-2 mb-3">
          <Target className="size-5 text-white" />
          <h3 className="text-sm font-semibold text-white font-mono">YOUR TASKS</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400 font-mono">COMPLETED</span>
            <span className="text-sm font-bold text-white font-mono">{completedTasks}/{totalTasks}</span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-black rounded-full h-2 border border-gray-600">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-1000 relative"
                style={{ width: `${tasksProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/50 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="text-xs text-gray-400 font-mono mt-1">PROGRESS: {tasksProgress.toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* Money Overview */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="size-5 text-white" />
          <h3 className="text-sm font-semibold text-white font-mono">MONEY OVERVIEW</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-2 bg-black border border-gray-600 rounded card-hover transition-all duration-300 hover:bg-black">
            <div className="flex items-center gap-2">
              <ArrowUp className="size-4 text-white" />
              <span className="text-xs font-mono text-white">INCOME</span>
            </div>
            <span className="font-mono font-bold text-white">+${totalIncome.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center p-2 bg-black border border-gray-600 rounded card-hover transition-all duration-300 hover:bg-black">
            <div className="flex items-center gap-2">
              <ArrowDown className="size-4 text-gray-400" />
              <span className="text-xs font-mono text-gray-400">EXPENSES</span>
            </div>
            <span className="font-mono font-bold text-gray-400">-${totalExpenses.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center p-2 bg-black border border-gray-600 rounded card-hover transition-all duration-300 hover:bg-black">
            <span className="text-xs font-mono text-white">BALANCE</span>
            <span className={`font-mono font-bold ${netBalance >= 0 ? 'text-white' : 'text-gray-400'}`}>
              {netBalance >= 0 ? `+$${netBalance.toFixed(2)}` : `-$${Math.abs(netBalance).toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySummary;
