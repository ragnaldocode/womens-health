import { Redirect, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/components/brand';
import { Button } from '@/components/button';
import { ExamCard } from '@/components/exam-card';
import { LoadingScreen } from '@/components/loading-screen';
import { Screen } from '@/components/screen';
import { Body, Label, Muted, Subtitle, Title } from '@/components/typography';
import { CATALOG, EXAMS } from '@/data/catalog';
import { bandForAge, formatAge } from '@/domain/age';
import { appliesToAge, recommendations, summarize } from '@/domain/exams';
import { isoToBr } from '@/lib/format';
import { useAppData } from '@/hooks/use-app-data';
import { fonts, radius, shadows, spacing, useTheme } from '@/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const { status, error, profile, age, ageYears, band, performedIds, reload } = useAppData();

  if (status === 'loading') {
    return <LoadingScreen message="Carregando seus dados…" />;
  }

  if (status === 'error') {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Subtitle>Não foi possível abrir seus dados</Subtitle>
        <Muted style={{ textAlign: 'center' }}>{error}</Muted>
        <Button label="Tentar novamente" onPress={() => void reload()} />
      </View>
    );
  }

  if (!profile) {
    return <Redirect href="/onboarding" />;
  }

  const summary = summarize(EXAMS, performedIds, ageYears);
  const suggestions = recommendations(EXAMS, performedIds, ageYears, 3);
  const bandLabel = band?.label ?? bandForAge(ageYears ?? 0)?.label ?? null;

  return (
    <Screen noHeader>
      <LinearGradient
        colors={theme.gradients.hero}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.hero, shadows.card, { borderColor: theme.colors.border }]}
      >
        <BrandMark size={40} withWordmark />
        <View style={{ gap: spacing.xs }}>
          <Title>Acompanhe seus exames</Title>
          <Body style={{ color: theme.colors.textMuted }}>
            Um espaço só seu para saber quais exames preventivos fazem sentido agora.
          </Body>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Alterar data de nascimento. ${age ? formatAge(age) : 'Idade não calculada'}`}
          onPress={() => router.push('/onboarding')}
          style={({ pressed }) => [
            styles.agePill,
            { backgroundColor: '#FFFFFF', opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.ageText, { color: theme.colors.primaryDark }]}>
            {age ? formatAge(age) : 'Idade não calculada'}
            {bandLabel ? ` · faixa ${bandLabel.replace(/ anos?$/, '')}` : ''}
          </Text>
          <Text style={[styles.ageEdit, { color: theme.colors.primary }]}>editar ›</Text>
        </Pressable>
      </LinearGradient>

      <View
        style={[
          styles.card,
          shadows.card,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <Label>Seu progresso</Label>
        <View style={styles.progressRow}>
          <Text style={[styles.percent, { color: theme.colors.primary }]}>
            {summary.percentComplete}%
          </Text>
          <Muted style={{ paddingBottom: 8 }}>concluído</Muted>
        </View>
        <View
          style={[
            styles.track,
            { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.border },
          ]}
        >
          <LinearGradient
            colors={theme.gradients.progress}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.fill, { width: `${summary.percentComplete}%` }]}
          />
        </View>
        <Body style={{ fontWeight: '600' }}>
          {summary.performedApplicable} de {summary.applicable} exames recomendados para a sua idade
        </Body>
        <Muted>Dados salvos apenas neste dispositivo.</Muted>
      </View>

      <View style={styles.statsRow}>
        <View
          style={[styles.stat, { backgroundColor: theme.colors.successSoft, borderColor: 'transparent' }]}
        >
          <Text style={[styles.statNumber, { color: theme.colors.success }]}>
            {summary.performedApplicable}
          </Text>
          <Muted style={{ color: theme.colors.success }}>Realizados</Muted>
        </View>
        <View
          style={[
            styles.stat,
            { backgroundColor: theme.colors.accentSoft, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.statNumber, { color: theme.colors.primaryDark }]}>
            {summary.pendingApplicable}
          </Text>
          <Muted style={{ color: theme.colors.primaryDark }}>Pendentes</Muted>
        </View>
      </View>

      <Button label="Ver todos os exames" onPress={() => router.push('/lista')} />

      <View style={{ gap: spacing.md }}>
        <View style={styles.sectionHeader}>
          <Subtitle>Recomendados para você</Subtitle>
          <View style={[styles.sectionDash, { backgroundColor: theme.colors.accent }]} />
        </View>
        {suggestions.length === 0 ? (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.successSoft, borderColor: 'transparent' },
            ]}
          >
            <Body style={{ color: theme.colors.success, fontWeight: '600' }}>
              Todos os exames da sua faixa etária já estão marcados como realizados.
            </Body>
            <Muted>
              Você ainda pode registrar novos exames a qualquer momento na lista completa.
            </Muted>
          </View>
        ) : (
          suggestions.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              performed={performedIds.includes(exam.id)}
              applies={appliesToAge(exam, ageYears)}
              onPress={() => router.push(`/exame/${exam.id}`)}
            />
          ))
        )}
        <Muted>
          {summary.total} exames no catálogo ·{' '}
          {summary.total - summary.applicable > 0
            ? `${summary.total - summary.applicable} estão fora da sua faixa etária e seguem disponíveis na lista completa`
            : 'todos os itens do catálogo se aplicam à sua faixa etária'}
        </Muted>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border },
        ]}
      >
        <Label>Sobre o conteúdo</Label>
        <Muted>{CATALOG.disclaimer}</Muted>
        <Muted>
          Última revisão do catálogo: {isoToBr(CATALOG.lastReviewed)}
          {CATALOG.contentStatus === 'pendente_de_validacao_clinica'
            ? ' · conteúdo pendente de validação por profissional de saúde'
            : ''}
        </Muted>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  hero: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  agePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  ageText: { fontSize: 13, fontWeight: '700' },
  ageEdit: { fontSize: 12, fontWeight: '700' },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  percent: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40, fontWeight: '600' },
  track: {
    height: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  fill: { height: '100%', borderRadius: radius.pill },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  statNumber: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionDash: { width: 28, height: 3, borderRadius: radius.pill },
});
