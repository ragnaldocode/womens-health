import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

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
import { radius, spacing, useTheme } from '@/theme';

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
    <Screen>
      <View style={styles.header}>
        <Label>Saúde preventiva</Label>
        <Title>Acompanhe seus exames</Title>
        <View style={[styles.agePill, { backgroundColor: theme.colors.primarySoft }]}>
          <Text style={[styles.ageText, { color: theme.colors.primary }]}>
            {age ? `${formatAge(age)}` : 'Idade não calculada'}
            {bandLabel ? ` · ${bandLabel}` : ''}
          </Text>
        </View>
      </View>

      <View
        style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      >
        <Body style={{ fontWeight: '600' }}>
          {summary.performedApplicable} de {summary.applicable} exames recomendados para a sua idade
          estão marcados como realizados
        </Body>
        <View style={[styles.track, { backgroundColor: theme.colors.surfaceMuted }]}>
          <View
            style={[
              styles.fill,
              {
                width: `${summary.percentComplete}%`,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        </View>
        <Muted>{summary.percentComplete}% concluído · dados salvos apenas neste dispositivo</Muted>
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
          style={[styles.stat, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}
        >
          <Text style={[styles.statNumber, { color: theme.colors.text }]}>
            {summary.pendingApplicable}
          </Text>
          <Muted>Pendentes</Muted>
        </View>
      </View>

      <Button label="Ver todos os exames" onPress={() => router.push('/lista')} />

      <View style={{ gap: spacing.md }}>
        <Subtitle>Recomendados para você</Subtitle>
        {suggestions.length === 0 ? (
          <View
            style={[styles.card, { backgroundColor: theme.colors.successSoft, borderColor: 'transparent' }]}
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
        style={[styles.card, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}
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

      <Button
        label="Alterar data de nascimento"
        variant="secondary"
        onPress={() => router.push('/onboarding')}
      />
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
  header: { gap: spacing.xs },
  agePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  ageText: { fontSize: 13, fontWeight: '700' },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  track: { height: 10, borderRadius: radius.pill, overflow: 'hidden', marginTop: spacing.xs },
  fill: { height: '100%', borderRadius: radius.pill },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  statNumber: { fontSize: 30, fontWeight: '700' },
});
