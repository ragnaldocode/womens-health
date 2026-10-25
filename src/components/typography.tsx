import { Text, type TextProps } from 'react-native';

import { fonts, useTheme } from '@/theme';

export function Title({ style, ...props }: TextProps) {
  const theme = useTheme();
  return (
    <Text
      accessibilityRole="header"
      style={[
        {
          color: theme.colors.text,
          fontFamily: fonts.display,
          fontSize: 30,
          lineHeight: 37,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
        style,
      ]}
      {...props}
    />
  );
}

export function Subtitle({ style, ...props }: TextProps) {
  const theme = useTheme();
  return (
    <Text
      style={[
        {
          color: theme.colors.text,
          fontFamily: fonts.display,
          fontSize: 20,
          lineHeight: 26,
          fontWeight: '600',
        },
        style,
      ]}
      {...props}
    />
  );
}

export function Body({ style, ...props }: TextProps) {
  const theme = useTheme();
  return (
    <Text style={[{ color: theme.colors.text, fontSize: 15, lineHeight: 23 }, style]} {...props} />
  );
}

export function Muted({ style, ...props }: TextProps) {
  const theme = useTheme();
  return (
    <Text style={[{ color: theme.colors.textMuted, fontSize: 13, lineHeight: 20 }, style]} {...props} />
  );
}

export function Label({ style, ...props }: TextProps) {
  const theme = useTheme();
  return (
    <Text
      style={[
        {
          color: theme.colors.textMuted,
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 1.1,
          textTransform: 'uppercase',
        },
        style,
      ]}
      {...props}
    />
  );
}
