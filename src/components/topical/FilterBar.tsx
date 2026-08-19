import React from 'react';
import { btnPrimary, btnToggleBase, btnToggleActive, btnToggleInactive, checkboxWithLabel } from './ui';
import TopicalCheckbox from './Checkbox';
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
    <label className={checkboxWithLabel} title="Strict mode: only show questions that cover exclusively the selected topics">
      <TopicalCheckbox
        checked={strict}
        onChange={() => onChange(!strict)}
        aria-label="Strict mode"
      />
      <span className="text-sm font-medium">Strict</span>
    </label>
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

      {onStrictChange && (
        <StrictToggle
          strict={strict || false}
          onChange={onStrictChange}
        />
      )}
    </div>
  );
};

export default FilterBar;
