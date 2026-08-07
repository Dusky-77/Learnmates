import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Coffee } from 'lucide-react';
import { Button } from '../ui';

interface LockedScreenProps {
  lockUntil: string | null;
  onEndSession: () => void;
  pausedDurationMs: number;
  onTakeBreak: () => void;
  breaksAllowed: number;
  breaksTaken: number;
  isBreak: boolean;
}

export const LockedScreen: React.FC<LockedScreenProps> = ({ lockUntil, onEndSession, pausedDurationMs, onTakeBreak, breaksAllowed, breaksTaken, isBreak }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!lockUntil) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(lockUntil).getTime() + pausedDurationMs;
      const distance = end - now;

      if (distance < 0 && !isBreak) {
        clearInterval(interval);
        setTimeLeft('00:00:00');
        onEndSession();
        return;
      } else if (distance < 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    // Run once immediately to avoid 1s delay
    const now = new Date().getTime();
    const end = new Date(lockUntil).getTime() + pausedDurationMs;
    const distance = end - now;
    if (distance > 0) {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
    } else {
        setTimeLeft('00:00:00');
    }

    return () => clearInterval(interval);
  }, [lockUntil, pausedDurationMs, isBreak, onEndSession]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-900 text-white">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center"
      >
        <div className="mb-6 rounded-full bg-red-500/20 p-6">
          <Lock className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">Locked In</h1>
        <p className="mb-8 text-lg text-gray-400">Stay focused. This device is currently locked.</p>
        
        <div className="rounded-2xl bg-gray-800 p-8 shadow-2xl border border-gray-700">
          <div className="text-6xl font-mono font-bold text-red-400 tracking-wider">
            {timeLeft || '00:00:00'}
          </div>
          <div className="mt-2 text-center text-sm font-medium text-gray-500 uppercase tracking-widest">
            Time Remaining
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center gap-4">
          <Button 
            onClick={onTakeBreak} 
            disabled={breaksTaken >= breaksAllowed || isBreak}
            variant="outline" 
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <Coffee className="w-4 h-4 mr-2" />
            Take a Break ({breaksAllowed - breaksTaken} left)
          </Button>
          
          <button 
            onClick={onEndSession}
            className="text-gray-500 hover:text-red-400 transition-colors text-sm underline underline-offset-4"
          >
            End Session Early
          </button>
        </div>
      </motion.div>
    </div>
  );
};
