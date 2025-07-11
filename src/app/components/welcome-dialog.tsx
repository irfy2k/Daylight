"use client";

import { useState } from 'react';
import { User, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WelcomeDialogProps {
  isOpen: boolean;
  onComplete: (name: string) => void;
}

export default function WelcomeDialog({ isOpen, onComplete }: WelcomeDialogProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsLoading(true);
      // Simulate a brief loading for the futuristic feel
      await new Promise(resolve => setTimeout(resolve, 1000));
      onComplete(name.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal={true}>
      <DialogContent className="max-w-md bg-black border border-gray-700 text-white" aria-describedby="welcome-description">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white font-mono text-center">
            WELCOME TO DAYLIGHT
          </DialogTitle>
          <DialogDescription className="text-gray-300 font-mono text-sm text-center" id="welcome-description">
            Your Daily Life Helper
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white font-mono text-sm text-center block">
              What should we call you?
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="pl-10 bg-gray-900 border-gray-600 text-white placeholder-gray-500 focus:border-white focus:ring-white text-center"
                autoFocus
                disabled={isLoading}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300 font-mono"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Setting up...
                </div>
              ) : (
                'Get Started'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
