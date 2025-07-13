"use client";

import type { FC } from 'react';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { Task, Mood } from '@/lib/types';
import { Calendar as CalendarIcon, PlusCircle, Trash2, Target, Zap, Clock, Brain, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { canMakeApiRequest, incrementApiUsage } from '@/lib/api-counter';
import { useToast } from '@/hooks/use-toast';

interface TaskListProps {
  tasks: Task[];
  addTask: (text: string, dueDate?: Date) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  mood?: Mood | null;
}

const TaskList: FC<TaskListProps> = ({ tasks, addTask, toggleTask, deleteTask, mood }) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<string[]>([]);
  const { toast } = useToast();

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      addTask(newTaskText.trim(), dueDate);
      setNewTaskText('');
      setDueDate(undefined);
    }
  };

  const generateTaskSuggestions = async () => {
    if (!canMakeApiRequest()) {
      toast({
        title: "Global API Limit Reached",
        description: "All 60 AI requests this hour have been used across all users. Try again later.",
        variant: 'destructive'
      });
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      incrementApiUsage();
      
      // Generate task suggestions based on mood and current tasks
      const moodBasedSuggestions = getMoodBasedTaskSuggestions(mood || null, tasks);
      setSuggestedTasks(moodBasedSuggestions);
      
      toast({
        title: "AI Task Suggestions Ready",
        description: "Generated personalized tasks based on your mood and activity.",
      });
    } catch (error) {
      console.error('Failed to generate task suggestions:', error);
      toast({
        title: "Error",
        description: "Could not generate task suggestions at this time.",
        variant: 'destructive',
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const getMoodBasedTaskSuggestions = (currentMood: Mood | null, existingTasks: Task[]): string[] => {
    const existingTasksText = existingTasks.map(t => t.text.toLowerCase());
    
    const suggestionsByMood: Record<Mood, string[]> = {
      'happy': [
        'Plan something fun for the weekend',
        'Call a friend or family member',
        'Start a creative project',
        'Write in a gratitude journal',
        'Organize a social gathering'
      ],
      'excited': [
        'Brainstorm new project ideas',
        'Research that topic you\'re curious about',
        'Plan your next adventure',
        'Share your excitement with someone',
        'Start learning something new'
      ],
      'neutral': [
        'Review and update your goals',
        'Organize your workspace',
        'Plan tomorrow\'s schedule',
        'Do some light reading',
        'Take a mindful walk'
      ],
      'sad': [
        'Reach out to a supportive friend',
        'Do a small act of self-care',
        'Watch or read something uplifting',
        'Get some gentle exercise',
        'Practice a breathing exercise'
      ],
      'anxious': [
        'Break down a big task into smaller steps',
        'Practice a 5-minute meditation',
        'Tidy up a small area',
        'Do some gentle stretching',
        'Write down your thoughts'
      ],
      'frustrated': [
        'Take a short break and walk',
        'Identify what\'s causing frustration',
        'Do a quick physical activity',
        'Talk to someone about your feelings',
        'Focus on one small, achievable task'
      ]
    };

    const defaultSuggestions = [
      'Review your daily priorities',
      'Take a 10-minute break',
      'Drink some water',
      'Check in with yourself'
    ];

    const moodSuggestions = currentMood ? suggestionsByMood[currentMood] : defaultSuggestions;
    
    // Filter out suggestions similar to existing tasks
    const filteredSuggestions = moodSuggestions.filter(suggestion => 
      !existingTasksText.some(existingTask => 
        existingTask.includes(suggestion.toLowerCase().split(' ')[0]) ||
        suggestion.toLowerCase().includes(existingTask.split(' ')[0])
      )
    );

    return filteredSuggestions.slice(0, 3);
  };

  const addSuggestedTask = (taskText: string) => {
    addTask(taskText);
    setSuggestedTasks(prev => prev.filter(t => t !== taskText));
  };

  return (
    <div className="space-y-4">
      {/* Your Tasks Header */}
      <div className="bg-black border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <Target className="size-6 text-white animate-pulse" />
          <div>
            <h2 className="text-lg font-bold text-white font-mono">YOUR TASKS</h2>
            <p className="text-xs text-gray-400 font-mono">THINGS TO DO • {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white">ACTIVE</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="size-3 text-white" />
              <span className="text-white">TRACKING</span>
            </div>
          </div>
          <span className="text-white">{tasks.filter(t => !t.completed).length} LEFT TO DO</span>
        </div>
      </div>

      {/* Add New Task */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
        <h3 className="text-sm font-semibold text-white font-mono mb-3 flex items-center gap-2">
          <PlusCircle className="size-4" />
          ADD NEW TASK
        </h3>
        
        <form onSubmit={handleAddTask} className="space-y-3">
          <Input
            placeholder="What do you need to do?"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="bg-black border-gray-600 text-white placeholder:text-gray-500 font-mono focus:border-white focus:ring-white/20 transition-all duration-300"
          />
          
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-mono bg-black border-gray-600 text-white hover:bg-black transition-all duration-300",
                    !dueDate && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PP") : "Set due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className="bg-gray-900 text-white"
                />
              </PopoverContent>
            </Popover>
            
            <Button 
              type="submit" 
              className="bg-white hover:bg-gray-200 text-black font-mono px-6 transition-all duration-300"
            >
              <PlusCircle className="size-4 mr-1" />
              ADD
            </Button>
          </div>
        </form>
      </div>
      
      {/* AI Task Suggestions */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
            <Brain className="size-4" />
            AI TASK SUGGESTIONS
          </h3>
          <Button
            onClick={generateTaskSuggestions}
            disabled={isLoadingSuggestions}
            className="bg-white hover:bg-gray-200 text-black font-mono text-xs px-3 py-1 h-auto transition-all duration-300"
          >
            {isLoadingSuggestions ? (
              <>
                <Loader2 className="size-3 mr-1 animate-spin" />
                THINKING...
              </>
            ) : (
              <>
                <Brain className="size-3 mr-1" />
                SUGGEST
              </>
            )}
          </Button>
        </div>
        
        {suggestedTasks.length > 0 ? (
          <div className="space-y-2">
            {suggestedTasks.map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-black border border-gray-600 rounded card-hover transition-all duration-300 hover:bg-black">
                <span className="text-sm text-gray-300 font-mono flex-1">{suggestion}</span>
                <Button
                  onClick={() => addSuggestedTask(suggestion)}
                  className="bg-white hover:bg-gray-200 text-black font-mono text-xs px-2 py-1 h-auto ml-2"
                >
                  <PlusCircle className="size-3 mr-1" />
                  ADD
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-3">
            <div className="text-gray-400 font-mono text-sm">
              {mood ? `Click "SUGGEST" for ${mood.toUpperCase()} mood tasks` : 'Set your mood to get personalized suggestions'}
            </div>
          </div>
        )}
      </div>
      
      {/* Task List */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
        <h3 className="text-sm font-semibold text-white font-mono mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          YOUR TASKS
        </h3>
        
        <div className="space-y-2">
          {tasks.length > 0 ? tasks.map(task => (
            <div key={task.id} className={cn(
              "group flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 card-hover",
              task.completed 
                ? "bg-gray-800 border-gray-600" 
                : "bg-black border-gray-600 hover:border-gray-500 hover:bg-black"
            )}>
              <div className="relative">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="border-gray-600 data-[state=checked]:bg-white data-[state=checked]:border-white"
                />
                {task.completed && (
                  <div className="absolute inset-0 bg-white/20 rounded blur-sm animate-pulse" />
                )}
              </div>
              
              <div className="flex-1">
                <label
                  htmlFor={`task-${task.id}`}
                  className={cn(
                    "block text-sm font-mono cursor-pointer transition-all",
                    task.completed 
                      ? "line-through text-white/70" 
                      : "text-white hover:text-gray-300"
                  )}
                >
                  {task.text}
                </label>
                {task.dueDate && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="size-3 text-gray-500" />
                    <span className="text-xs text-gray-500 font-mono">
                      {format(task.dueDate, "MMM dd, yyyy")}
                    </span>
                  </div>
                )}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-300 hover:bg-gray-500/10" 
                onClick={() => deleteTask(task.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )) : (
            <div className="text-center py-8">
              <Target className="size-12 text-gray-600 mx-auto mb-3 opacity-50" />
              <p className="text-gray-500 font-mono text-sm">NO TASKS YET</p>
              <p className="text-gray-600 font-mono text-xs">Add your first task above</p>
            </div>
          )}
        </div>
        
        {tasks.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-800">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-400">
                DONE: {tasks.filter(t => t.completed).length}/{tasks.length}
              </span>
              <span className="text-white">
                PROGRESS: {tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
