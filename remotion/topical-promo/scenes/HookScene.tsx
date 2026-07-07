import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing } from 'remotion';
import { theme } from '../theme';
import { CaptionBar } from '../components/MacroFrame';

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();

  const logoOpacity = interpolate(frame, [0, 20, 70, 90], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });
  const logoScale = interpolate(frame, [0, 25], [0.6, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const textOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: 'clamp' });
  const papersOpacity = interpolate(frame, [0, 15], [0.6, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.canvas, alignItems: 'center', justifyContent: 'center' }}>
      {/* decorative past paper stack */}
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 180,
            height: 240,
            borderRadius: 8,
            backgroundColor: theme.card,
            border: `1px solid ${theme.cardBorder}`,
            transform: `rotate(${-8 + i * 8}deg) translateY(${i * 6}px)`,
            opacity: papersOpacity,
            top: '32%',
          }}
        />
      ))}

      <div style={{ opacity: logoOpacity, transform: `scale(${logoScale})`, textAlign: 'center' }}>
        <Img src={staticFile('logo.svg')} style={{ width: 120, height: 'auto' }} />
        <p
          style={{
            marginTop: 24,
            fontSize: 38,
            fontWeight: 700,
            color: theme.text,
            fontFamily: theme.fontFamily,
            opacity: textOpacity,
            maxWidth: 700,
            lineHeight: 1.2,
          }}
        >
          Stop searching past papers page by page.
        </p>
      </div>

      <CaptionBar text="Find exam questions by topic — instantly." />
    </AbsoluteFill>
  );
};
