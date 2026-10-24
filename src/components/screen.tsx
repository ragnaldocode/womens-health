import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, useTheme } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
}

/** Contêiner base: fundo do tema, respiro lateral e largura máxima no web. */
export function Screen({ children, scroll = true }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const inner = (
    <View style={[styles.inner, { paddingBottom: spacing.xxl + insets.bottom }]}>{children}</View>
  );

  if (!scroll) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>{inner}</View>
    );
  }

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.flexGrow}
      keyboardShouldPersistTaps="handled"
    >
      {inner}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexGrow: { flexGrow: 1 },
  inner: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
});
