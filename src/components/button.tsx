import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, useTheme } from '@/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

export function Button({ label, onPress, variant = 'primary', disabled = false }: ButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isGhost
            ? 'transparent'
            : isPrimary
              ? theme.colors.primary
              : theme.colors.surfaceMuted,
          borderColor: isGhost ? 'transparent' : isPrimary ? theme.colors.primary : theme.colors.border,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.inner}>
        <Text
          style={[
            styles.text,
            { color: isPrimary ? theme.colors.primaryText : theme.colors.text },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  inner: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  text: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
});
