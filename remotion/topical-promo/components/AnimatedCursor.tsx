import React from 'react';
import { interpolate, useCurrentFrame, Easing } from 'remotion';
import { theme } from '../theme';

export type CursorMove = {
  start: number;
  duration: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  clickAt?: number;
};

type AnimatedCursorProps = {
  moves: CursorMove[];
  visibleFrom?: number;
};

export const AnimatedCursor: React.FC<AnimatedCursorProps> = ({ moves, visibleFrom = 0 }) => {
  const frame = useCurrentFrame();

  if (frame < visibleFrom) return null;

  const activeMove =
    [...moves].reverse().find(m => frame >= m.start) ?? moves[0];

  const progress = interpolate(
    frame,
    [activeMove.start, activeMove.start + activeMove.duration],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    }
  );

  const x = interpolate(progress, [0, 1], [activeMove.from.x, activeMove.to.x]);
  const y = interpolate(progress, [0, 1], [activeMove.from.y, activeMove.to.y]);

  const clickFrame = activeMove.clickAt;
  const rippleScale =
    clickFrame !== undefined
      ? interpolate(frame, [clickFrame, clickFrame + 18], [0.2, 2.2], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 0;
  const rippleOpacity =
    clickFrame !== undefined
      ? interpolate(frame, [clickFrame, clickFrame + 18], [0.7, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 0;

  const clickScale =
    clickFrame !== undefined
      ? interpolate(
          frame,
          [clickFrame, clickFrame + 4, clickFrame + 10],
          [1, 0.82, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        )
      : 1;

  return (
    <>
      {clickFrame !== undefined && frame >= clickFrame && frame < clickFrame + 20 && (
        <div
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: 48,
            height: 48,
            marginLeft: -24,
            marginTop: -24,
            borderRadius: '50%',
            border: `2px solid ${theme.ripple}`,
            transform: `scale(${rippleScale})`,
            opacity: rippleOpacity,
            pointerEvents: 'none',
            zIndex: 50,
          }}
        />
      )}

      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          transform: `scale(${clickScale})`,
          zIndex: 51,
          pointerEvents: 'none',
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.45))',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
            fill="#fff"
            stroke="#111"
            strokeWidth="1.2"
          />
        </svg>
      </div>
    </>
  );
};
