import React from 'react';
import { AbsoluteFill } from 'remotion';
import { theme, VIDEO } from '../theme';

type MacroFrameProps = {
  children: React.ReactNode;
  /** Width of the sharp crop in px */
  cropWidth?: number;
  /** Vertical offset of crop center from frame center */
  offsetY?: number;
};

export const MacroFrame: React.FC<MacroFrameProps> = ({
  children,
  cropWidth = 920,
  offsetY = 40,
}) => {
  const cropStyle: React.CSSProperties = {
    width: cropWidth,
    maxWidth: '92%',
    position: 'relative',
    zIndex: 2,
    transform: `translateY(${offsetY}px)`,
  };

  const blurStyle: React.CSSProperties = {
    ...cropStyle,
    position: 'absolute',
    zIndex: 1,
    filter: 'blur(18px)',
    opacity: 0.18,
    pointerEvents: 'none',
    transform: `translateY(${offsetY}px) scale(1.04)`,
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.canvas,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 70% 55% at 50% 48%, transparent 0%, ${theme.canvas} 100%)`,
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={blurStyle}>{children}</div>
        <div style={cropStyle}>{children}</div>
      </div>
    </AbsoluteFill>
  );
};

export const SceneShell: React.FC<{ children: React.ReactNode; caption: string }> = ({
  children,
  caption,
}) => (
  <AbsoluteFill style={{ backgroundColor: theme.canvas }}>
    {children}
    <CaptionBar text={caption} />
  </AbsoluteFill>
);

const CaptionBar: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: 'absolute',
      bottom: 120,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      padding: '0 48px',
      zIndex: 10,
    }}
  >
    <div
      style={{
        backgroundColor: theme.captionScrim,
        borderRadius: 12,
        padding: '14px 28px',
        maxWidth: VIDEO.width - 96,
      }}
    >
      <p
        style={{
          margin: 0,
          color: theme.text,
          fontFamily: theme.fontFamily,
          fontSize: 34,
          fontWeight: 700,
          textAlign: 'center',
          lineHeight: 1.25,
        }}
      >
        {text}
      </p>
    </div>
  </div>
);

export { CaptionBar };
