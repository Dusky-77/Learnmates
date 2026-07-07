import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { MacroFrame, CaptionBar } from '../components/MacroFrame';
import { AnimatedCursor } from '../components/AnimatedCursor';
import { FilterBarMini } from '../components/UIPieces';

const ORIGIN_X = 250;
const ORIGIN_Y = 760;

export const FilterScene: React.FC = () => {
  const frame = useCurrentFrame();

  const mcqFilter: 'all' | 'mcq' | 'theory' =
    frame < 45 ? 'all' : 'theory';
  const paperLabel = frame < 75 ? 'All papers' : 'Paper 2';

  const zoom = interpolate(frame, [0, 12], [0.96, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <MacroFrame cropWidth={620} offsetY={-20}>
        <div style={{ position: 'relative', transform: `scale(${zoom})` }}>
          <FilterBarMini mcqFilter={mcqFilter} paperLabel={paperLabel} />

          <AnimatedCursor
            moves={[
              {
                start: 0,
                duration: 22,
                from: { x: ORIGIN_X + 280, y: ORIGIN_Y + 120 },
                to: { x: ORIGIN_X + 200, y: ORIGIN_Y + 56 },
                clickAt: 22,
              },
              {
                start: 35,
                duration: 20,
                from: { x: ORIGIN_X + 200, y: ORIGIN_Y + 56 },
                to: { x: ORIGIN_X + 420, y: ORIGIN_Y + 56 },
                clickAt: 55,
              },
              {
                start: 65,
                duration: 18,
                from: { x: ORIGIN_X + 420, y: ORIGIN_Y + 56 },
                to: { x: ORIGIN_X + 480, y: ORIGIN_Y + 56 },
                clickAt: 83,
              },
            ]}
          />
        </div>
      </MacroFrame>
      <CaptionBar text="Filter by type, paper, and year." />
    </AbsoluteFill>
  );
};
