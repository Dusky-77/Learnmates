import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { btnSelect, dropdownPanel, dropdownItem } from './ui';

type DropdownValue = string | number;

interface DropdownOption {
  value: DropdownValue;
  label: string;
}

interface DropdownProps {
  buttonLabel: string;
  options: DropdownOption[];

  // Single-select
  selectedValue?: DropdownValue;
  onSelect?: (value: DropdownValue) => void;

  // Multi-select
  multi?: boolean;
  selected?: Set<DropdownValue>;
  onToggle?: (value: DropdownValue) => void;
  showAllOption?: boolean;
  allSelected?: boolean;
  onToggleAll?: () => void;

  // Presentation
  label?: string;
  fullWidth?: boolean;
  align?: 'left' | 'right';
  className?: string;
  disabled?: boolean;
  title?: string;
}

// One lightweight dropdown used by the level/board/subject picker and every
// filter control (paper, year, order). No spring animations or heavy shadows —
// just a bordered button that matches the other controls (h-9, rounded-lg) and
// a simple panel built from the shared dropdownPanel / dropdownItem tokens.
const Dropdown: React.FC<DropdownProps> = ({
  buttonLabel,
  options,
  selectedValue,
  onSelect,
  multi = false,
  selected,
  onToggle,
  showAllOption = false,
  allSelected = false,
  onToggleAll,
  label,
  fullWidth = false,
  align = 'left',
  className = '',
  disabled = false,
  title,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  const hasValue = multi ? (selected?.size ?? 0) > 0 : selectedValue !== undefined && selectedValue !== '';

  const pick = (value: DropdownValue) => {
    if (multi) {
      onToggle?.(value);
      return;
    }
    onSelect?.(value);
    setOpen(false);
  };

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''} ${className}`} ref={ref}>
      {label && (
        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">{label}</label>
      )}
      <button
        type="button"
        disabled={disabled}
        title={title}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen(prev => !prev)}
        className={`${btnSelect} justify-between gap-2 ${fullWidth ? 'w-full' : ''} ${
          open ? 'border-blue-500' : 'border-gray-300 dark:border-gray-700'
        } ${!hasValue ? 'text-gray-500 dark:text-gray-400' : ''}`}
      >
        <span className="truncate">{buttonLabel}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={`${dropdownPanel} max-h-72 overflow-y-auto ${align === 'right' ? 'right-0' : 'left-0'} min-w-full`}
        >
          {showAllOption && (
            <label className="flex cursor-pointer items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => onToggleAll?.()}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>All</span>
            </label>
          )}

          {options.map(option => {
            const isSelected = multi
              ? selected?.has(option.value) ?? false
              : selectedValue === option.value;
            if (multi) {
              return (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => pick(option.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{option.label}</span>
                </label>
              );
            }
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => pick(option.value)}
                className={`${dropdownItem} justify-between ${
                  isSelected ? 'font-medium text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
