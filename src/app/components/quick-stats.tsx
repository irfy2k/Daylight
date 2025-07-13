"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Zap, Calendar, DollarSign, CheckSquare } from 'lucide-react';
import type { Task, Transaction, Mood } from '@/lib/types';

interface QuickStatsProps {
  tasks: Task[];
  transactions: Transaction[];
  mood: Mood | null;
  notes: string;
}

export default function QuickStats({ tasks, transactions, mood, notes }: QuickStatsProps) {
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;
  
  const todayTransactions = transactions.filter(t => {
    const today = new Date().toDateString();
    return t.date.toDateString() === today;
  }).length;

  const productivityScore = Math.min(100, (completedTasks * 25) + (mood ? 20 : 0) + (notes.length > 0 ? 15 : 0));

  const stats = [
    {
      label: 'Tasks Done',
      value: `${completedTasks}/${totalTasks}`,
      progress: completionRate,
      icon: <CheckSquare className="size-4" />,
      color: 'text-green-400'
    },
    {
      label: 'Net Balance',
      value: `$${netBalance.toFixed(2)}`,
      progress: Math.max(0, Math.min(100, ((netBalance + 1000) / 2000) * 100)), // Arbitrary scale
      icon: <DollarSign className="size-4" />,
      color: netBalance >= 0 ? 'text-green-400' : 'text-red-400'
    },
    {
      label: 'Productivity',
      value: `${productivityScore}%`,
      progress: productivityScore,
      icon: <TrendingUp className="size-4" />,
      color: 'text-blue-400'
    },
    {
      label: 'Today Activity',
      value: `${todayTransactions} entries`,
      progress: Math.min(100, todayTransactions * 10), // 10 entries = 100%
      icon: <Zap className="size-4" />,
      color: 'text-purple-400'
    }
  ];

  return (
    <Card className="bg-gray-900 border-gray-700 card-hover">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="size-5" />
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between min-h-[20px]">
                <div className="flex items-center gap-1.5">
                  <span className={stat.color}>{stat.icon}</span>
                  <span className="text-xs text-gray-400 font-mono leading-none">{stat.label}</span>
                </div>
                <span className="text-sm text-white font-mono font-medium leading-none">{stat.value}</span>
              </div>
              <div className="w-full">
                <Progress 
                  value={stat.progress} 
                  className="h-2 bg-black rounded-full" 
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Additional info row */}
        <div className="pt-3 border-t border-gray-700 flex justify-between text-xs text-gray-400">
          <span>Mood: {mood ? mood.charAt(0).toUpperCase() + mood.slice(1) : 'Not set'}</span>
          <span>Notes: {notes.length} chars</span>
        </div>
      </CardContent>
    </Card>
  );
}
