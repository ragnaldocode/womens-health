import { Platform } from 'react-native';

/**
 * Tema claro único do app: rosas suaves, superfícies brancas e tipografia
 * de display em serifa para um tom mais acolhedor e feminino.
 * O app não alterna mais com o tema do sistema — a identidade visual é fixa.
 */
export interface Theme {
  name: 'light';
  colors: {
    background: string;
    surface: string;
    surfaceMuted: string;
    border: string;
    borderStrong: string;
    text: string;
    textMuted: string;
    primary: string;
    primaryDark: string;
    primaryText: string;
    primarySoft: string;
    accent: string;
    accentSoft: string;
    success: string;
    successSoft: string;
    warning: string;
    warningSoft: string;
    danger: string;
    dangerSoft: string;
    shadow: string;
  };
  gradients: {
    hero: readonly [string, string, string];
    blush: readonly [string, string];
    primary: readonly [string, string];
    progress: readonly [string, string];
  };
}

export const theme: Theme = {
  name: 'light',
  colors: {
    background: '#FFF6FA',
    surface: '#FFFFFF',
    surfaceMuted: '#FDEDF4',
    border: '#F6D7E4',
    borderStrong: '#EFBFD5',
    text: '#4A2136',
    textMuted: '#8B6076',
    primary: '#D6336C',
    primaryDark: '#B02A58',
    primaryText: '#FFFFFF',
    primarySoft: '#FCE3ED',
    accent: '#FF8FB0',
    accentSoft: '#FFE7F0',
    success: '#22795E',
    successSoft: '#E3F6EF',
    warning: '#8A5A18',
    warningSoft: '#FFF2DF',
    danger: '#B3243F',
    dangerSoft: '#FDE7EC',
    shadow: '#C2447A',
  },
  gradients: {
    hero: ['#FFE1EC', '#FFF0F6', '#FFF6FA'],
    blush: ['#FFE9F1', '#FFF6FA'],
    primary: ['#E23E74', '#C02B5F'],
    progress: ['#FF8FB0', '#D6336C'],
  },
};

export const fonts = {
  /** Serifa elegante para títulos (Georgia no iOS/web, serif no Android). */
  display: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    web: 'Georgia, "Times New Roman", serif',
    default: 'serif',
  }),
};

export const shadows = {
  card: {
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  button: {
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export function useTheme(): Theme {
  return theme;
}
