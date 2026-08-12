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
<button
          whileTap={{ scale: 0.98 }}
          className={`relative w-full cursor-pointer rounded-lg border ${isOpen ? 'border-blue-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 flex items-center justify-between group py-2 text-base px-4`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={`block truncate transition-colors duration-200 ${!selectedOption ? 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300' : 'font-medium'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className={`w-5 h-5 transition-colors duration-300 ${isOpen ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
        </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 24, mass: 0.8 }}
            className="absolute z-20 w-full mt-2 origin-top rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200/50 dark:border-gray-700/50 focus:outline-none overflow-hidden"
          >
            <div className="max-h-72 overflow-y-auto py-2 custom-scrollbar">
              {options.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-all duration-200 ${
                    option.value === value
                      ? 'bg-blue-50/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
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
                </label>
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
