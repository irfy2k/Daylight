"use client";

import { useState, useEffect } from 'react';
import { Sun, Grid3X3, SmilePlus, CheckSquare, CreditCard, Activity, Brain, Zap, Eye, Lock } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Task, Transaction, Mood, TransactionCategory, TransactionType } from '@/lib/types';
import { getApiUsage, getRemainingRequests, startGlobalSync, getTotalGlobalRequests } from '@/lib/api-counter';
import { getProgressMetrics, getAppMetrics } from '@/lib/progress-calculator';
import { useToast } from "@/hooks/use-toast";
import DailySummary from '@/app/components/daily-summary';
import MoodLogger from '@/app/components/mood-logger';
import TaskList from '@/app/components/task-list';
import FinanceTracker from '@/app/components/finance-tracker';
import LoadingScreen from '@/app/components/loading-screen';
import WelcomeDialog from '@/app/components/welcome-dialog';
import MoodConfirmationDialog from '@/app/components/mood-confirmation-dialog';
import AppTutorial from '@/app/components/app-tutorial';
import MoodAnalytics from '@/app/components/mood-analytics';
import QuickActions from '@/app/components/quick-actions';
import RecentActivity from '@/app/components/recent-activity';

export default function Home() {
  // ALL hooks must be declared first, before any conditional returns
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [mood, setMood] = useState<Mood | null>(null);
  const [moodSetDate, setMoodSetDate] = useState<string | null>(null);
  const [showMoodConfirmation, setShowMoodConfirmation] = useState(false);
  const [pendingMood, setPendingMood] = useState<{ mood: Mood; isAiSuggested: boolean } | null>(null);
  const [notes, setNotes] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [globalApiUsage, setGlobalApiUsage] = useState(() => getApiUsage());
  
  // Tab switching state
  const [activeTab, setActiveTab] = useState('summary');
  
  // Progress metrics state
  const [progressMetrics, setProgressMetrics] = useState(() => getProgressMetrics([], null));
  const [appMetrics, setAppMetrics] = useState(() => getAppMetrics());

  // Hooks
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    // Load tasks
    const storedTasks = localStorage.getItem('daylight_tasks');
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        // Convert date strings back to Date objects for dueDate
        const tasksWithDates = parsedTasks.map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }));
        setTasks(tasksWithDates);
      } catch (error) {
        console.error('Error parsing stored tasks:', error);
      }
    }

    // Load transactions
    const storedTransactions = localStorage.getItem('daylight_transactions');
    if (storedTransactions) {
      try {
        const parsedTransactions = JSON.parse(storedTransactions);
        // Convert date strings back to Date objects
        const transactionsWithDates = parsedTransactions.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        }));
        setTransactions(transactionsWithDates);
      } catch (error) {
        console.error('Error parsing stored transactions:', error);
      }
    }

    // Load notes
    const storedNotes = localStorage.getItem('daylight_notes');
    if (storedNotes) {
      setNotes(storedNotes);
    }

    // Load mood
    const storedMood = localStorage.getItem('daylight_mood');
    if (storedMood && storedMood !== '') {
      setMood(storedMood as Mood);
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    // Only save if we have tasks or if there was previously saved data
    const hasExistingData = localStorage.getItem('daylight_tasks') !== null;
    if (tasks.length > 0 || hasExistingData) {
      localStorage.setItem('daylight_tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    // Only save if we have transactions or if there was previously saved data
    const hasExistingData = localStorage.getItem('daylight_transactions') !== null;
    if (transactions.length > 0 || hasExistingData) {
      localStorage.setItem('daylight_transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    // Only save if we have notes or if there was previously saved data
    const hasExistingData = localStorage.getItem('daylight_notes') !== null;
    if (notes.trim() || hasExistingData) {
      localStorage.setItem('daylight_notes', notes);
    }
  }, [notes]);

  // Save mood to localStorage whenever mood changes
  useEffect(() => {
    // Only save if we have a mood or if there was previously saved data
    const hasExistingData = localStorage.getItem('daylight_mood') !== null;
    if (mood || hasExistingData) {
      localStorage.setItem('daylight_mood', mood || '');
    }
  }, [mood]);

  // Update progress metrics when tasks or mood change
  useEffect(() => {
    setProgressMetrics(getProgressMetrics(tasks, mood));
  }, [tasks, mood]);

  // Update app metrics every 30 seconds for realistic changes
  useEffect(() => {
    const interval = setInterval(() => {
      setAppMetrics(getAppMetrics());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Force loading to complete after 5 seconds maximum (longer than LoadingScreen's 1.5s)
  useEffect(() => {
    const forceComplete = setTimeout(() => {
      if (isLoading) {
        handleLoadingComplete();
      }
    }, 5000);

    return () => clearTimeout(forceComplete);
  }, [isLoading]);

  // Handle loading completion
  const handleLoadingComplete = () => {
    setIsLoading(false);
    
    // Check if this is the first time user is visiting
    const storedUserName = localStorage.getItem('daylight_user_name');
    const tutorialCompleted = localStorage.getItem('daylight_tutorial_completed');
    
    if (!storedUserName) {
      setShowWelcome(true);
    } else {
      setUserName(storedUserName);
      // Show tutorial if user exists but hasn't seen tutorial
      if (!tutorialCompleted) {
        setShowTutorial(true);
      }
    }
    
    // Check mood date restriction
    const storedMoodDate = localStorage.getItem('daylight_mood_date');
    setMoodSetDate(storedMoodDate);
  };

  // Handle welcome completion
  const handleWelcomeComplete = (name: string) => {
    setUserName(name);
    localStorage.setItem('daylight_user_name', name);
    setShowWelcome(false);
    // Show tutorial after welcome for first-time users
    setShowTutorial(true);
  };

  // Handle tutorial completion
  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem('daylight_tutorial_completed', 'true');
  };

  // Get today's date string for comparison
  const getTodayString = () => {
    return new Date().toDateString();
  };

  // Check if mood can be set today
  const canSetMoodToday = () => {
    const today = getTodayString();
    return !moodSetDate || moodSetDate !== today;
  };

  // Handle mood change with confirmation if already set today
  const handleMoodChange = (newMood: Mood, isAiSuggested: boolean = false) => {
    if (canSetMoodToday()) {
      // Can set mood freely
      setMood(newMood);
      const today = getTodayString();
      setMoodSetDate(today);
      localStorage.setItem('daylight_mood_date', today);
    } else {
      // Need confirmation
      setPendingMood({ mood: newMood, isAiSuggested });
      setShowMoodConfirmation(true);
    }
  };

  // Confirm mood change
  const confirmMoodChange = () => {
    if (pendingMood) {
      setMood(pendingMood.mood);
      const today = getTodayString();
      setMoodSetDate(today);
      localStorage.setItem('daylight_mood_date', today);
    }
    setShowMoodConfirmation(false);
    setPendingMood(null);
  };

  // Cancel mood change
  const cancelMoodChange = () => {
    setShowMoodConfirmation(false);
    setPendingMood(null);
  };

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Start global API counter synchronization
  useEffect(() => {
    startGlobalSync();
  }, []);

  // Listen for global API counter updates
  useEffect(() => {
    const handleGlobalUpdate = (event: any) => {
      setGlobalApiUsage(event.detail);
    };
    
    const handleGlobalReset = (event: any) => {
      setGlobalApiUsage(event.detail);
      console.log('UI updated: API counter reset for new hour');
    };
    
    window.addEventListener('globalApiUsageUpdate', handleGlobalUpdate);
    window.addEventListener('globalApiCounterReset', handleGlobalReset);
    
    return () => {
      window.removeEventListener('globalApiUsageUpdate', handleGlobalUpdate);
      window.removeEventListener('globalApiCounterReset', handleGlobalReset);
    };
  }, []);

  // Show loading screen first - AFTER all hooks
  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  const addTask = (text: string, dueDate?: Date) => {
    const newTask: Task = {
      id: `task_${Date.now()}`,
      text,
      completed: false,
      dueDate,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };


  const addTransaction = (data: {
    type: TransactionType;
    amount: number;
    description: string;
    category: TransactionCategory;
  }) => {
    const newTransaction: Transaction = {
      id: `trans_${Date.now()}`,
      ...data,
      date: new Date(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  // Quick action handlers
  const handleQuickAddTask = (text: string) => {
    addTask(text);
    toast({
      title: "Task added",
      description: `"${text}" added to your task list`,
    });
  };

  const handleQuickAddTransaction = (data: {
    type: TransactionType;
    amount: number;
    description: string;
    category: TransactionCategory;
  }) => {
    addTransaction(data);
    toast({
      title: `${data.type === 'expense' ? 'Expense' : 'Income'} added`,
      description: `$${data.amount} - ${data.description}`,
    });
  };

  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <>
      <WelcomeDialog 
        isOpen={showWelcome} 
        onComplete={handleWelcomeComplete}
      />
      
      <MoodConfirmationDialog
        isOpen={showMoodConfirmation}
        currentMood={mood}
        newMood={pendingMood?.mood || 'happy'}
        isAiSuggested={pendingMood?.isAiSuggested || false}
        onConfirm={confirmMoodChange}
        onCancel={cancelMoodChange}
      />
      
      <AppTutorial 
        isOpen={showTutorial} 
        onComplete={handleTutorialComplete}
      />
      
      <div className="bg-black min-h-dvh relative overflow-hidden slide-in">
      {/* Minimalist background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/5 via-transparent to-gray-900/5" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/2 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-white/2 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="max-w-md mx-auto bg-black border border-gray-800 text-white flex flex-col min-h-dvh shadow-2xl relative z-10">
        {/* Enhanced Header */}
        <header className="p-4 border-b border-gray-800 bg-black/50 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sun className="text-white size-6 animate-pulse" />
                <div className="absolute inset-0 bg-white/10 rounded-full blur-sm" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-mono">
                  {userName ? `HELLO, ${userName.toUpperCase()}` : 'DAYLIGHT'}
                </h1>
                <p className="text-xs text-gray-400 font-mono">Daily Life Helper v1.0</p>
              </div>
            </div>
            
            {/* Real-time status indicators */}
            <div className="flex flex-col items-end gap-1">
              <div className="text-xs font-mono text-white">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300" />
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse delay-700" />
              </div>
            </div>
          </div>
          
          {/* AI Status Bar */}
          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Brain className="size-3 text-white" />
              <span className="text-gray-300 font-mono">AI HELPER</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="size-3 text-white" />
              <span className="text-gray-300 font-mono">ACTIVE</span>
            </div>
          </div>
          
          {/* Global API Request Counter */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs bg-gray-900 border border-gray-700 rounded p-2">
              <div className="flex items-center gap-2">
                <Zap className="size-3 text-white" />
                <span className="text-gray-300 font-mono">GLOBAL AI REQUESTS</span>
              </div>
              <div className="text-white font-mono">
                {globalApiUsage.count}/60 per hour
              </div>
            </div>
            <div className="flex items-center justify-between text-xs bg-black border border-gray-600 rounded p-1">
              <span className="text-gray-400 font-mono">TOTAL GLOBAL:</span>
              <span className="text-gray-300 font-mono">{globalApiUsage.totalGlobalRequests}</span>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            <TabsContent value="summary" className="mt-0">
              <div className="space-y-4">
                {/* Quick Actions and Recent Activity - stacked vertically */}
                <div className="space-y-4">
                  {/* Quick Actions */}
                  <QuickActions 
                    onAddTask={handleQuickAddTask}
                    onAddTransaction={handleQuickAddTransaction}
                    tasks={tasks}
                    transactions={transactions}
                    notes={notes}
                    mood={mood}
                  />
                  
                  {/* Recent Activity */}
                  <RecentActivity 
                    tasks={tasks} 
                    transactions={transactions} 
                  />
                </div>
                
                {/* Original Daily Summary */}
                <DailySummary mood={mood} notes={notes} tasks={tasks} transactions={transactions} />
              </div>
            </TabsContent>
            <TabsContent value="mood" className="mt-0">
              <MoodLogger 
                mood={mood} 
                setMood={handleMoodChange} 
                notes={notes} 
                setNotes={setNotes}
                canSetMood={canSetMoodToday()}
              />
            </TabsContent>
            <TabsContent value="tasks" className="mt-0">
              <TaskList 
                tasks={tasks} 
                addTask={addTask} 
                toggleTask={toggleTask} 
                deleteTask={deleteTask}
                mood={mood}
              />
            </TabsContent>
            <TabsContent value="finance" className="mt-0">
              <FinanceTracker transactions={transactions} addTransaction={addTransaction} />
            </TabsContent>
            <TabsContent value="analytics" className="mt-0">
              <div className="space-y-4">
                {/* Mood Analytics */}
                <MoodAnalytics currentMood={mood} />
                
                {/* App Performance */}
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Activity className="size-5" />
                    Your Progress
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black border border-gray-600 rounded p-3 card-hover transition-all duration-300 hover:bg-gray-900">
                      <p className="text-xs text-white font-mono mb-1">PRODUCTIVITY</p>
                      <p className="text-xl font-bold text-white">{progressMetrics.productivity}%</p>
                      <div className="w-full bg-gray-800 rounded-full h-1 mt-2">
                        <div className="bg-white h-1 rounded-full transition-all duration-500" style={{ width: `${progressMetrics.productivity}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        {progressMetrics.completedTasks}/{progressMetrics.totalTasks} TASKS
                      </p>
                    </div>
                    <div className="bg-black border border-gray-600 rounded p-3 card-hover transition-all duration-300 hover:bg-gray-900">
                      <p className="text-xs text-white font-mono mb-1">WELLNESS</p>
                      <p className="text-xl font-bold text-white">{progressMetrics.wellness}%</p>
                      <div className="w-full bg-gray-800 rounded-full h-1 mt-2">
                        <div className="bg-white h-1 rounded-full transition-all duration-500" style={{ width: `${progressMetrics.wellness}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        {progressMetrics.streakDays} DAY STREAK
                      </p>
                    </div>
                  </div>
                  
                  {/* Daily Goal Progress */}
                  <div className="mt-4 bg-black border border-gray-600 rounded p-3 card-hover transition-all duration-300 hover:bg-gray-900">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-white font-mono">DAILY GOAL</p>
                      <p className="text-xs text-gray-400 font-mono">{progressMetrics.dailyGoalProgress}%</p>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${progressMetrics.dailyGoalProgress}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-1">
                      Complete 3 tasks today
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    App Performance
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400 font-mono">CPU USAGE</span>
                      <span className="text-xs text-white font-mono">{appMetrics.cpuUsage}%</span>
                    </div>
                    <div className="w-full bg-black border border-gray-600 rounded-full h-1">
                      <div className="bg-white h-1 rounded-full transition-all duration-1000" style={{ width: `${appMetrics.cpuUsage}%` }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400 font-mono">MEMORY</span>
                      <span className="text-xs text-white font-mono">{appMetrics.memoryUsage}%</span>
                    </div>
                    <div className="w-full bg-black border border-gray-600 rounded-full h-1">
                      <div className="bg-white h-1 rounded-full transition-all duration-1000" style={{ width: `${appMetrics.memoryUsage}%` }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400 font-mono">NETWORK</span>
                      <span className="text-xs text-white font-mono">{appMetrics.networkActivity}%</span>
                    </div>
                    <div className="w-full bg-black border border-gray-600 rounded-full h-1">
                      <div className="bg-white h-1 rounded-full transition-all duration-1000" style={{ width: `${appMetrics.networkActivity}%` }}></div>
                    </div>
                    
                    <div className="pt-2 mt-3 border-t border-gray-700">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-mono">DATA POINTS</span>
                        <span className="text-white font-mono">{appMetrics.dataPoints}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>

          {/* Enhanced Navigation */}
          <TabsList className="grid w-full grid-cols-5 h-16 rounded-none mt-auto border-t border-gray-800 bg-black/90 backdrop-blur-md">
            <TabsTrigger value="summary" className="flex-col gap-1 h-full rounded-none data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-t-2 border-t-white text-gray-400 hover:text-white transition-colors">
              <Grid3X3 className="size-4 fill-current" />
              <span className="text-[10px] font-mono">OVERVIEW</span>
            </TabsTrigger>
            <TabsTrigger value="mood" className="flex-col gap-1 h-full rounded-none data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-t-2 border-t-white text-gray-400 hover:text-white transition-colors">
              <SmilePlus className="size-4 fill-current" />
              <span className="text-[10px] font-mono">FEELINGS</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex-col gap-1 h-full rounded-none data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-t-2 border-t-white text-gray-400 hover:text-white transition-colors">
              <CheckSquare className="size-4 fill-current" />
              <span className="text-[10px] font-mono">TASKS</span>
            </TabsTrigger>
            <TabsTrigger value="finance" className="flex-col gap-1 h-full rounded-none data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-t-2 border-t-white text-gray-400 hover:text-white transition-colors">
              <CreditCard className="size-4 fill-current" />
              <span className="text-[10px] font-mono">MONEY</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex-col gap-1 h-full rounded-none data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-t-2 border-t-white text-gray-400 hover:text-white transition-colors">
              <Activity className="size-4 fill-current" />
              <span className="text-[10px] font-mono">STATS</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
    </>
  );
}
