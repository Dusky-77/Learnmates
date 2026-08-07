import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Coffee, Maximize2, Minimize2 } from 'lucide-react';
import { Button, Badge } from '../ui';
import { useNavigate } from 'react-router-dom';

interface OpenDeviceWidgetProps {
  lockUntil: string | null;
  pausedDurationMs: number;
  isBreak: boolean;
  onEndSession: () => void;
  onTakeBreak: () => void;
  breaksAllowed: number;
  breaksTaken: number;
}

export const OpenDeviceWidget: React.FC<OpenDeviceWidgetProps> = ({
  lockUntil,
  pausedDurationMs,
  isBreak,
  onEndSession,
  onTakeBreak,
  breaksAllowed,
  breaksTaken
}) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!lockUntil) return;

    const interval = setInterval(() => {
      if (isBreak) return;
      const target = new Date(lockUntil).getTime();
      const now = new Date().getTime();
      const remaining = target + pausedDurationMs - now;
      setTimeLeft(Math.max(0, remaining));
      
      if (remaining <= 0) {
        onEndSession();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockUntil, pausedDurationMs, isBreak, onEndSession]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const breaksRemaining = breaksAllowed - breaksTaken;
  const canTakeBreak = breaksRemaining > 0 && !isBreak;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 w-64 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-xl font-bold">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <Badge variant={canTakeBreak ? "success" : "secondary"}>
                {breaksRemaining} Break{breaksRemaining !== 1 && 's'}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => navigate('/lock_in')}
              >
                Lobby
              </Button>
              <Button 
                variant={canTakeBreak ? "primary" : "secondary"} 
                size="sm" 
                className="flex-1"
                disabled={!canTakeBreak}
                onClick={onTakeBreak}
              >
                <Coffee className="w-4 h-4 mr-1" />
                Break
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMinimized(!isMinimized)}
        className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
      >
        {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
      </motion.button>
    </div>
  );
};
