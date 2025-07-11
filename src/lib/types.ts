import type { LucideIcon } from 'lucide-react';

export type Mood = 'happy' | 'sad' | 'neutral' | 'excited' | 'anxious' | 'frustrated';

export type Task = {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
};

export type TransactionType = 'income' | 'expense';

export type TransactionCategory = 'Salary' | 'Food' | 'Transport' | 'Shopping' | 'Bills' | 'Entertainment' | 'Other';

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: TransactionCategory;
  date: Date;
};

export interface MoodOption {
  value: Mood;
  label: string;
  icon: LucideIcon;
  color: string;
}
