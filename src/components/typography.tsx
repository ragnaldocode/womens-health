import { Text, type TextProps } from 'react-native';

import { useTheme } from '@/theme';

export function Title({ style, ...props }: TextProps) {
  const theme = useTheme();
  return (
    <Text
      accessibilityRole="header"
      style={[{ color: theme.colors.text, fontSize: 26, fontWeight: '700' }, style]}
      {...props}
    />
  );
}

export function Subtitle({ style, ...props }: TextProps) {
  const theme = useTheme();
  return (
    <Text
      style={[{ color: theme.colors.text, fontSize: 18, fontWeight: '600' }, style]}
      {...props}
    />
  );
}

export function Body({ style, ...props }: TextProps) {
  const theme = useTheme();
  return (
    <Text style={[{ color: theme.colors.text, fontSize: 15, lineHeight: 22 }, style]} {...props} />
  );
}

export function Muted({ style, ...props }: TextProps) {
  const theme = useTheme();
  return (
    <Text style={[{ color: theme.colors.textMuted, fontSize: 13, lineHeight: 19 }, style]} {...props} />
  );
}

export function Label({ style, ...props }: TextProps) {
  const theme = useTheme();
  return (
    <Text
      style={[
        {
          color: theme.colors.textMuted,
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 0.8,
          textTransform: 'uppercase',
        },
        style,
      ]}
      {...props}
    />
  );
}
