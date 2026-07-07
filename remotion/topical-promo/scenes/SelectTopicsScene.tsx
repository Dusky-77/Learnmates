import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { MacroFrame, CaptionBar } from '../components/MacroFrame';
import { AnimatedCursor } from '../components/AnimatedCursor';
import { TopicCheckboxes } from '../components/UIPieces';

const ORIGIN_X = 280;
const ORIGIN_Y = 680;

export const SelectTopicsScene: React.FC = () => {
  const frame = useCurrentFrame();

  const checkedCount =
    frame < 35 ? 0 : frame < 65 ? 1 : frame < 95 ? 2 : 3;

  const zoom = interpolate(frame, [0, 12], [0.96, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <MacroFrame cropWidth={580} offsetY={-40}>
        <div style={{ position: 'relative', transform: `scale(${zoom})` }}>
          <TopicCheckboxes checkedCount={checkedCount} />

          <AnimatedCursor
            moves={[
              {
                start: 0,
                duration: 24,
                from: { x: ORIGIN_X + 300, y: ORIGIN_Y + 180 },
                to: { x: ORIGIN_X + 42, y: ORIGIN_Y + 168 },
                clickAt: 24,
              },
              {
                start: 38,
                duration: 18,
                from: { x: ORIGIN_X + 42, y: ORIGIN_Y + 168 },
                to: { x: ORIGIN_X + 42, y: ORIGIN_Y + 210 },
                clickAt: 56,
              },
              {
                start: 68,
                duration: 18,
                from: { x: ORIGIN_X + 42, y: ORIGIN_Y + 210 },
                to: { x: ORIGIN_X + 42, y: ORIGIN_Y + 252 },
                clickAt: 86,
              },
            ]}
          />
        </div>
      </MacroFrame>
      <CaptionBar text="Select exactly what you're revising." />
    </AbsoluteFill>
  );
};
