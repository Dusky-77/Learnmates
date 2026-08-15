import React from 'react';
import Dropdown from './Dropdown';

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
        <Dropdown
          label="Level"
          fullWidth
          buttonLabel={selectedLevel ? selectedLevel.toUpperCase() : 'Select Level'}
          options={levels.map(l => ({ value: l, label: l.toUpperCase() }))}
          selectedValue={selectedLevel}
          onSelect={onLevelChange}
        />
      </div>

      {selectedLevel && (
        <div className="flex-1">
          <Dropdown
            label="Board"
            fullWidth
            buttonLabel={selectedBoard || 'Select Board'}
            options={boardsForLevel(selectedLevel).map(b => ({ value: b, label: b }))}
            selectedValue={selectedBoard}
            onSelect={onBoardChange}
          />
        </div>
      )}

      {selectedLevel && selectedBoard && (
        <div className="flex-1">
          <Dropdown
            label="Subject"
            fullWidth
            buttonLabel={selectedSubject || 'Select Subject'}
            options={subjectsForLevelBoard(selectedLevel, selectedBoard).map(s => ({ value: s, label: s }))}
            selectedValue={selectedSubject}
            onSelect={onSubjectChange}
          />
        </div>
      )}
    </div>
  );
};

export default LevelBoardSubjectPicker;
