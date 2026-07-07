import React from 'react';
import { theme } from '../theme';

const selectStyle: React.CSSProperties = {
  marginTop: 4,
  display: 'block',
  width: '100%',
  height: 36,
  borderRadius: 8,
  border: `1px solid ${theme.inputBorder}`,
  backgroundColor: theme.surface,
  color: theme.text,
  padding: '0 12px',
  fontSize: 14,
  fontFamily: theme.fontFamily,
  fontWeight: 500,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 500,
  color: theme.text,
  fontFamily: theme.fontFamily,
};

type SubjectDropdownsProps = {
  level: string;
  board: string;
  subject: string;
  showBoard?: boolean;
  showSubject?: boolean;
  highlightField?: 'level' | 'board' | 'subject' | null;
};

export const SubjectDropdowns: React.FC<SubjectDropdownsProps> = ({
  level,
  board,
  subject,
  showBoard = true,
  showSubject = true,
  highlightField = null,
}) => {
  const highlightRing = (field: 'level' | 'board' | 'subject'): React.CSSProperties =>
    highlightField === field
      ? { boxShadow: `0 0 0 2px ${theme.primary}`, borderColor: theme.primary }
      : {};

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 16,
        padding: 24,
        borderRadius: 16,
        backgroundColor: theme.surface,
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        minWidth: 860,
      }}
    >
      <div style={{ flex: 1 }}>
        <label style={labelStyle}>Level</label>
        <div style={{ ...selectStyle, ...highlightRing('level'), display: 'flex', alignItems: 'center' }}>
          {level ? level.toUpperCase() : '-- Select Level --'}
        </div>
      </div>

      {showBoard && (
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Board</label>
          <div
            style={{
              ...selectStyle,
              ...highlightRing('board'),
              display: 'flex',
              alignItems: 'center',
              textTransform: 'capitalize',
            }}
          >
            {board || '-- Select Board --'}
          </div>
        </div>
      )}

      {showSubject && (
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Subject</label>
          <div style={{ ...selectStyle, ...highlightRing('subject'), display: 'flex', alignItems: 'center' }}>
            {subject || '-- Select Subject --'}
          </div>
        </div>
      )}
    </div>
  );
};
