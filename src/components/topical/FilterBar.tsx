import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { btnPrimary, btnToggleBase, btnToggleActive, btnToggleInactive, dropdownPanel } from './ui';

interface FilterBarProps {
  onLoad: () => void;
  isPaperMode: boolean;
  showMcqTheoryFilter?: boolean;

  // MCQ / Theory mode
  mcqFilter: 'all' | 'mcq' | 'theory';
  onMcqFilterChange: (filter: 'all' | 'mcq' | 'theory') => void;
  availableFilters: { hasMCQ: boolean; hasTheory: boolean };

  // Paper mode
  availablePaperNumbers: number[];
  paperFilter: Set<number>;
  isAllPapersSelected: boolean;
  selectedPaperSummary: string;
  onTogglePaper: (paperNum: number | 'all') => void;

  // Year mode
  availableYears: number[];
  yearFilter: Set<number>;
  isAllYearsSelected: boolean;
  selectedYearSummary: string;
  onToggleYear: (year: number | 'all') => void;

  // Order & Limit
  orderFilter?: 'newest' | 'oldest' | 'random';
  onOrderFilterChange?: (order: 'newest' | 'oldest' | 'random') => void;
  limitFilter?: string;
  onLimitFilterChange?: (limit: string) => void;
}

// Previously the MCQ/Theory control was a bare native <select> sitting next
// to a plain button — visually disconnected from everything else. It's now a
// segmented toggle group that matches the same height/radius language as the
// paper filter and the Load button, so it "blends in" instead of standing out.
const McqTheoryToggle: React.FC<{
  mcqFilter: 'all' | 'mcq' | 'theory';
  onChange: (f: 'all' | 'mcq' | 'theory') => void;
  availableFilters: { hasMCQ: boolean; hasTheory: boolean };
}> = ({ mcqFilter, onChange, availableFilters }) => {
  const options: { key: 'all' | 'mcq' | 'theory'; label: string; disabled?: boolean }[] = [
    { key: 'all', label: 'All' },
    { key: 'mcq', label: 'MCQ', disabled: !availableFilters.hasMCQ },
    { key: 'theory', label: 'Theory', disabled: !availableFilters.hasTheory },
  ];

  return (
    <div className="inline-flex" role="group" aria-label="Filter by MCQ or theory">
      {options.map(opt => (
        <button
          key={opt.key}
          type="button"
          disabled={opt.disabled}
          onClick={() => onChange(opt.key)}
          className={`${btnToggleBase} ${mcqFilter === opt.key ? btnToggleActive : btnToggleInactive}`}
          title={opt.disabled ? `No ${opt.label.toLowerCase()} questions in current selection` : undefined}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

const PaperFilterDropdown: React.FC<{
  availablePaperNumbers: number[];
  paperFilter: Set<number>;
  isAllPapersSelected: boolean;
  selectedPaperSummary: string;
  onToggle: (paperNum: number | 'all') => void;
}> = ({ availablePaperNumbers, paperFilter, isAllPapersSelected, selectedPaperSummary, onToggle }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`${btnToggleBase} relative rounded-lg border ${open ? 'border-blue-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 gap-2 flex items-center justify-between group`}
        title="Filter matches by paper"
      >
        <span>{selectedPaperSummary}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
          <ChevronDown className={`w-4 h-4 transition-colors duration-300 ${open ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
        </motion.div>
      </motion.button>

<AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 24, mass: 0.8 }}
            className={`absolute z-20 w-48 mt-2 origin-top rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200/50 dark:border-gray-700/50 focus:outline-none overflow-hidden`}
          >
            <div className="max-h-72 overflow-y-auto py-2 custom-scrollbar">
              <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-all duration-200 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50">
                <input
                  type="checkbox"
                  checked={isAllPapersSelected}
                  onChange={() => onToggle('all')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>All</span>
              </label>
              {availablePaperNumbers.map(paperNum => (
                <label key={paperNum} className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-all duration-200 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50">
                  <input
                    type="checkbox"
                    checked={paperFilter.has(paperNum)}
                    onChange={() => onToggle(paperNum)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>P{paperNum}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const YearFilterDropdown: React.FC<{
  availableYears: number[];
  yearFilter: Set<number>;
  isAllYearsSelected: boolean;
  selectedYearSummary: string;
  onToggle: (yearNum: number | 'all') => void;
}> = ({ availableYears, yearFilter, isAllYearsSelected, selectedYearSummary, onToggle }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={() => setOpen(prev => !prev)}
        disabled={availableYears.length === 0}
        className={`${btnToggleBase} relative rounded-lg border ${open ? 'border-blue-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 gap-2 disabled:cursor-not-allowed disabled:opacity-60 max-w-[220px] flex items-center justify-between group`}
        title="Filter matches by year"
      >
        <span className="truncate">{selectedYearSummary}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
          <ChevronDown className={`w-4 h-4 shrink-0 transition-colors duration-300 ${open ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
        </motion.div>
      </motion.button>

<AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 24, mass: 0.8 }}
            className={`absolute z-20 w-48 mt-2 origin-top rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200/50 dark:border-gray-700/50 focus:outline-none overflow-hidden`}
          >
            <div className="max-h-72 overflow-y-auto py-2 custom-scrollbar">
              <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-all duration-200 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50">
                <input
                  type="checkbox"
                  checked={isAllYearsSelected}
                  onChange={() => onToggle('all')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>All</span>
              </label>
              {availableYears.map(year => (
                <label key={year} className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-all duration-200 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50">
                  <input
                    type="checkbox"
                    checked={yearFilter.has(year)}
                    onChange={() => onToggle(year)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{year}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AnimatedOrderFilter: React.FC<{
  value: string;
  onChange: (val: any) => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { value: 'newest', label: 'New → old' },
    { value: 'oldest', label: 'Old → new' },
    { value: 'random', label: 'Random / shuffle' }
  ];

  const selectedLabel = options.find(o => o.value === value)?.label || 'Order';

  const toggleOrder = (orderValue: string) => {
    onChange(orderValue);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(prev => !prev)}
        className={`${btnToggleBase} relative cursor-pointer rounded-lg border ${open ? 'border-blue-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 gap-2 flex items-center justify-between group min-w-[140px]`}
        title="Order of matching questions"
      >
        <span>{selectedLabel}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
          <ChevronDown className={`w-4 h-4 transition-colors duration-300 ${open ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 24, mass: 0.8 }}
            className={`absolute z-20 w-48 mt-2 origin-top rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200/50 dark:border-gray-700/50 focus:outline-none overflow-hidden`}
          >
            <div className="max-h-72 overflow-y-auto py-2 custom-scrollbar">
              <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-all duration-200 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50">
                <input
                  type="radio"
                  name="order-filter"
                  checked={value === 'newest'}
                  onChange={() => toggleOrder('newest')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>New → old</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-all duration-200 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50">
                <input
                  type="radio"
                  name="order-filter"
                  checked={value === 'oldest'}
                  onChange={() => toggleOrder('oldest')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Old → new</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-all duration-200 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50">
                <input
                  type="radio"
                  name="order-filter"
                  checked={value === 'random'}
                  onChange={() => toggleOrder('random')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Random / shuffle</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FilterBar: React.FC<FilterBarProps> = ({
  onLoad,
  isPaperMode,
  showMcqTheoryFilter = true,
  mcqFilter,
  onMcqFilterChange,
  availableFilters,
  availablePaperNumbers,
  paperFilter,
  isAllPapersSelected,
  selectedPaperSummary,
  onTogglePaper,
  availableYears,
  yearFilter,
  isAllYearsSelected,
  selectedYearSummary,
  onToggleYear,
  orderFilter,
  onOrderFilterChange,
  limitFilter,
  onLimitFilterChange,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button className={btnPrimary} onClick={onLoad}>
        Load matching questions
      </button>

      {isPaperMode ? (
        <PaperFilterDropdown
          availablePaperNumbers={availablePaperNumbers}
          paperFilter={paperFilter}
          isAllPapersSelected={isAllPapersSelected}
          selectedPaperSummary={selectedPaperSummary}
          onToggle={onTogglePaper}
        />
      ) : showMcqTheoryFilter ? (
        <McqTheoryToggle mcqFilter={mcqFilter} onChange={onMcqFilterChange} availableFilters={availableFilters} />
      ) : null}

      <YearFilterDropdown
        availableYears={availableYears}
        yearFilter={yearFilter}
        isAllYearsSelected={isAllYearsSelected}
        selectedYearSummary={selectedYearSummary}
        onToggle={onToggleYear}
      />

      {onOrderFilterChange && (
        <AnimatedOrderFilter
          value={orderFilter || 'newest'}
          onChange={onOrderFilterChange}
        />
      )}

      {onLimitFilterChange && (
        <input
          type="number"
          min="1"
          placeholder="Max questions"
          className={`${btnToggleBase} bg-white dark:bg-gray-800 text-lg border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 w-32 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none placeholder:text-xs`}
          value={limitFilter}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '' || (Number(val) >= 1 && !val.includes('-'))) {
              onLimitFilterChange(val);
            }
          }}
          title="Leave empty to show all matches"
        />
      )}
    </div>
  );
};

export default FilterBar;
