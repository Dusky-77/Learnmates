import React from 'react';
import { motion } from 'framer-motion';
import { Unlock, BookOpen, XCircle, Coffee } from 'lucide-react';
import { Button } from '../ui';
import { Link } from 'react-router-dom';

interface OpenScreenProps {
  onEndSession: () => void;
  onTakeBreak: () => void;
  breaksAllowed: number;
  breaksTaken: number;
  isBreak: boolean;
}

export const OpenScreen: React.FC<OpenScreenProps> = ({ onEndSession, onTakeBreak, breaksAllowed, breaksTaken, isBreak }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-6 rounded-full bg-green-500/20 p-6">
        <Unlock className="h-16 w-16 text-green-500" />
      </div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
        Device Open
      </h1>
      <p className="mb-8 max-w-lg text-lg text-gray-600 dark:text-gray-400">
        You have designated this device as open for your study session. You can now freely navigate the platform to access resources.
      </p>
      
      <div className="flex gap-4">
        <Button asChild variant="primary" size="lg">
          <Link to="/curriculum" className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Go to Curriculum
          </Link>
        </Button>
        <Button 
          onClick={onTakeBreak} 
          disabled={breaksTaken >= breaksAllowed || isBreak}
          variant="outline" 
          size="lg"
        >
          <Coffee className="h-5 w-5 mr-2" />
          Take a Break ({breaksAllowed - breaksTaken} left)
        </Button>
        <Button onClick={onEndSession} variant="outline" size="lg" className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/30">
          <XCircle className="h-5 w-5 mr-2" />
          End Session
        </Button>
      </div>
    </motion.div>
  );
};
