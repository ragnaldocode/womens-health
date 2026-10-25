import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/brand';
import { Muted } from '@/components/typography';
import { spacing, useTheme } from '@/theme';

/** Estado de carregamento inicial dos dados locais. */
export function LoadingScreen({ message = 'Carregando…' }: { message?: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <BrandMark size={52} />
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
    gap: spacing.md,
    padding: spacing.xl,
  },
});
