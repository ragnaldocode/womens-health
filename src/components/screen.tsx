import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, useTheme } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  /** Telas sem header do stack precisam compensar a área segura do topo. */
  noHeader?: boolean;
}

/**
 * Contêiner base: fundo rosa suave com um halo em gradiente no topo,
 * respiro lateral e largura máxima no web.
 */
export function Screen({ children, scroll = true, noHeader = false }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const inner = (
    <View
      style={[
        styles.inner,
        {
          paddingTop: noHeader ? insets.top + spacing.md : spacing.md,
          paddingBottom: spacing.xxl + insets.bottom,
        },
      ]}
    >
      {children}
    </View>
  );
  const backdrop = (
    <>
      <LinearGradient
        colors={['#FFE4EE', '#FFF0F6', '#FFF6FA']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.halo}
        pointerEvents="none"
      />
      <View style={[styles.blob, { backgroundColor: theme.colors.accentSoft }]} pointerEvents="none" />
    </>
  );

  if (!scroll) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
        {backdrop}
        {inner}
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      {backdrop}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.flexGrow}
        keyboardShouldPersistTaps="handled"
      >
        {inner}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexGrow: { flexGrow: 1 },
  halo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
  },
  blob: {
    position: 'absolute',
    top: -90,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.4,
  },
  inner: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
});
