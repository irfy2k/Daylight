"use client";

import { AlertTriangle, Brain, User } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Mood } from '@/lib/types';

interface MoodConfirmationDialogProps {
  isOpen: boolean;
  currentMood: Mood | null;
  newMood: Mood;
  isAiSuggested: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const moodEmojis: Record<Mood, string> = {
  happy: '😊',
  sad: '😢',
  neutral: '�',
  excited: '🤩',
  anxious: '�',
  frustrated: '😤'
};

const moodLabels: Record<Mood, string> = {
  happy: 'Happy',
  sad: 'Sad',
  neutral: 'Neutral',
  excited: 'Excited',
  anxious: 'Anxious',
  frustrated: 'Frustrated'
};

export default function MoodConfirmationDialog({
  isOpen,
  currentMood,
  newMood,
  isAiSuggested,
  onConfirm,
  onCancel
}: MoodConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="max-w-md bg-black border border-gray-700 text-white">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {isAiSuggested ? (
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600">
                <Brain className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <AlertDialogTitle className="text-white font-mono text-lg">
                {isAiSuggested ? 'AI MOOD SUGGESTION' : 'MOOD UPDATE'}
              </AlertDialogTitle>
              <p className="text-xs text-gray-400 font-mono">
                {isAiSuggested ? 'Based on your day' : 'Manual change requested'}
              </p>
            </div>
          </div>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-mono text-sm">You've already set your mood today</span>
          </div>
          
          <div className="bg-black border border-gray-600 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-mono text-sm">CURRENT:</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentMood ? moodEmojis[currentMood] : '❓'}</span>
                <span className="text-white font-mono">
                  {currentMood ? moodLabels[currentMood].toUpperCase() : 'NONE'}
                </span>
              </div>
            </div>
            
            <div className="w-full h-px bg-gray-700" />
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-mono text-sm">PROPOSED:</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{moodEmojis[newMood]}</span>
                <span className="text-white font-mono">{moodLabels[newMood].toUpperCase()}</span>
              </div>
            </div>
          </div>
          
          <AlertDialogDescription className="text-gray-300 font-mono text-sm">
            {isAiSuggested 
              ? 'AI has analyzed your activity and suggests updating your mood. Continue with this change?'
              : 'Confirm mood override? This will replace your daily mood entry.'
            }
          </AlertDialogDescription>
        </div>
        
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 font-mono">
            CANCEL
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-white text-black hover:bg-gray-200 font-mono"
          >
            {isAiSuggested ? 'ACCEPT SUGGESTION' : 'CONFIRM UPDATE'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
