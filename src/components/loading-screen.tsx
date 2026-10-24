import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Muted } from '@/components/typography';
import { spacing, useTheme } from '@/theme';

/** Estado de carregamento inicial dos dados locais. */
export function LoadingScreen({ message = 'Carregando…' }: { message?: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator color={theme.colors.primary} />
      <Muted>{message}</Muted>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
});
