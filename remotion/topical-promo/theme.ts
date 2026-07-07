export const theme = {
  canvas: '#0f1117',
  card: '#1e293b',
  cardBorder: '#334155',
  surface: '#111827',
  primary: '#9333ea',
  primaryHover: '#7e22ce',
  unitLabel: '#a5b4fc',
  text: '#f3f4f6',
  textMuted: '#9ca3af',
  pillText: '#a855f7',
  pillBg: 'rgba(168, 85, 247, 0.1)',
  pillBorder: 'rgba(168, 85, 247, 0.3)',
  logo: '#FDA90E',
  progressTrack: '#1e3a5f',
  progressFill: '#3b82f6',
  ripple: 'rgba(147, 51, 234, 0.4)',
  captionScrim: 'rgba(0, 0, 0, 0.55)',
  inputBorder: '#374151',
  checkbox: '#9333ea',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
} as const;

export const VIDEO = {
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: 900,
} as const;

export const SCENES = {
  hook: 90,
  pickSubject: 120,
  selectTopics: 150,
  filter: 120,
  load: 90,
  showMatches: 120,
  exportCta: 210,
} as const;
