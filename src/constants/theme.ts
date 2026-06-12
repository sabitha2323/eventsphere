import { Platform } from 'react-native';

// ─── New EventSphere Design System ───────────────────────────────────────────

export const Theme = {
  colors: {
    // Brand Colors
    primary: '#7C3AED',
    primaryLight: '#A78BFA',
    primaryDark: '#5B21B6',
    secondary: '#2563EB',
    secondaryDark: '#1D4ED8',

    // Core Layout Colors
    background: '#FFFFFF',
    backgroundCard: '#F8FAFC',
    text: '#0F172A',
    textMuted: '#64748B',
    textSecondary: '#334155',

    // Glassmorphism tokens
    glassBg: 'rgba(255, 255, 255, 0.75)',
    glassBgHover: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(15, 23, 42, 0.08)',
    glassPrimaryBg: 'rgba(124, 58, 237, 0.06)',
    glassPrimaryBorder: 'rgba(124, 58, 237, 0.15)',

    // Utilities
    white: '#FFFFFF',
    black: '#000000',
    overlay: 'rgba(0, 0, 0, 0.4)',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',

    // Category color map
    categories: {
      Music: '#EC4899',
      Cultural: '#F59E0B',
      College: '#10B981',
      Sports: '#3B82F6',
      Technology: '#8B5CF6',
      'Food Festival': '#EF4444',
      Workshops: '#06B6D4',
    },
  },

  fonts: Platform.select({
    ios: { regular: 'System', medium: 'System', bold: 'System' },
    android: {
      regular: 'sans-serif',
      medium: 'sans-serif-medium',
      bold: 'sans-serif-bold',
    },
    default: {
      regular: 'sans-serif',
      medium: 'sans-serif-medium',
      bold: 'sans-serif-bold',
    },
  }),

  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },

  borderRadius: { sm: 6, md: 12, lg: 20, xl: 30, round: 9999 },

  shadows: Platform.select({
    ios: {
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
    },
    android: { elevation: 6 },
    default: {},
  }),
};

// ─── Backwards-compat exports (used by un-replaced boilerplate components) ───

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
