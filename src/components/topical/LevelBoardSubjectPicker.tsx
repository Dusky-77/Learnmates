import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface LevelBoardSubjectPickerProps {
  levels: string[];
  selectedLevel: string;
  onLevelChange: (level: string) => void;

  boardsForLevel: (level: string) => string[];
  selectedBoard: string;
  onBoardChange: (board: string) => void;

  subjectsForLevelBoard: (level: string, board: string) => string[];
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
}

interface AnimatedSelectProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  placeholder: string;
}

const AnimatedSelect: React.FC<AnimatedSelectProps> = ({ label, value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative w-full" ref={ref}>
      <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">{label}</label>
      <motion.div 
        whileTap={{ scale: 0.98 }}
        className={`relative w-full cursor-pointer rounded-xl border ${isOpen ? 'border-blue-500 ring-4 ring-blue-500/10 dark:ring-blue-500/20' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 flex items-center justify-between group`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`block truncate transition-colors duration-200 ${!selectedOption ? 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300' : 'font-medium'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div 
          animate={{ rotate: isOpen ? 180 : 0 }} 
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <ChevronDown className={`w-5 h-5 transition-colors duration-300 ${isOpen ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 24, mass: 0.8 }}
            className="absolute z-[100] w-full mt-3 origin-top rounded-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-xl shadow-blue-500/10 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto py-1.5 custom-scrollbar">
              {options.map((option) => (
                <div
                  key={option.value}
                  className={`relative cursor-pointer select-none px-4 py-3 text-sm transition-all duration-200 ${
                    option.value === value
                      ? 'bg-blue-50/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:pl-5'
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.value === value && (
                    <motion.div
                      layoutId={`activeIndicator-${label}`}
                      className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                  {option.label}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LevelBoardSubjectPicker: React.FC<LevelBoardSubjectPickerProps> = ({
  levels,
  selectedLevel,
  onLevelChange,
  boardsForLevel,
  selectedBoard,
  onBoardChange,
  subjectsForLevelBoard,
  selectedSubject,
  onSubjectChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="flex-1">
        <AnimatedSelect 
          label="Level"
          value={selectedLevel}
          onChange={onLevelChange}
          placeholder="-- Select Level --"
          options={levels.map(l => ({ label: l.toUpperCase(), value: l }))}
        />
      </div>

      {selectedLevel && (
        <div className="flex-1">
          <AnimatedSelect 
            label="Board"
            value={selectedBoard}
            onChange={onBoardChange}
            placeholder="-- Select Board --"
            options={boardsForLevel(selectedLevel).map(b => ({ label: b, value: b }))}
          />
        </div>
      )}

      {selectedLevel && selectedBoard && (
        <div className="flex-1">
          <AnimatedSelect 
            label="Subject"
            value={selectedSubject}
            onChange={onSubjectChange}
            placeholder="-- Select Subject --"
            options={subjectsForLevelBoard(selectedLevel, selectedBoard).map(s => ({ label: s, value: s }))}
          />
        </div>
      )}
    </div>
  );
};

export default LevelBoardSubjectPicker;
