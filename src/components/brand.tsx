import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, radius, useTheme } from '@/theme';

interface BrandMarkProps {
  size?: number;
  /** Selo com o nome do app ao lado do símbolo. */
  withWordmark?: boolean;
}

/**
 * Marca do app: flor em gradiente rosa. Funciona como elemento afetivo
 * no topo das telas, sem depender de imagens externas.
 */
export function BrandMark({ size = 44, withWordmark = false }: BrandMarkProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <LinearGradient
        colors={theme.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.mark,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Text accessible={false} style={[styles.glyph, { fontSize: size * 0.52 }]}>
          ❀
        </Text>
      </LinearGradient>
      {withWordmark ? (
        <Text style={[styles.wordmark, { color: theme.colors.primaryDark, fontSize: size * 0.42 }]}>
          Preventiva
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  glyph: { color: '#FFFFFF' },
  wordmark: {
    fontFamily: fonts.display,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
