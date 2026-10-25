import { Pressable, StyleSheet, Text, View } from 'react-native';

import { categoryLabel, examAgeLabel, type Exam } from '@/domain/exams';
import { fonts, radius, shadows, spacing, useTheme } from '@/theme';
import { Label, Muted } from './typography';

interface ExamCardProps {
  exam: Exam;
  performed: boolean;
  /** Aplica-se à idade da usuária? Exames fora da faixa ficam esmaecidos. */
  applies: boolean;
  onPress: () => void;
}

export function ExamCard({ exam, performed, applies, onPress }: ExamCardProps) {
  const theme = useTheme();
  const statusLabel = performed ? 'realizado' : 'não realizado';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${exam.name}. ${categoryLabel(exam.category)}. ${examAgeLabel(exam)}. ${statusLabel}`}
      accessibilityHint="Abre os detalhes do exame"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        shadows.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.9 : applies ? 1 : 0.6,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={2}>
          {exam.name}
        </Text>
        <Muted numberOfLines={1}>
          {categoryLabel(exam.category)}
          {applies ? '' : ' · fora da sua faixa etária'}
        </Muted>
        <View style={styles.tags}>
          <View
            style={[
              styles.tag,
              { backgroundColor: theme.colors.accentSoft, borderColor: theme.colors.border },
            ]}
          >
            <Label style={{ color: theme.colors.primaryDark, letterSpacing: 0.4 }}>
              {examAgeLabel(exam)}
            </Label>
          </View>
          {performed ? (
            <View
              style={[
                styles.tag,
                { backgroundColor: theme.colors.successSoft, borderColor: 'transparent' },
              ]}
            >
              <Label style={{ color: theme.colors.success, letterSpacing: 0.4 }}>Realizado</Label>
            </View>
          ) : exam.conditional ? (
            <View
              style={[
                styles.tag,
                { backgroundColor: theme.colors.warningSoft, borderColor: 'transparent' },
              ]}
            >
              <Label style={{ color: theme.colors.warning, letterSpacing: 0.4 }}>
                Depende de avaliação
              </Label>
            </View>
          ) : null}
        </View>
      </View>
      <Text style={[styles.chevron, { color: theme.colors.primary }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  content: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.display, fontSize: 17, fontWeight: '600', lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chevron: { fontSize: 26, fontWeight: '300' },
});
