import { useColorScheme } from 'react-native';

export interface Theme {
  name: 'light' | 'dark';
  colors: {
    background: string;
    surface: string;
    surfaceMuted: string;
    border: string;
    text: string;
    textMuted: string;
    primary: string;
    primaryText: string;
    primarySoft: string;
    success: string;
    successSoft: string;
    warning: string;
    warningSoft: string;
    danger: string;
  };
}

export const themes: Record<'light' | 'dark', Theme> = {
  light: {
    name: 'light',
    colors: {
      background: '#FDF8FA',
      surface: '#FFFFFF',
      surfaceMuted: '#F6ECF0',
      border: '#EAD9E1',
      text: '#2B1620',
      textMuted: '#6F5662',
      primary: '#8A2E56',
      primaryText: '#FFFFFF',
      primarySoft: '#F3DEE7',
      success: '#1F7A5C',
      successSoft: '#DDF0E8',
      warning: '#8A5A18',
      warningSoft: '#FAEEDA',
      danger: '#9B2C2C',
    },
  },
  dark: {
    name: 'dark',
    colors: {
      background: '#140A10',
      surface: '#21131A',
      surfaceMuted: '#2C1A23',
      border: '#3C2531',
      text: '#F8EEF3',
      textMuted: '#BFA6B1',
      primary: '#E68FB4',
      primaryText: '#2A0E1C',
      primarySoft: '#40202E',
      success: '#66D6AA',
      successSoft: '#1C3A2F',
      warning: '#F0BE72',
      warningSoft: '#3A2C17',
      danger: '#F09A9A',
    },
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? themes.dark : themes.light;
}
