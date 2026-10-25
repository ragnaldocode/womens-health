import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/brand';
import { Button } from '@/components/button';
import { DateField, dateValueFromIso, type DateValue } from '@/components/date-field';
import { LoadingScreen } from '@/components/loading-screen';
import { Screen } from '@/components/screen';
import { Body, Label, Muted, Title } from '@/components/typography';
import { ageInYears, bandForAge, validateBirthDate } from '@/domain/age';
import { useAppData } from '@/hooks/use-app-data';
import { radius, spacing, useTheme } from '@/theme';

export default function OnboardingScreen() {
  const { status, profile } = useAppData();

  // Espera a leitura do armazenamento para não montar o formulário vazio quando
  // já existe data salva (deep link ou recarga direto nesta rota).
  if (status === 'loading') {
    return <LoadingScreen message="Carregando…" />;
  }
  return <OnboardingForm key={profile?.birthDate ?? 'novo'} />;
}

function OnboardingForm() {
  const theme = useTheme();
  const { profile, saveBirthDate } = useAppData();
  const editing = profile !== null;

  const [value, setValue] = useState<DateValue>(() => dateValueFromIso(profile?.birthDate));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /** Prévia da idade calculada, para a usuária conferir a data digitada. */
  const preview = useMemo(() => {
    const validation = validateBirthDate({
      day: Number(value.day),
      month: Number(value.month),
      year: Number(value.year),
    });
    if (!validation.ok || !validation.iso) return null;
    const years = ageInYears(validation.iso);
    if (years === null) return null;
    return { years, band: bandForAge(years) };
  }, [value]);

  const handleSave = async () => {
    const validation = validateBirthDate({
      day: Number(value.day),
      month: Number(value.month),
      year: Number(value.year),
    });
    if (!validation.ok || !validation.iso) {
      setError(validation.message ?? 'Data inválida.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await saveBirthDate(validation.iso);
      router.replace('/');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <BrandMark withWordmark size={38} />
        <View style={{ gap: spacing.xs }}>
          <Label>{editing ? 'Seus dados' : 'Primeiro acesso'}</Label>
          <Title>{editing ? 'Alterar data de nascimento' : 'Vamos começar'}</Title>
        </View>
      </View>

      <Body style={{ color: theme.colors.textMuted }}>
        {editing
          ? 'Sua idade é recalculada a partir da data de nascimento sempre que o app é aberto. Ajuste a data se estiver incorreta.'
          : 'Precisamos apenas da sua data de nascimento. Com ela, calculamos sua idade e mostramos os exames preventivos recomendados para a sua faixa etária.'}
      </Body>

      <DateField value={value} onChange={setValue} error={error} disabled={saving} />

      {preview ? (
        <LinearGradient
          colors={theme.gradients.blush}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.preview, { borderColor: theme.colors.border }]}
          accessibilityLiveRegion="polite"
        >
          <Body style={{ color: theme.colors.primaryDark, fontWeight: '700' }}>
            Idade hoje: {preview.years} {preview.years === 1 ? 'ano' : 'anos'}
            {preview.band ? ` · faixa ${preview.band.label.replace(/ anos?$/, '')}` : ''}
          </Body>
          <Muted style={{ color: theme.colors.primaryDark }}>
            A idade é recalculada automaticamente com o passar do tempo — você não precisa
            atualizá-la.
          </Muted>
        </LinearGradient>
      ) : null}

      <Button
        label={saving ? 'Salvando…' : editing ? 'Salvar alteração' : 'Continuar'}
        onPress={() => void handleSave()}
        disabled={saving}
      />

      {editing ? (
        <Button label="Cancelar" variant="secondary" onPress={() => router.back()} />
      ) : null}

      <View
        style={[styles.note, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      >
        <Label>Privacidade</Label>
        <Muted>
          A data de nascimento fica salva apenas neste aparelho. Não há cadastro, login, envio de
          dados para servidores nem necessidade de internet. Desinstalar o app apaga os registros.
        </Muted>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.lg },
  preview: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, gap: spacing.xs },
  note: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.xs },
});
