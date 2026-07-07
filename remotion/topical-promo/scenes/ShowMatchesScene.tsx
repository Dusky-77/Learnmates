import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { MacroFrame, CaptionBar } from '../components/MacroFrame';
import { QuestionCard } from '../components/UIPieces';
import { demoState } from '../data/demoState';

export const ShowMatchesScene: React.FC = () => {
  const frame = useCurrentFrame();

  const slideY = interpolate(frame, [0, 20], [40, 0], { extrapolateRight: 'clamp' });
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const visibleChars = Math.floor(
    interpolate(frame, [20, 100], [0, demoState.sampleQuestion.preview.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  return (
    <AbsoluteFill>
      <MacroFrame cropWidth={680} offsetY={-30}>
        <div style={{ transform: `translateY(${slideY}px)`, opacity }}>
          <QuestionCard visibleChars={visibleChars} />
        </div>
      </MacroFrame>
      <CaptionBar text="Real exam questions. Matched to your syllabus." />
    </AbsoluteFill>
  );
};
