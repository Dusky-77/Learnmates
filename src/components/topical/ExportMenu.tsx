import React, { useRef, useState, useEffect } from 'react';
import { btnSecondary, dropdownPanel, dropdownItem } from './ui';

interface ExportMenuProps {
  onExport: (type: 'questions' | 'markschemes', options?: { extraPage?: boolean }) => void;
  showExtraPageOption?: boolean;
  extraPageEnabled?: boolean;
  onExtraPageToggle?: (enabled: boolean) => void;
}

// Same height/padding/font as every other control now (btnSecondary),
// instead of the old oversized purple button.
const ExportMenu: React.FC<ExportMenuProps> = ({ onExport, showExtraPageOption = false, extraPageEnabled = false, onExtraPageToggle }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(prev => !prev)} className={btnSecondary}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className={`${dropdownPanel} right-0 w-64`}>
          {showExtraPageOption && (
            <div className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={extraPageEnabled}
                  onChange={event => onExtraPageToggle?.(event.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span>Extra page</span>
              </label>
              <button
                type="button"
                className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-[11px] text-gray-500 hover:bg-gray-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                title="Adds an extra blank page after each question so you can write extra working space."
                aria-label="Extra page info"
              >
                i
              </button>
            </div>
          )}
          <button
            onClick={() => {
              onExport('questions', { extraPage: extraPageEnabled });
              setOpen(false);
            }}
            className={dropdownItem}
          >
            <span className="text-blue-500">📄</span>
            Questions PDF
          </button>
          <button
            onClick={() => {
              onExport('markschemes', { extraPage: false });
              setOpen(false);
            }}
            className={dropdownItem}
          >
            <span className="text-green-500">📝</span>
            Mark Schemes PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
