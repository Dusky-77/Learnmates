import React, { useRef, useState, useEffect } from 'react';
import { btnPrimary, btnToggleBase, btnToggleActive, btnToggleInactive, dropdownPanel } from './ui';

interface FilterBarProps {
  onLoad: () => void;
  isPaperMode: boolean;

  // MCQ / Theory mode
  showMcqTheoryFilter: boolean;
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
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`${btnToggleBase} rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 gap-2`}
        title="Filter matches by paper"
      >
        <span>{selectedPaperSummary}</span>
        <span className="text-xs">▾</span>
      </button>

      {open && (
        <div className={`${dropdownPanel} w-48 max-h-60 overflow-y-auto`}>
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">
            <input
              type="checkbox"
              checked={isAllPapersSelected}
              onChange={() => onToggle('all')}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span>All</span>
          </label>
          {availablePaperNumbers.map(paperNum => (
            <label key={paperNum} className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">
              <input
                type="checkbox"
                checked={paperFilter.has(paperNum)}
                onChange={() => onToggle(paperNum)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span>P{paperNum}</span>
            </label>
          ))}
        </div>
      )}
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
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        disabled={availableYears.length === 0}
        className={`${btnToggleBase} rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 gap-2 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap max-w-[220px] overflow-hidden text-ellipsis text-left`}
        title="Filter matches by year"
      >
        <span className="truncate">{selectedYearSummary}</span>
        <span className="shrink-0 text-xs">▾</span>
      </button>

      {open && (
        <div className={`${dropdownPanel} w-40`}>
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">
            <input
              type="checkbox"
              checked={isAllYearsSelected}
              onChange={() => onToggle('all')}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span>All</span>
          </label>
          {availableYears.map(year => (
            <label key={year} className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">
              <input
                type="checkbox"
                checked={yearFilter.has(year)}
                onChange={() => onToggle(year)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span>{year}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const FilterBar: React.FC<FilterBarProps> = ({
  onLoad,
  isPaperMode,
  showMcqTheoryFilter,
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
    </div>
  );
};

export default FilterBar;
