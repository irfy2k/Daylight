"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Smile, CheckSquare, DollarSign, Shield, BarChart3, LayoutGrid } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AppTutorialProps {
  isOpen: boolean;
  onComplete: () => void;
}

const tutorialSteps = [
  {
    title: "Welcome to Daylight",
    description: "Your personal daily life helper. Let's take a quick tour to show you everything you can do.",
    icon: LayoutGrid,
    content: "Daylight helps you track your mood, manage tasks, monitor finances, and get AI-powered insights - all in one sleek interface."
  },
  {
    title: "Overview Tab",
    description: "Your daily dashboard showing a summary of everything.",
    icon: LayoutGrid,
    content: "See your current mood, task progress, financial summary, and overall daily statistics at a glance. This is your command center."
  },
  {
    title: "Feelings Tab",
    description: "Track and understand your emotions every day.",
    icon: Smile,
    content: "Log your mood once per day by selecting how you feel. Write notes about your day and get AI-powered mood suggestions based on your thoughts. Your emotional journey matters."
  },
  {
    title: "Tasks Tab", 
    description: "Stay organized with your to-do list.",
    icon: CheckSquare,
    content: "Add tasks with optional due dates, check them off when complete, and track your productivity. Simple task management to keep you on track."
  },
  {
    title: "Money Tab",
    description: "Monitor your income and expenses.",
    icon: DollarSign,
    content: "Log income and expenses, categorize transactions, and see your financial overview. Keep track of where your money goes."
  },
  {
    title: "Security Tab",
    description: "Your data protection and app security status.",
    icon: Shield,
    content: "Monitor the security status of your data and see smart insights about app usage. Your privacy and security are our priority."
  },
  {
    title: "Stats Tab",
    description: "Analytics about your productivity and app performance.",
    icon: BarChart3,
    content: "View your productivity metrics, mood scores, and app performance data. Understand your patterns and improve your daily life."
  },
  {
    title: "AI Features",
    description: "Smart assistance powered by AI (60 requests/hour limit).",
    icon: Smile,
    content: "Get mood suggestions based on your daily notes. The AI analyzes your writing to suggest how you might be feeling. Use it wisely - there are 60 AI requests per hour shared across all users globally."
  },
  {
    title: "You're All Set!",
    description: "Start using Daylight to organize and improve your daily life.",
    icon: LayoutGrid,
    content: "Begin by setting your mood for today, adding some tasks, or logging a transaction. Daylight grows with you as you use it more."
  }
];

export default function AppTutorial({ isOpen, onComplete }: AppTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentTutorialStep = tutorialSteps[currentStep];
  const IconComponent = currentTutorialStep.icon;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal={true}>
      <DialogContent className="max-w-lg bg-black border border-gray-700 text-white" aria-describedby="tutorial-description">
        <DialogTitle className="sr-only">
          App Tutorial - Step {currentStep + 1} of {tutorialSteps.length}
        </DialogTitle>
        <div className="relative">
          <div className="pt-4 pb-6">
            {/* Step indicator */}
            <div className="flex justify-center mb-6">
              <div className="flex space-x-2">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? 'bg-white' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600">
                <IconComponent className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold text-white font-mono">
                {currentTutorialStep.title}
              </h3>
              <p className="text-sm text-gray-300 font-mono">
                {currentTutorialStep.description}
              </p>
              <p className="text-sm text-gray-400 leading-relaxed" id="tutorial-description">
                {currentTutorialStep.content}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="text-gray-400 hover:text-white font-mono disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              <span className="text-xs text-gray-500 font-mono">
                {currentStep + 1} of {tutorialSteps.length}
              </span>

              <Button
                onClick={handleNext}
                className="bg-white text-black hover:bg-gray-200 font-mono"
              >
                {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep !== tutorialSteps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
