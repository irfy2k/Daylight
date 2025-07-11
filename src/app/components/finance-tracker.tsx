"use client";

import type { FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Transaction, TransactionCategory, TransactionType } from '@/lib/types';
import { ArrowUpCircle, ArrowDownCircle, PlusCircle, DollarSign, TrendingUp, Database, Cpu } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface FinanceTrackerProps {
  transactions: Transaction[];
  addTransaction: (data: {
    type: TransactionType;
    amount: number;
    description: string;
    category: TransactionCategory;
  }) => void;
}

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['Salary', 'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other']),
});

const categories: TransactionCategory[] = ['Salary', 'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'];

const FinanceTracker: FC<FinanceTrackerProps> = ({ transactions, addTransaction }) => {
  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: 0,
      description: '',
      category: 'Food',
    },
  });

  function onSubmit(values: z.infer<typeof transactionSchema>) {
    addTransaction(values);
    form.reset();
  }
  
  return (
    <div className="space-y-4">
      {/* Money Tracker Header */}
      <div className="bg-black border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="size-6 text-white animate-pulse" />
          <div>
            <h2 className="text-lg font-bold text-white font-mono">MONEY TRACKER</h2>
            <p className="text-xs text-gray-400 font-mono">TRACK YOUR FINANCES</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-gray-900 border border-gray-600 rounded p-2 text-center card-hover transition-all duration-300 hover:bg-gray-800">
            <TrendingUp className="size-4 text-white mx-auto mb-1" />
            <p className="text-xs text-white font-mono">GROWTH</p>
            <p className="text-sm font-bold text-white">+12%</p>
          </div>
          <div className="bg-gray-900 border border-gray-600 rounded p-2 text-center card-hover transition-all duration-300 hover:bg-gray-800">
            <Database className="size-4 text-white mx-auto mb-1" />
            <p className="text-xs text-white font-mono">ENTRIES</p>
            <p className="text-sm font-bold text-white">{transactions.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-600 rounded p-2 text-center card-hover transition-all duration-300 hover:bg-gray-800">
            <Cpu className="size-4 text-white mx-auto mb-1" />
            <p className="text-xs text-white font-mono">STATUS</p>
            <p className="text-sm font-bold text-white">ACTIVE</p>
          </div>
        </div>
      </div>

      {/* Add Transaction */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
        <h3 className="text-sm font-semibold text-white font-mono mb-3 flex items-center gap-2">
          <PlusCircle className="size-4" />
          ADD TRANSACTION
        </h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="income" className="border-white text-white" />
                        </FormControl>
                        <FormLabel className="font-mono text-white text-sm">INCOME</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="expense" className="border-gray-500 text-gray-500" />
                        </FormControl>
                        <FormLabel className="font-mono text-gray-400 text-sm">EXPENSE</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white font-mono text-sm">AMOUNT</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      {...field} 
                      className="bg-black border-gray-600 text-white placeholder:text-gray-500 font-mono focus:border-white focus:ring-white/20 transition-all duration-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white font-mono text-sm">DESCRIPTION</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="What was this for?" 
                      {...field} 
                      className="bg-black border-gray-600 text-white placeholder:text-gray-500 font-mono focus:border-white focus:ring-white/20 transition-all duration-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white font-mono text-sm">CATEGORY</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-black border-gray-600 text-white font-mono focus:border-white focus:ring-white/20 transition-all duration-300">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat} className="text-white font-mono hover:bg-gray-800">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-white hover:bg-gray-200 text-black font-mono transition-all duration-300"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              ADD TRANSACTION
            </Button>
          </form>
        </Form>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
        <h3 className="text-sm font-semibold text-white font-mono mb-4 flex items-center gap-2">
          <Database className="size-4" />
          RECENT TRANSACTIONS
        </h3>
        
        <div className="space-y-2">
          {transactions.length > 0 ? transactions.map(t => (
            <div key={t.id} className={`
              flex items-center justify-between p-3 rounded-lg border transition-all duration-300 card-hover
              ${t.type === 'income' 
                ? 'bg-gray-800 border-gray-600 hover:bg-gray-700' 
                : 'bg-black border-gray-600 hover:bg-gray-900'
              }
            `}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  {t.type === 'income' ? (
                    <ArrowUpCircle className="text-white size-5" />
                  ) : (
                    <ArrowDownCircle className="text-gray-400 size-5" />
                  )}
                  <div className={`absolute inset-0 rounded-full blur-sm animate-pulse ${
                    t.type === 'income' ? 'bg-white/20' : 'bg-gray-400/20'
                  }`} />
                </div>
                
                <div>
                  <p className="font-mono text-white text-sm">{t.description}</p>
                  <p className="text-xs text-gray-400 font-mono">{t.category}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-mono font-bold ${
                  t.type === 'income' ? 'text-white' : 'text-gray-400'
                }`}>
                  {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  {new Date(t.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          )) : (
            <div className="text-center py-8">
              <Database className="size-12 text-gray-600 mx-auto mb-3 opacity-50" />
              <p className="text-gray-500 font-mono text-sm">NO TRANSACTIONS YET</p>
              <p className="text-gray-600 font-mono text-xs">Add your first transaction above</p>
            </div>
          )}
        </div>
        
        {transactions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-800">
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="text-center">
                <p className="text-gray-400">INCOME</p>
                <p className="text-white font-bold">
                  +${transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400">EXPENSES</p>
                <p className="text-gray-400 font-bold">
                  -${transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceTracker;
