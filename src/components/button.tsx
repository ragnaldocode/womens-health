import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, shadows, spacing, useTheme } from '@/theme';

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
        isPrimary ? shadows.button : null,
        {
          backgroundColor: isGhost
            ? 'transparent'
            : isPrimary
              ? theme.colors.primary
              : theme.colors.surface,
          borderColor: isGhost
            ? 'transparent'
            : isPrimary
              ? 'transparent'
              : theme.colors.borderStrong,
          opacity: disabled ? 0.5 : pressed ? 0.88 : 1,
        },
      ]}
    >
      {isPrimary ? (
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
        />
      ) : null}
      <View style={styles.inner}>
        <Text
          style={[
            styles.text,
            {
              color: isPrimary
                ? theme.colors.primaryText
                : isGhost
                  ? theme.colors.primaryDark
                  : theme.colors.primaryDark,
            },
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
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: 52,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  inner: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  text: { fontSize: 15, fontWeight: '700', textAlign: 'center', letterSpacing: 0.2 },
});
