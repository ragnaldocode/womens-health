import { Pressable, StyleSheet, Text, View } from 'react-native';

import { categoryLabel, examAgeLabel, type Exam } from '@/domain/exams';
import { radius, spacing, useTheme } from '@/theme';
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
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.85 : applies ? 1 : 0.55,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={2}>
            {exam.name}
          </Text>
          <Muted numberOfLines={1}>
            {categoryLabel(exam.category)}
            {applies ? '' : ' · fora da sua faixa etária'}
          </Muted>
          <View style={styles.tags}>
            <View style={[styles.tag, { backgroundColor: theme.colors.surfaceMuted }]}>
              <Label style={{ color: theme.colors.textMuted, letterSpacing: 0.4 }}>
                {examAgeLabel(exam)}
              </Label>
            </View>
            {performed ? (
              <View style={[styles.tag, { backgroundColor: theme.colors.successSoft }]}>
                <Label style={{ color: theme.colors.success, letterSpacing: 0.4 }}>Realizado</Label>
              </View>
            ) : exam.conditional ? (
              <View style={[styles.tag, { backgroundColor: theme.colors.warningSoft }]}>
                <Label style={{ color: theme.colors.warning, letterSpacing: 0.4 }}>
                  Depende de avaliação
                </Label>
              </View>
            ) : null}
          </View>
        </View>
        <Text style={[styles.chevron, { color: theme.colors.textMuted }]}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  content: { flex: 1, gap: spacing.xs },
  name: { fontSize: 16, fontWeight: '600', lineHeight: 21 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  tag: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
  chevron: { fontSize: 26, fontWeight: '300' },
});
