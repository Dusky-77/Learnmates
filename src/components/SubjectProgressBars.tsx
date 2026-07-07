import React from 'react';
import type { GroupProgress } from '../utils/subjectProgressGroups';

type SubjectProgressBarsProps = {
  groups: GroupProgress[];
  compact?: boolean;
};

const SubjectProgressBars: React.FC<SubjectProgressBarsProps> = ({ groups, compact = false }) => {
  if (groups.length === 0) return null;

  return (
    <div className={`mt-4 ${compact ? 'space-y-2' : 'space-y-3'}`}>
      {groups.map(({ label, progress }) => (
        <div key={label}>
          <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-[2.5rem]">{label}</span>
            <span>
              {progress.completed}/{progress.total} topics ({progress.percent}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubjectProgressBars;
