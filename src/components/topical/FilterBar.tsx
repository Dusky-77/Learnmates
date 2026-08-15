import React from 'react';
import { Check } from 'lucide-react';
import { btnPrimary, btnBase, btnToggleBase, btnToggleActive, btnToggleInactive } from './ui';
import Dropdown from './Dropdown';

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

  // Strict mode: only questions covering exclusively the selected topics
  strict?: boolean;
  onStrictChange?: (strict: boolean) => void;

  // Order & Limit
  orderFilter?: 'newest' | 'oldest' | 'random';
  onOrderFilterChange?: (order: 'newest' | 'oldest' | 'random') => void;
  limitFilter?: string;
  onLimitFilterChange?: (limit: string) => void;
}

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

const StrictToggle: React.FC<{
  strict: boolean;
  onChange: (strict: boolean) => void;
}> = ({ strict, onChange }) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!strict)}
      aria-pressed={strict}
      className={`${btnBase} border ${
        strict
          ? 'bg-blue-500 border-blue-600 text-white shadow-sm hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800'
          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
      title="Strict mode: only show questions that cover exclusively the selected topics"
    >
      {strict && <Check className="w-4 h-4" />}
      Strict
    </button>
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
  strict,
  onStrictChange,
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
        <Dropdown
          multi
          showAllOption
          buttonLabel={selectedPaperSummary}
          allSelected={isAllPapersSelected}
          onToggleAll={() => onTogglePaper('all')}
          options={availablePaperNumbers.map(n => ({ value: n, label: `P${n}` }))}
          selected={paperFilter}
          onToggle={n => onTogglePaper(Number(n))}
          className="max-w-[220px]"
          title="Filter matches by paper"
        />
      ) : showMcqTheoryFilter ? (
        <McqTheoryToggle mcqFilter={mcqFilter} onChange={onMcqFilterChange} availableFilters={availableFilters} />
      ) : null}

      <Dropdown
        multi
        showAllOption
        buttonLabel={selectedYearSummary}
        allSelected={isAllYearsSelected}
        onToggleAll={() => onToggleYear('all')}
        options={availableYears.map(year => ({ value: year, label: String(year) }))}
        selected={yearFilter}
        onToggle={year => onToggleYear(Number(year))}
        className="max-w-[220px]"
        disabled={availableYears.length === 0}
        title={
          yearFilter.size > 0
            ? `Filter matches by year (${availableYears.filter(y => yearFilter.has(y)).sort((a, b) => a - b).join(', ')})`
            : 'Filter matches by year'
        }
      />

      {onStrictChange && (
        <StrictToggle
          strict={strict || false}
          onChange={onStrictChange}
        />
      )}

      {onOrderFilterChange && (
        <Dropdown
          buttonLabel={
            orderFilter === 'oldest'
              ? 'Old → new'
              : orderFilter === 'random'
                ? 'Random / shuffle'
                : 'New → old'
          }
          options={[
            { value: 'newest', label: 'New → old' },
            { value: 'oldest', label: 'Old → new' },
            { value: 'random', label: 'Random / shuffle' },
          ]}
          selectedValue={orderFilter || 'newest'}
          onSelect={value => onOrderFilterChange(value as 'newest' | 'oldest' | 'random')}
          className="min-w-[140px]"
          title="Order of matching questions"
        />
      )}

      {onLimitFilterChange && (
        <input
          type="number"
          min="1"
          placeholder="Max questions"
          className="h-9 w-32 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 placeholder:text-gray-400 transition-colors hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500 dark:hover:border-gray-600"
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
