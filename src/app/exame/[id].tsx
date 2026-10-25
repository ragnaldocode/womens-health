import { useMemo, useState } from 'react';
import { Redirect, Stack, router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { DateField, dateValueFromIso, type DateValue } from '@/components/date-field';
import { LoadingScreen } from '@/components/loading-screen';
import { Screen } from '@/components/screen';
import { Body, Label, Muted, Subtitle, Title } from '@/components/typography';
import { EXAMS } from '@/data/catalog';
import { validatePastDate } from '@/domain/age';
import { appliesToAge, categoryLabel, examAgeLabel, findExam } from '@/domain/exams';
import { isoToBr } from '@/lib/format';
import { useAppData } from '@/hooks/use-app-data';
import { radius, shadows, spacing, useTheme } from '@/theme';

export default function ExamDetailScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const exam = useMemo(() => findExam(EXAMS, id), [id]);

  const { status, profile, ageYears, recordsByExam, addRecord, removeRecord, today } = useAppData();
  const [dateValue, setDateValue] = useState<DateValue>(() => dateValueFromIso(today));
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  // Só decide o redirecionamento depois de ler o armazenamento local, senão um
  // deep link ou uma recarga levariam a usuária de volta ao onboarding.
  if (status === 'loading') {
    return <LoadingScreen message="Abrindo seus registros…" />;
  }

  if (!profile) {
    return <Redirect href="/onboarding" />;
  }

  if (!exam) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Exame não encontrado' }} />
        <View
          style={[
            styles.card,
            shadows.card,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Subtitle>Exame não encontrado</Subtitle>
          <Muted>Este item não está no catálogo atual do aplicativo.</Muted>
          <Button label="Voltar para a lista" onPress={() => router.replace('/lista')} />
        </View>
      </Screen>
    );
  }

  const records = recordsByExam[exam.id] ?? [];
  const applies = appliesToAge(exam, ageYears);

  const handleSave = async () => {
    setFeedback(null);
    const validation = validatePastDate({
      day: Number(dateValue.day),
      month: Number(dateValue.month),
      year: Number(dateValue.year),
    });
    if (!validation.ok || !validation.iso) {
      setError(validation.message ?? 'Data inválida.');
      return;
    }
    setError(null);
    await addRecord(exam.id, validation.iso);
    setFeedback(`Realização registrada em ${isoToBr(validation.iso)}.`);
    setDateValue(dateValueFromIso(today));
  };

  const handleRemove = async (recordId: number) => {
    await removeRecord(recordId);
    setConfirmingId(null);
    setFeedback('Registro removido.');
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: exam.name }} />

      <LinearGradient
        colors={theme.gradients.hero}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.hero, shadows.card, { borderColor: theme.colors.border }]}
      >
        <Label style={{ color: theme.colors.primaryDark }}>{categoryLabel(exam.category)}</Label>
        <Title>{exam.name}</Title>
        <Muted>
          {examAgeLabel(exam)}
          {applies ? '' : ' · fora da sua faixa etária atual'}
        </Muted>
      </LinearGradient>

      {exam.conditional ? (
        <View
          style={[
            styles.flag,
            { backgroundColor: theme.colors.warningSoft, borderColor: theme.colors.warning },
          ]}
        >
          <Body style={{ color: theme.colors.warning, fontWeight: '700' }}>
            Depende de avaliação profissional
          </Body>
          <Muted style={{ color: theme.colors.warning }}>
            A indicação não é definida apenas pela idade. Fatores de risco, sintomas e histórico
            pessoal ou familiar precisam ser avaliados.
          </Muted>
        </View>
      ) : null}

      <View style={{ gap: spacing.sm }}>
        <Subtitle>Para que serve</Subtitle>
        <Body>{exam.purpose}</Body>
      </View>

      <View
        style={[
          styles.card,
          shadows.card,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <View style={styles.infoRow}>
          <Label>Faixa etária de referência</Label>
          <Body style={{ fontWeight: '600' }}>{examAgeLabel(exam)}</Body>
        </View>
        <View style={styles.infoRow}>
          <Label>Periodicidade</Label>
          <Body style={{ fontWeight: '600' }}>{exam.interval ?? 'Não definida'}</Body>
        </View>
      </View>

      {exam.notes ? (
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border },
          ]}
        >
          <Label>Ressalvas importantes</Label>
          <Muted>{exam.notes}</Muted>
        </View>
      ) : null}

      <View
        style={[
          styles.card,
          shadows.card,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <Label>Fonte</Label>
        <Body style={{ fontWeight: '600' }}>
          {exam.source.org}
          {exam.source.year ? ` · ${exam.source.year}` : ''}
        </Body>
        <Muted>{exam.source.title}</Muted>
        <Muted>Última revisão deste item: {isoToBr(exam.lastReviewed)}</Muted>
      </View>

      <View style={{ gap: spacing.sm }}>
        <Subtitle>Meus registros</Subtitle>
        {records.length === 0 ? (
          <Muted>Nenhuma realização registrada para este exame.</Muted>
        ) : (
          records.map((record) => (
            <View
              key={record.id}
              style={[
                styles.recordRow,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Body style={{ fontWeight: '600' }}>Realizado em {isoToBr(record.performedOn)}</Body>
                <Muted>Salvo em {isoToBr(record.createdAt.slice(0, 10))}</Muted>
              </View>
              {confirmingId === record.id ? (
                <View style={styles.confirmRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Confirmar remoção do registro de ${isoToBr(record.performedOn)}`}
                    onPress={() => void handleRemove(record.id)}
                  >
                    <Muted style={{ color: theme.colors.danger, fontWeight: '700' }}>Confirmar</Muted>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Cancelar remoção"
                    onPress={() => setConfirmingId(null)}
                  >
                    <Muted style={{ fontWeight: '700' }}>Cancelar</Muted>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remover registro de ${isoToBr(record.performedOn)}`}
                  onPress={() => setConfirmingId(record.id)}
                >
                  <Muted style={{ color: theme.colors.danger, fontWeight: '700' }}>Remover</Muted>
                </Pressable>
              )}
            </View>
          ))
        )}
      </View>

      <View
        style={[
          styles.card,
          shadows.card,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <Subtitle>{records.length === 0 ? 'Registrar realização' : 'Registrar nova realização'}</Subtitle>
        <Muted>Informe a data em que o exame foi feito. O registro fica salvo apenas neste aparelho.</Muted>
        <DateField value={dateValue} onChange={setDateValue} error={error} />
        <Button label="Salvar registro" onPress={() => void handleSave()} />
        {feedback ? (
          <Muted accessibilityLiveRegion="polite" style={{ color: theme.colors.success, fontWeight: '700' }}>
            {feedback}
          </Muted>
        ) : null}
      </View>

      <Button label="Voltar para a lista" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  flag: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, gap: spacing.xs },
  infoRow: { gap: 2 },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  confirmRow: { flexDirection: 'row', gap: spacing.md },
});
