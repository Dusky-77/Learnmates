import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { MacroFrame, CaptionBar } from '../components/MacroFrame';
import { AnimatedCursor } from '../components/AnimatedCursor';
import { SubjectDropdowns } from '../components/SubjectDropdowns';
import { demoState } from '../data/demoState';

/** Crop container origin for cursor coords (centered macro frame) */
const ORIGIN_X = 90;
const ORIGIN_Y = 720;

export const PickSubjectScene: React.FC = () => {
  const frame = useCurrentFrame();

  const level =
    frame >= 28 ? demoState.level : '';
  const board =
    frame >= 58 ? demoState.board : '';
  const subject =
    frame >= 88 ? demoState.subject : '';

  const showBoard = frame >= 35;
  const showSubject = frame >= 65;

  const highlightField: 'level' | 'board' | 'subject' | null =
    frame < 28 ? 'level' : frame < 58 ? 'board' : frame < 100 ? 'subject' : null;

  const zoom = interpolate(frame, [0, 15], [0.96, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <MacroFrame cropWidth={920} offsetY={-60}>
        <div
          style={{
            position: 'relative',
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <SubjectDropdowns
            level={level}
            board={board}
            subject={subject}
            showBoard={showBoard}
            showSubject={showSubject}
            highlightField={highlightField}
          />

          <AnimatedCursor
            moves={[
              {
                start: 0,
                duration: 22,
                from: { x: ORIGIN_X + 400, y: ORIGIN_Y + 200 },
                to: { x: ORIGIN_X + 140, y: ORIGIN_Y + 68 },
                clickAt: 22,
              },
              {
                start: 35,
                duration: 20,
                from: { x: ORIGIN_X + 140, y: ORIGIN_Y + 68 },
                to: { x: ORIGIN_X + 430, y: ORIGIN_Y + 68 },
                clickAt: 55,
              },
              {
                start: 68,
                duration: 20,
                from: { x: ORIGIN_X + 430, y: ORIGIN_Y + 68 },
                to: { x: ORIGIN_X + 720, y: ORIGIN_Y + 68 },
                clickAt: 88,
              },
            ]}
          />
        </div>
      </MacroFrame>
      <CaptionBar text="Pick your level, board, and subject." />
    </AbsoluteFill>
  );
};
