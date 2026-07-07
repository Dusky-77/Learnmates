import React from 'react';

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

const selectClasses =
  'mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 px-3 py-2 h-9';

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
    <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4">
      <div className="flex-1">
        <label className="block text-sm font-medium">Level</label>
        <select className={selectClasses} value={selectedLevel} onChange={e => onLevelChange(e.target.value)}>
          <option value="" disabled hidden>-- Select Level --</option>
          {levels.map(l => (
            <option key={l} value={l}>{l.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {selectedLevel && (
        <div className="flex-1 mt-4 sm:mt-0">
          <label className="block text-sm font-medium">Board</label>
          <select className={selectClasses} value={selectedBoard} onChange={e => onBoardChange(e.target.value)}>
            <option value="" disabled hidden>-- Select Board --</option>
            {boardsForLevel(selectedLevel).map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      )}

      {selectedLevel && selectedBoard && (
        <div className="flex-1 mt-4 sm:mt-0">
          <label className="block text-sm font-medium">Subject</label>
          <select className={selectClasses} value={selectedSubject} onChange={e => onSubjectChange(e.target.value)}>
            <option value="" disabled hidden>-- Select Subject --</option>
            {subjectsForLevelBoard(selectedLevel, selectedBoard).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default LevelBoardSubjectPicker;
