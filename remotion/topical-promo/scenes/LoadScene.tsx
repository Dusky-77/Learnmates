import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { MacroFrame, CaptionBar } from '../components/MacroFrame';
import { AnimatedCursor } from '../components/AnimatedCursor';
import { LoadButton } from '../components/UIPieces';
import { demoState } from '../data/demoState';

const ORIGIN_X = 300;
const ORIGIN_Y = 780;

export const LoadScene: React.FC = () => {
  const frame = useCurrentFrame();

  const clicked = frame >= 22;
  const loading = clicked && frame < 55;
  const progress = loading
    ? interpolate(frame, [22, 55], [0, 1], { extrapolateRight: 'clamp' })
    : clicked
      ? 1
      : 0;
  const matchCount = frame >= 58 ? demoState.matchCount : 0;

  const zoom = interpolate(frame, [0, 12], [0.96, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <MacroFrame cropWidth={540} offsetY={-10}>
        <div style={{ position: 'relative', transform: `scale(${zoom})` }}>
          <LoadButton progress={progress} matchCount={matchCount} loading={loading} />

          <AnimatedCursor
            moves={[
              {
                start: 0,
                duration: 20,
                from: { x: ORIGIN_X + 260, y: ORIGIN_Y + 140 },
                to: { x: ORIGIN_X + 160, y: ORIGIN_Y + 48 },
                clickAt: 20,
              },
              {
                start: 20,
                duration: 60,
                from: { x: ORIGIN_X + 160, y: ORIGIN_Y + 48 },
                to: { x: ORIGIN_X + 160, y: ORIGIN_Y + 48 },
              },
            ]}
          />
        </div>
      </MacroFrame>
      <CaptionBar text="We scan past papers for you." />
    </AbsoluteFill>
  );
};
