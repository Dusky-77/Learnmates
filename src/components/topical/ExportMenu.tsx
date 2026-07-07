import React, { useRef, useState, useEffect } from 'react';
import { btnSecondary, dropdownPanel, dropdownItem } from './ui';

interface ExportMenuProps {
  onExport: (type: 'questions' | 'markschemes') => void;
}

// Same height/padding/font as every other control now (btnSecondary),
// instead of the old oversized purple button.
const ExportMenu: React.FC<ExportMenuProps> = ({ onExport }) => {
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
        <div className={`${dropdownPanel} right-0 w-56`}>
          <button
            onClick={() => {
              onExport('questions');
              setOpen(false);
            }}
            className={dropdownItem}
          >
            <span className="text-blue-500">📄</span>
            Questions PDF
          </button>
          <button
            onClick={() => {
              onExport('markschemes');
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
