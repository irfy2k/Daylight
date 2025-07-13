"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, DollarSign, ArrowUp, ArrowDown, Clock, Calendar, Plus } from 'lucide-react';
import type { Task, Transaction } from '@/lib/types';

interface RecentActivityProps {
  tasks: Task[];
  transactions: Transaction[];
}

type ActivityItem = {
  id: string;
  type: 'task_completed' | 'task_added' | 'task_deleted' | 'transaction_income' | 'transaction_expense';
  description: string;
  timestamp: Date;
  amount?: number;
  icon: React.ReactNode;
  color: string;
};

export default function RecentActivity({ tasks, transactions }: RecentActivityProps) {
  const recentActivity = useMemo(() => {
    const activities: ActivityItem[] = [];
    
    // Add ALL tasks (both completed and incomplete) with their creation time
    tasks.forEach(task => {
      // Extract timestamp from task ID (format: task_1234567890)
      const idParts = task.id.split('_');
      const timestamp = idParts.length > 1 ? parseInt(idParts[1]) : Date.now();
      
      if (task.completed) {
        activities.push({
          id: `task-completed-${task.id}`,
          type: 'task_completed',
          description: `Completed: ${task.text}`,
          timestamp: new Date(timestamp),
          icon: <CheckSquare className="size-4" />,
          color: 'text-green-400'
        });
      } else {
        activities.push({
          id: `task-added-${task.id}`,
          type: 'task_added',
          description: `Added task: ${task.text}`,
          timestamp: new Date(timestamp),
          icon: <Plus className="size-4" />,
          color: 'text-blue-400'
        });
      }
    });
    
    // Add recent transactions - use actual transaction date
    transactions.forEach(transaction => {
      activities.push({
        id: `trans-${transaction.id}`,
        type: transaction.type === 'income' ? 'transaction_income' : 'transaction_expense',
        description: transaction.description,
        timestamp: new Date(transaction.date),
        amount: transaction.amount,
        icon: transaction.type === 'income' ? 
          <ArrowUp className="size-4" /> : 
          <ArrowDown className="size-4" />,
        color: transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
      });
    });
    
    // Sort by timestamp (most recent first) and take top 8
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 8);
  }, [tasks, transactions]);

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffSeconds < 5) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="bg-gray-900 border-gray-700 card-hover transition-all duration-300 hover:bg-black">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="size-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentActivity.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-4">
            No recent activity yet. Start by adding tasks or transactions!
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded bg-black border border-gray-700 hover:border-gray-600 transition-colors">
                <div className={`${activity.color} flex-shrink-0`}>
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-white text-sm font-medium truncate">
                    {activity.description}
                  </p>
                  <p className="text-gray-400 text-xs font-mono">
                    {getRelativeTime(activity.timestamp)}
                  </p>
                </div>
                {activity.amount && (
                  <div className="flex-shrink-0">
                    <Badge 
                      variant="outline" 
                      className={`${activity.color} border-current text-xs font-mono`}
                    >
                      ${activity.amount.toFixed(2)}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
