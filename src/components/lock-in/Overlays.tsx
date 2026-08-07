import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Coffee, Play } from 'lucide-react';
import { Button } from '../ui';

interface TabLeaveOverlayProps {
  tabLeftAt: string;
}

export const TabLeaveOverlay: React.FC<TabLeaveOverlayProps> = ({ tabLeftAt }) => {
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    const interval = setInterval(() => {
      const leftAt = new Date(tabLeftAt).getTime();
      const now = new Date().getTime();
      const elapsed = Math.floor((now - leftAt) / 1000);
      const remaining = 120 - elapsed;
      if (remaining >= 0) {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [tabLeftAt]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-red-950/90 text-white backdrop-blur-md">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center max-w-md text-center p-8">
        <div className="mb-6 rounded-full bg-red-500/20 p-6 animate-pulse">
          <AlertTriangle className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Focus Lost!</h1>
        <p className="mb-8 text-lg text-red-200">
          A device left the study tab. Please return immediately to prevent the session from being cancelled.
        </p>
        <div className="text-6xl font-mono font-bold text-red-400">
          {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
        </div>
      </motion.div>
    </div>
  );
};

interface BreakOverlayProps {
  startedAt: string;
  onEndBreak: () => void;
}

export const BreakOverlay: React.FC<BreakOverlayProps> = ({ startedAt, onEndBreak }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const start = new Date(startedAt).getTime();
      const now = new Date().getTime();
      setElapsed(Math.floor((now - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const maxBreakSecs = 10 * 60;
  const remaining = Math.max(0, maxBreakSecs - elapsed);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const isShort = elapsed < 120;

  return (
    <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-gray-900/95 text-white backdrop-blur-md">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center max-w-md text-center p-8">
        <div className="mb-6 rounded-full bg-blue-500/20 p-6">
          <Coffee className="h-16 w-16 text-blue-500" />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">On Break</h1>
        <p className="mb-8 text-lg text-gray-400">
          Relax and recharge. Sessions over 10 minutes will automatically cancel your lock-in.
        </p>
        <div className="text-6xl font-mono font-bold text-blue-400 mb-2">
          {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
        </div>
        <div className="text-sm text-gray-500 mb-8 uppercase tracking-widest">
          Time Remaining
        </div>
        
        <Button onClick={onEndBreak} variant="primary" size="lg" className="w-full text-lg h-14">
          <Play className="h-5 w-5 mr-2" />
          Resume Session
        </Button>
        {isShort && (
          <p className="mt-4 text-sm text-gray-400">
            Resuming now won't consume a break quota (must be &gt; 2 mins).
          </p>
        )}
      </motion.div>
    </div>
  );
};
