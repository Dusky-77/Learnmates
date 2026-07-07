import React from 'react';
import {
  Component,
  useCurrentFrame,
  interpolate,
  Easing,
  Styles,
  AbsoluteFill,
} from 'remotion';

const fps = 30;
const durationInSeconds = 5;
const durationInFrames = fps * durationInSeconds;

interface Props {}

const CircleAndText: Component<Props> = () => {
  const frame = useCurrentFrame();

  // Circle animation: scale from 0 to 1, opacity from 0 to 1 over first 1 second (30 frames)
  const circleProgress = Math.min(frame / (fps * 1), 1); // 0..1 over 1s
  const circleScale = interpolate(circleProgress, [0, 1], [0, 1], Easing.out(Easing.cubic));
  const circleOpacity = interpolate(circleProgress, [0, 1], [0, 1]);

  // Text typing: reveal letters over 2 seconds starting at 1 second mark
  const typingStart = fps * 1; // 1 second in
  const typingDuration = fps * 2; // 2 seconds
  const typingProgress = Math.min(Math.max((frame - typingStart) / typingDuration, 0), 1);
  const visibleChars = Math.floor(interpolate(typingProgress, [0, 1], [0, 11]) * 11); // "Hello World".length === 11
  const text = 'Hello World'.slice(0, visibleChars);

  const circleStyle: Styles = {
    width: 100 * circleScale,
    height: 100 * circleScale,
    backgroundColor: 'blue',
    borderRadius: '50%',
    opacity: circleOpacity,
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: `translate(-50%, -50%) scale(${circleScale})`,
  };

  const textStyle: Styles = {
    position: 'absolute',
    left: '50%',
    top: '60%',
    transform: 'translateX(-50%)',
    fontSize: 24,
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    opacity: typingProgress, // fade in together with typing
  };

  return (
    <div style={{ position: 'relative', width: 1080, height: 1080, backgroundColor: '#111' }}>
      <div style={circleStyle} />
      <div style={textStyle}>{text}</div>
    </div>
  );
};

export const composition = {
  id: 'hello-world-video',
  component: CircleAndText,
  durationInFrames,
  fps,
  backgroundColor: '#000',
};
