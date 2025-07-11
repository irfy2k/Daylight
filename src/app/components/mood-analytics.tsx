"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, BarChart3, Brain, Activity } from 'lucide-react';
import type { Mood } from '@/lib/types';

interface MoodEntry {
  date: string;
  mood: Mood;
}

interface MoodAnalyticsProps {
  currentMood: Mood | null;
}

const MoodAnalytics: React.FC<MoodAnalyticsProps> = ({ currentMood }) => {
  const [viewPeriod, setViewPeriod] = useState<'week' | 'month'>('week');
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [trends, setTrends] = useState<any>(null);

  // Load mood history from localStorage
  useEffect(() => {
    const loadMoodHistory = () => {
      const stored = localStorage.getItem('daylight_mood_history');
      if (stored) {
        try {
          const history: MoodEntry[] = JSON.parse(stored);
          setMoodHistory(history);
        } catch (error) {
          console.error('Error loading mood history:', error);
          setMoodHistory([]);
        }
      }
    };

    loadMoodHistory();
  }, []);

  // Save current mood to history
  useEffect(() => {
    if (currentMood) {
      const today = new Date().toDateString();
      const newEntry: MoodEntry = { date: today, mood: currentMood };
      
      setMoodHistory(prev => {
        // Remove any existing entry for today
        const filtered = prev.filter(entry => entry.date !== today);
        const updated = [...filtered, newEntry];
        
        // Keep only last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recent = updated.filter(entry => new Date(entry.date) >= thirtyDaysAgo);
        
        // Save to localStorage
        localStorage.setItem('daylight_mood_history', JSON.stringify(recent));
        
        return recent;
      });
    }
  }, [currentMood]);

  // Calculate trends and stats
  useEffect(() => {
    if (moodHistory.length === 0) {
      setTrends(null);
      return;
    }

    const daysToAnalyze = viewPeriod === 'week' ? 7 : 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToAnalyze);

    const relevantEntries = moodHistory.filter(entry => 
      new Date(entry.date) >= cutoffDate
    );

    if (relevantEntries.length === 0) {
      setTrends(null);
      return;
    }

    // Count mood frequencies
    const moodCounts: Record<Mood, number> = {
      happy: 0,
      sad: 0,
      neutral: 0,
      excited: 0,
      anxious: 0,
      frustrated: 0
    };

    relevantEntries.forEach(entry => {
      moodCounts[entry.mood]++;
    });

    // Find most common mood
    const mostCommon = Object.entries(moodCounts).reduce((a, b) => 
      moodCounts[a[0] as Mood] > moodCounts[b[0] as Mood] ? a : b
    )[0] as Mood;

    // Calculate mood score (happiness index)
    const moodScores: Record<Mood, number> = {
      happy: 5,
      excited: 5,
      neutral: 3,
      sad: 1,
      anxious: 2,
      frustrated: 1
    };

    const averageScore = relevantEntries.reduce((sum, entry) => 
      sum + moodScores[entry.mood], 0
    ) / relevantEntries.length;

    // Calculate trend direction
    const recentEntries = relevantEntries.slice(-3);
    const olderEntries = relevantEntries.slice(0, 3);
    
    const recentAvg = recentEntries.length > 0 
      ? recentEntries.reduce((sum, entry) => sum + moodScores[entry.mood], 0) / recentEntries.length 
      : averageScore;
    
    const olderAvg = olderEntries.length > 0 
      ? olderEntries.reduce((sum, entry) => sum + moodScores[entry.mood], 0) / olderEntries.length 
      : averageScore;

    const trendDirection = recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable';

    setTrends({
      totalDays: relevantEntries.length,
      mostCommon,
      averageScore,
      trendDirection,
      moodCounts,
      daysAnalyzed: daysToAnalyze
    });
  }, [moodHistory, viewPeriod]);

  const getMoodEmoji = (mood: Mood): string => {
    const emojis: Record<Mood, string> = {
      happy: '😊',
      excited: '🤩',
      neutral: '😐',
      sad: '😢',
      anxious: '😰',
      frustrated: '😤'
    };
    return emojis[mood];
  };

  const getTrendIcon = () => {
    if (!trends) return <Activity className="size-4" />;
    
    switch (trends.trendDirection) {
      case 'improving':
        return <TrendingUp className="size-4 text-green-400" />;
      case 'declining':
        return <TrendingUp className="size-4 text-red-400 rotate-180" />;
      default:
        return <Activity className="size-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 4) return 'text-green-400';
    if (score >= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-black border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <BarChart3 className="size-6 text-white animate-pulse" />
            <div className="absolute inset-0 bg-white/10 rounded-full blur-sm animate-ping" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-mono">MOOD TRENDS</h2>
            <p className="text-xs text-gray-400 font-mono">ANALYZE YOUR EMOTIONAL PATTERNS</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          <Button
            variant={viewPeriod === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewPeriod('week')}
            className="font-mono text-xs bg-white text-black hover:bg-gray-200 border-gray-600"
          >
            <Calendar className="size-3 mr-1" />
            WEEK
          </Button>
          <Button
            variant={viewPeriod === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewPeriod('month')}
            className="font-mono text-xs bg-white text-black hover:bg-gray-200 border-gray-600"
          >
            <Calendar className="size-3 mr-1" />
            MONTH
          </Button>
        </div>
      </div>

      {/* Analytics */}
      {!trends ? (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
          <div className="text-center py-8">
            <Brain className="size-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-mono text-sm">NO DATA YET</p>
            <p className="text-gray-500 font-mono text-xs mt-1">
              Start logging your mood to see trends
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
            <h3 className="text-sm font-semibold text-white font-mono mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              OVERVIEW ({trends.daysAnalyzed} DAYS)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black border border-gray-600 rounded p-3 card-hover transition-all duration-300 hover:bg-gray-900">
                <p className="text-xs text-gray-400 font-mono mb-1">DAYS TRACKED</p>
                <p className="text-xl font-bold text-white">{trends.totalDays}</p>
              </div>
              
              <div className="bg-black border border-gray-600 rounded p-3 card-hover transition-all duration-300 hover:bg-gray-900">
                <p className="text-xs text-gray-400 font-mono mb-1">MOOD SCORE</p>
                <p className={`text-xl font-bold ${getScoreColor(trends.averageScore)}`}>
                  {(trends.averageScore * 20).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          {/* Most Common Mood & Trend */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black border border-gray-600 rounded p-3 card-hover transition-all duration-300 hover:bg-gray-900">
                <p className="text-xs text-gray-400 font-mono mb-2">MOST COMMON</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getMoodEmoji(trends.mostCommon)}</span>
                  <div>
                    <p className="text-sm font-bold text-white uppercase">{trends.mostCommon}</p>
                    <p className="text-xs text-gray-400">
                      {trends.moodCounts[trends.mostCommon]} times
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-black border border-gray-600 rounded p-3 card-hover transition-all duration-300 hover:bg-gray-900">
                <p className="text-xs text-gray-400 font-mono mb-2">TREND</p>
                <div className="flex items-center gap-2">
                  {getTrendIcon()}
                  <div>
                    <p className="text-sm font-bold text-white uppercase">{trends.trendDirection}</p>
                    <p className="text-xs text-gray-400">
                      Past {Math.min(3, trends.totalDays)} days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mood Breakdown */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
            <h3 className="text-sm font-semibold text-white font-mono mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              BREAKDOWN
            </h3>
            
            <div className="space-y-2">
              {Object.entries(trends.moodCounts)
                .filter(([_, count]) => (count as number) > 0)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([mood, count]) => {
                  const percentage = ((count as number) / trends.totalDays) * 100;
                  return (
                    <div key={mood} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getMoodEmoji(mood as Mood)}</span>
                        <span className="text-xs font-mono text-gray-300 uppercase">{mood}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-black border border-gray-600 rounded-full h-1">
                          <div 
                            className="bg-white h-1 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-gray-400 w-8">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MoodAnalytics;
