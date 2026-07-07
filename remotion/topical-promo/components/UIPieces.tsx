import React from 'react';
import { theme } from '../theme';
import { demoState } from '../data/demoState';

type TopicCheckboxesProps = {
  checkedCount: number;
  expanded?: boolean;
};

export const TopicCheckboxes: React.FC<TopicCheckboxesProps> = ({
  checkedCount,
  expanded = true,
}) => {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 16,
        backgroundColor: theme.card,
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        minWidth: 520,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: theme.textMuted,
            fontFamily: theme.fontFamily,
          }}
        >
          Topics
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            padding: '4px 10px',
            borderRadius: 999,
            backgroundColor: theme.pillBg,
            color: theme.pillText,
            border: `1px solid ${theme.pillBorder}`,
            fontFamily: theme.fontFamily,
          }}
        >
          {checkedCount} topic{checkedCount === 1 ? '' : 's'} selected
        </span>
      </div>

      <div
        style={{
          padding: 16,
          borderRadius: 12,
          backgroundColor: '#0f172a',
          border: `1px solid ${theme.cardBorder}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: theme.unitLabel,
              fontFamily: theme.fontFamily,
              textTransform: 'uppercase',
            }}
          >
            {demoState.unit}
          </h3>
          <span style={{ color: theme.textMuted, fontSize: 14 }}>{expanded ? '▾' : '▸'}</span>
        </div>

        <p style={{ margin: '0 0 12px', fontSize: 14, color: theme.textMuted, fontFamily: theme.fontFamily }}>
          3 Bonding and structure
        </p>

        {expanded &&
          demoState.subtopics.map((sub, i) => {
            const checked = i < checkedCount;
            return (
              <label
                key={sub}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 0',
                  fontSize: 14,
                  color: theme.text,
                  fontFamily: theme.fontFamily,
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    border: `2px solid ${checked ? theme.checkbox : theme.inputBorder}`,
                    backgroundColor: checked ? theme.checkbox : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {checked && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {sub}
              </label>
            );
          })}
      </div>
    </div>
  );
};

type FilterBarMiniProps = {
  mcqFilter: 'all' | 'mcq' | 'theory';
  paperLabel: string;
};

export const FilterBarMini: React.FC<FilterBarMiniProps> = ({ mcqFilter, paperLabel }) => {
  const options: Array<'all' | 'mcq' | 'theory'> = ['all', 'mcq', 'theory'];

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
        padding: 20,
        borderRadius: 16,
        backgroundColor: theme.surface,
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      }}
    >
      <div style={{ display: 'inline-flex' }}>
        {options.map(key => (
          <span
            key={key}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 36,
              padding: '0 14px',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: theme.fontFamily,
              border: `1px solid ${mcqFilter === key ? theme.primary : theme.inputBorder}`,
              backgroundColor: mcqFilter === key ? theme.primary : theme.surface,
              color: mcqFilter === key ? '#fff' : theme.textMuted,
              marginLeft: key === 'all' ? 0 : -1,
              borderRadius:
                key === 'all' ? '8px 0 0 8px' : key === 'theory' ? '0 8px 8px 0' : 0,
            }}
          >
            {key === 'mcq' ? 'MCQ' : key.charAt(0).toUpperCase() + key.slice(1)}
          </span>
        ))}
      </div>

      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          height: 36,
          padding: '0 14px',
          borderRadius: 8,
          border: `1px solid ${theme.inputBorder}`,
          backgroundColor: theme.surface,
          color: theme.text,
          fontSize: 14,
          fontFamily: theme.fontFamily,
        }}
      >
        {paperLabel} <span style={{ fontSize: 11 }}>▾</span>
      </span>
    </div>
  );
};

type LoadButtonProps = {
  progress: number;
  matchCount: number;
  loading: boolean;
};

export const LoadButton: React.FC<LoadButtonProps> = ({ progress, matchCount, loading }) => (
  <div
    style={{
      padding: 20,
      borderRadius: 16,
      backgroundColor: theme.surface,
      border: `1px solid ${theme.cardBorder}`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      minWidth: 480,
    }}
  >
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 36,
        padding: '0 16px',
        borderRadius: 8,
        border: 'none',
        backgroundColor: theme.primary,
        color: '#fff',
        fontSize: 14,
        fontWeight: 500,
        fontFamily: theme.fontFamily,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}
    >
      Load matching papers
    </button>

    {loading && (
      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: `2px solid ${theme.progressFill}`,
              borderTopColor: 'transparent',
            }}
          />
          <span style={{ fontSize: 14, fontWeight: 500, color: theme.text, fontFamily: theme.fontFamily }}>
            Loading questions...
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: 6,
            borderRadius: 999,
            backgroundColor: theme.progressTrack,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              backgroundColor: theme.progressFill,
              borderRadius: 999,
            }}
          />
        </div>
      </div>
    )}

    {!loading && matchCount > 0 && (
      <div style={{ marginTop: 14 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            padding: '4px 10px',
            borderRadius: 999,
            backgroundColor: theme.pillBg,
            color: theme.pillText,
            border: `1px solid ${theme.pillBorder}`,
            fontFamily: theme.fontFamily,
          }}
        >
          {matchCount} matches
        </span>
      </div>
    )}
  </div>
);

type QuestionCardProps = {
  visibleChars: number;
};

export const QuestionCard: React.FC<QuestionCardProps> = ({ visibleChars }) => {
  const { sampleQuestion } = demoState;
  const text = sampleQuestion.preview.slice(0, visibleChars);

  return (
    <div
      style={{
        padding: 20,
        borderRadius: 16,
        backgroundColor: theme.surface,
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        minWidth: 560,
        maxWidth: 640,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: theme.textMuted, fontFamily: theme.fontFamily }}>
          {sampleQuestion.title}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            padding: '4px 10px',
            borderRadius: 999,
            backgroundColor: theme.pillBg,
            color: theme.pillText,
            border: `1px solid ${theme.pillBorder}`,
            fontFamily: theme.fontFamily,
          }}
        >
          {demoState.matchCount} matches
        </span>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 16,
          lineHeight: 1.5,
          color: theme.text,
          fontFamily: theme.fontFamily,
        }}
      >
        {text}
        {visibleChars < sampleQuestion.preview.length && (
          <span style={{ opacity: 0.5 }}>|</span>
        )}
      </p>
    </div>
  );
};

export const ExportDropdown: React.FC<{ open: boolean; highlightItem?: 'questions' | 'markschemes' | null }> = ({
  open,
  highlightItem = null,
}) => (
  <div style={{ position: 'relative', minWidth: 280 }}>
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 36,
        padding: '0 14px',
        borderRadius: 8,
        border: `1px solid ${theme.inputBorder}`,
        backgroundColor: theme.surface,
        color: theme.text,
        fontSize: 14,
        fontWeight: 500,
        fontFamily: theme.fontFamily,
      }}
    >
      Export ▾
    </button>

    {open && (
      <div
        style={{
          position: 'absolute',
          top: 44,
          right: 0,
          width: 220,
          borderRadius: 8,
          border: `1px solid ${theme.cardBorder}`,
          backgroundColor: theme.surface,
          padding: 4,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}
      >
        {(['questions', 'markschemes'] as const).map(item => (
          <div
            key={item}
            style={{
              padding: '10px 12px',
              borderRadius: 6,
              fontSize: 14,
              color: theme.text,
              fontFamily: theme.fontFamily,
              backgroundColor: highlightItem === item ? 'rgba(147,51,234,0.15)' : 'transparent',
            }}
          >
            {item === 'questions' ? '📄 Questions PDF' : '📝 Mark Schemes PDF'}
          </div>
        ))}
      </div>
    )}
  </div>
);
