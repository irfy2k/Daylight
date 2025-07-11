"use client";

import { useEffect, useRef } from 'react';
import { Sun } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const hasCompleted = useRef(false);

  useEffect(() => {
    if (hasCompleted.current) return;
    
    const timer = setTimeout(() => {
      if (!hasCompleted.current) {
        hasCompleted.current = true;
        onComplete();
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-white/3 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/2 rounded-full blur-2xl animate-ping" />
      </div>
      
      <div className="flex flex-col items-center gap-6 relative z-10">
        {/* Animated sun icon */}
        <div className="relative">
          <Sun className="size-20 text-white animate-spin-slow" />
          <div className="absolute inset-0 size-20">
            <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-ping" />
            <div className="absolute inset-2 border border-white/10 rounded-full animate-pulse" />
          </div>
        </div>
        
        {/* Animated text */}
        <div className="text-center">
          <div className="text-2xl font-mono text-white mb-2 animate-fade-in">DAYLIGHT</div>
          <div className="text-sm font-mono text-gray-400 animate-fade-in-delay">Loading your daily dashboard...</div>
        </div>
        
        {/* Loading dots */}
        <div className="flex gap-2 mt-4">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
