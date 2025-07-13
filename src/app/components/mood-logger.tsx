"use client";

import type { FC, Dispatch, SetStateAction } from 'react';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Mood, MoodOption } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Smile, Frown, Meh, Laugh, Angry, Drama, WandSparkles, Loader2, Zap } from 'lucide-react';
import { suggestMoodFromNotes } from '@/ai/flows/suggest-mood-from-notes';
import { useToast } from '@/hooks/use-toast';
import { getApiUsage, incrementApiUsage, canMakeApiRequest, getRemainingRequests, formatTimeUntilReset } from '@/lib/api-counter';

export const moodOptions: MoodOption[] = [
  { value: 'happy', label: 'Happy', icon: Smile, color: 'text-green-500' },
  { value: 'sad', label: 'Sad', icon: Frown, color: 'text-blue-500' },
  { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-gray-500' },
  { value: 'excited', label: 'Excited', icon: Laugh, color: 'text-yellow-500' },
  { value: 'anxious', label: 'Anxious', icon: Drama, color: 'text-purple-500' },
  { value: 'frustrated', label: 'Frustrated', icon: Angry, color: 'text-red-500' },
];

interface MoodLoggerProps {
  mood: Mood | null;
  setMood: (mood: Mood, isAiSuggested?: boolean) => void;
  notes: string;
  setNotes: Dispatch<SetStateAction<string>>;
  canSetMood: boolean;
}

const MoodLogger: FC<MoodLoggerProps> = ({ mood, setMood, notes, setNotes, canSetMood }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiUsage, setApiUsage] = useState({ count: 0, resetTime: 0, lastRequest: 0 });
  const { toast } = useToast();

  // Update API usage on component mount and when needed
  useEffect(() => {
    const usage = getApiUsage();
    setApiUsage(usage);
  }, []);

  const handleSuggestMood = async () => {
    if (!notes) {
      toast({
        title: "No notes provided",
        description: "Please write some notes first to get a mood suggestion.",
        variant: 'destructive'
      });
      return;
    }

    if (!canMakeApiRequest()) {
      const timeLeft = formatTimeUntilReset();
      toast({
        title: "API Limit Reached",
        description: `You've used all 60 requests this hour. Try again in ${timeLeft}.`,
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Increment the API counter before making the request
      const newUsage = incrementApiUsage();
      setApiUsage(newUsage);

      const result = await suggestMoodFromNotes({ notes });
      if (result && result.suggestedMood) {
        setMood(result.suggestedMood, true); // Mark as AI suggested
        toast({
          title: "Mood Suggested!",
          description: `We've suggested "${result.suggestedMood}" with ${Math.round(result.confidence * 100)}% confidence.`,
        });
      }
    } catch (error: any) {
      console.error('Failed to suggest mood:', error);
      
      // Handle API limit errors specifically
      if (error.message && error.message.includes('API limit reached')) {
        toast({
          title: "API Limit Reached",
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: "Error",
          description: "Could not suggest a mood at this time.",
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
      // Refresh the API usage display
      const updatedUsage = getApiUsage();
      setApiUsage(updatedUsage);
    }
  };


  return (
    <div className="space-y-4">
      {/* How Are You Feeling Header */}
      <div className="bg-black border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <Drama className="size-6 text-white animate-pulse" />
            <div className="absolute inset-0 bg-white/10 rounded-full blur-sm animate-ping" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-mono">HOW ARE YOU FEELING?</h2>
            <p className="text-xs text-gray-400 font-mono">TRACK YOUR EMOTIONS</p>
          </div>
        </div>
      </div>

      {/* AI Mood Suggestion */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
        <div className="space-y-3">
          <Textarea
            placeholder="Tell me about your day..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="bg-black border-gray-600 text-white placeholder:text-gray-500 font-mono text-sm resize-none focus:border-white focus:ring-white/20 transition-all duration-300"
          />
          
          <Button 
            onClick={handleSuggestMood} 
            disabled={isLoading || (!canSetMood && !notes)} 
            className="w-full bg-white hover:bg-gray-200 text-black font-mono text-sm h-10 transition-all duration-300 disabled:bg-gray-600 disabled:text-gray-400"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ANALYZING YOUR DAY...
              </>
            ) : (
              <>
                <WandSparkles className="mr-2 h-4 w-4" />
                GET MOOD SUGGESTION
              </>
            )}
          </Button>
          
          {/* API Usage Display */}
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3" />
              <span>API REQUESTS: {apiUsage.count}/60</span>
            </div>
            <div className="text-right">
              <span>{getRemainingRequests()} REMAINING</span>
            </div>
          </div>
          
          {!canSetMood && (
            <div className="text-center">
              <p className="text-xs text-yellow-400 font-mono">⚠️ MOOD SET FOR TODAY</p>
              <p className="text-xs text-gray-400 font-mono">Change requires confirmation</p>
            </div>
          )}
        </div>
      </div>

      {/* Choose Your Mood */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 backdrop-blur-sm card-hover card-black-hover fade-in-up">
        <h3 className="text-sm font-semibold text-white font-mono mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          CHOOSE YOUR MOOD
        </h3>
        
        <div className="grid grid-cols-3 gap-2">
          {moodOptions.map(option => (
            <button
              key={option.value}
              className={cn(
                "relative h-20 flex flex-col items-center justify-center gap-2 rounded-lg border transition-all duration-300 font-mono card-hover",
                mood === option.value 
                  ? "bg-gray-800 border-white text-white shadow-lg" 
                  : (!canSetMood 
                      ? "bg-black border-gray-800 text-gray-600 cursor-not-allowed"
                      : "bg-black border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300 hover:bg-black")
              )}
              onClick={() => setMood(option.value, false)} // Mark as user selected
              disabled={!canSetMood && mood !== option.value} // Disable if can't set mood today (except current mood)
            >
              {mood === option.value && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-transparent via-transparent to-white/5 animate-pulse" />
              )}
              <option.icon className="size-6" />
              <span className="text-xs uppercase tracking-wide">{option.label}</span>
              {mood === option.value && (
                <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white to-transparent rounded-lg opacity-20 blur-sm" />
              )}
            </button>
          ))}
        </div>
        
        {mood && (
          <div className="mt-4 p-3 bg-black border border-gray-600 rounded-lg card-hover transition-all duration-300 hover:bg-black">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-xs text-white font-mono">CURRENT MOOD</span>
            </div>
            <p className="text-sm text-gray-300 font-mono">
              STATUS: <span className="text-white uppercase">{mood}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodLogger;
