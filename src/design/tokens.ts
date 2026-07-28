export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
} as const;

export const semanticColors = {
  light: {
    background: {
      primary: colors.neutral[0],
      secondary: colors.neutral[50],
      tertiary: colors.neutral[100],
      inverse: colors.neutral[900],
    },
    surface: {
      primary: colors.neutral[0],
      secondary: colors.neutral[50],
      tertiary: colors.neutral[100],
      raised: colors.neutral[0],
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    border: {
      primary: colors.neutral[200],
      secondary: colors.neutral[300],
      focus: colors.primary[500],
      error: colors.danger[500],
      success: colors.success[500],
    },
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[600],
      tertiary: colors.neutral[400],
      inverse: colors.neutral[0],
      link: colors.primary[600],
      linkHover: colors.primary[700],
      error: colors.danger[600],
      success: colors.success[600],
      warning: colors.warning[600],
    },
    icon: {
      primary: colors.neutral[600],
      secondary: colors.neutral[400],
      inverse: colors.neutral[0],
    },
    interactive: {
      primary: {
        default: colors.primary[600],
        hover: colors.primary[700],
        active: colors.primary[800],
        disabled: colors.neutral[300],
      },
      primaryText: {
        default: colors.neutral[0],
        hover: colors.neutral[0],
        active: colors.neutral[100],
        disabled: colors.neutral[400],
      },
      secondary: {
        default: colors.neutral[100],
        hover: colors.neutral[200],
        active: colors.neutral[300],
        disabled: colors.neutral[200],
      },
      secondaryText: {
        default: colors.neutral[900],
        hover: colors.neutral[900],
        active: colors.neutral[700],
        disabled: colors.neutral[400],
      },
      ghost: {
        default: 'transparent',
        hover: colors.neutral[100],
        active: colors.neutral[200],
        disabled: 'transparent',
      },
      ghostText: {
        default: colors.neutral[700],
        hover: colors.neutral[900],
        active: colors.neutral[900],
        disabled: colors.neutral[400],
      },
      danger: {
        default: colors.danger[600],
        hover: colors.danger[700],
        active: colors.danger[800],
        disabled: colors.neutral[300],
      },
      dangerText: {
        default: colors.neutral[0],
        hover: colors.neutral[0],
        active: colors.neutral[100],
        disabled: colors.neutral[400],
      },
    },
    focus: {
      ring: colors.primary[500],
      ringOffset: colors.neutral[0],
    },
    overlay: {
      backdrop: 'rgba(0, 0, 0, 0.5)',
      modal: colors.neutral[0],
    },
  },
  dark: {
    background: {
      primary: colors.neutral[950],
      secondary: colors.neutral[900],
      tertiary: colors.neutral[800],
      inverse: colors.neutral[0],
    },
    surface: {
      primary: colors.neutral[900],
      secondary: colors.neutral[800],
      tertiary: colors.neutral[700],
      raised: colors.neutral[800],
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
    border: {
      primary: colors.neutral[700],
      secondary: colors.neutral[600],
      focus: colors.primary[400],
      error: colors.danger[400],
      success: colors.success[400],
    },
    text: {
      primary: colors.neutral[50],
      secondary: colors.neutral[400],
      tertiary: colors.neutral[500],
      inverse: colors.neutral[900],
      link: colors.primary[400],
      linkHover: colors.primary[300],
      error: colors.danger[400],
      success: colors.success[400],
      warning: colors.warning[400],
    },
    icon: {
      primary: colors.neutral[400],
      secondary: colors.neutral[500],
      inverse: colors.neutral[900],
    },
    interactive: {
      primary: {
        default: colors.primary[500],
        hover: colors.primary[400],
        active: colors.primary[600],
        disabled: colors.neutral[700],
      },
      primaryText: {
        default: colors.neutral[0],
        hover: colors.neutral[0],
        active: colors.neutral[100],
        disabled: colors.neutral[500],
      },
      secondary: {
        default: colors.neutral[800],
        hover: colors.neutral[700],
        active: colors.neutral[600],
        disabled: colors.neutral[700],
      },
      secondaryText: {
        default: colors.neutral[100],
        hover: colors.neutral[50],
        active: colors.neutral[200],
        disabled: colors.neutral[500],
      },
      ghost: {
        default: 'transparent',
        hover: colors.neutral[800],
        active: colors.neutral[700],
        disabled: 'transparent',
      },
      ghostText: {
        default: colors.neutral[300],
        hover: colors.neutral[50],
        active: colors.neutral[50],
        disabled: colors.neutral[500],
      },
      danger: {
        default: colors.danger[500],
        hover: colors.danger[400],
        active: colors.danger[600],
        disabled: colors.neutral[700],
      },
      dangerText: {
        default: colors.neutral[0],
        hover: colors.neutral[0],
        active: colors.neutral[100],
        disabled: colors.neutral[500],
      },
    },
    focus: {
      ring: colors.primary[400],
      ringOffset: colors.neutral[900],
    },
    overlay: {
      backdrop: 'rgba(0, 0, 0, 0.7)',
      modal: colors.neutral[900],
    },
  },
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  focus: '0 0 0 3px rgb(59 130 246 / 0.4)',
  focusDark: '0 0 0 3px rgb(96 165 250 / 0.4)',
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
} as const;

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
  toast: 1600,
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export type ColorScale = typeof colors.primary;
export type SemanticColors = typeof semanticColors.light;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type Typography = typeof typography;