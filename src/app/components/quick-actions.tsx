"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Zap, DollarSign, CheckSquare, Download, Upload, Copy, Trash2 } from 'lucide-react';
import type { Task, Transaction, TransactionType, TransactionCategory } from '@/lib/types';

interface QuickActionsProps {
  onAddTask: (text: string, dueDate?: Date) => void;
  onAddTransaction: (data: {
    type: TransactionType;
    amount: number;
    description: string;
    category: TransactionCategory;
  }) => void;
  tasks: Task[];
  transactions: Transaction[];
  notes: string;
  mood: string | null;
}

export default function QuickActions({ 
  onAddTask, 
  onAddTransaction, 
  tasks, 
  transactions, 
  notes, 
  mood 
}: QuickActionsProps) {
  const [quickTaskText, setQuickTaskText] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickTransactionType, setQuickTransactionType] = useState<TransactionType>('expense');
  const [showExportDialog, setShowExportDialog] = useState(false);

  const handleQuickTask = () => {
    if (quickTaskText.trim()) {
      onAddTask(quickTaskText.trim());
      setQuickTaskText('');
    }
  };

  const handleQuickTransaction = () => {
    const amount = parseFloat(quickAmount);
    if (amount > 0) {
      onAddTransaction({
        type: quickTransactionType,
        amount,
        description: `Quick ${quickTransactionType}`,
        category: quickTransactionType === 'income' ? 'Other' : 'Other'
      });
      setQuickAmount('');
    }
  };

  const exportData = () => {
    const data = {
      tasks,
      transactions: transactions.map(t => ({
        ...t,
        date: t.date.toISOString()
      })),
      notes,
      mood,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daylight-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Store imported data to localStorage
        if (data.tasks) localStorage.setItem('daylight_tasks', JSON.stringify(data.tasks));
        if (data.transactions) localStorage.setItem('daylight_transactions', JSON.stringify(data.transactions));
        if (data.notes) localStorage.setItem('daylight_notes', data.notes);
        if (data.mood) localStorage.setItem('daylight_mood', data.mood);
        
        // Reload page to apply imported data
        window.location.reload();
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem('daylight_tasks');
      localStorage.removeItem('daylight_transactions');
      localStorage.removeItem('daylight_notes');
      localStorage.removeItem('daylight_mood');
      localStorage.removeItem('daylight_mood_date');
      window.location.reload();
    }
  };

  const copyStatsToClipboard = () => {
    const stats = `📊 Daylight Daily Stats
📝 Tasks: ${tasks.filter(t => t.completed).length}/${tasks.length} completed
💰 Balance: $${(transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) - transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)).toFixed(2)}
😊 Mood: ${mood || 'Not set'}
📄 Notes: ${notes.length} characters
⚡ Generated on ${new Date().toLocaleDateString()}`;
    
    navigator.clipboard.writeText(stats);
    alert('Stats copied to clipboard!');
  };

  return (
    <Card className="bg-gray-900 border-gray-700 card-hover transition-all duration-300 hover:bg-black">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="size-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Add Task */}
        <div className="flex gap-2">
          <Input
            placeholder="Quick add task..."
            value={quickTaskText}
            onChange={(e) => setQuickTaskText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleQuickTask()}
            className="bg-black border-gray-600 text-white"
          />
          <Button 
            onClick={handleQuickTask}
            disabled={!quickTaskText.trim()}
            size="sm"
            className="bg-white text-black hover:bg-gray-200"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        {/* Quick Add Transaction */}
        <div className="flex gap-2">
          <Select value={quickTransactionType} onValueChange={(value: TransactionType) => setQuickTransactionType(value)}>
            <SelectTrigger className="w-20 bg-black border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">+</SelectItem>
              <SelectItem value="expense">-</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Amount"
            type="number"
            value={quickAmount}
            onChange={(e) => setQuickAmount(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleQuickTransaction()}
            className="bg-black border-gray-600 text-white"
          />
          <Button 
            onClick={handleQuickTransaction}
            disabled={!quickAmount || parseFloat(quickAmount) <= 0}
            size="sm"
            className="bg-white text-black hover:bg-gray-200"
          >
            <DollarSign className="size-4" />
          </Button>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-700">
          <Button 
            onClick={exportData}
            variant="outline" 
            size="sm"
            className="bg-black border-gray-600 text-white hover:bg-black"
          >
            <Download className="size-3 mr-1" />
            Export
          </Button>
          
          <label className="cursor-pointer">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-black border-gray-600 text-white hover:bg-black w-full"
              asChild
            >
              <span>
                <Upload className="size-3 mr-1" />
                Import
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>

          <Button 
            onClick={copyStatsToClipboard}
            variant="outline" 
            size="sm"
            className="bg-black border-gray-600 text-white hover:bg-black"
          >
            <Copy className="size-3 mr-1" />
            Copy Stats
          </Button>
          
          <Button 
            onClick={clearAllData}
            variant="outline" 
            size="sm"
            className="bg-red-900 border-red-600 text-red-200 hover:bg-red-800"
          >
            <Trash2 className="size-3 mr-1" />
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
