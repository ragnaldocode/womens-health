import { useRef, type ComponentRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { radius, spacing, useTheme } from '@/theme';
import { Label, Muted } from './typography';

export interface DateValue {
  day: string;
  month: string;
  year: string;
}

export const EMPTY_DATE: DateValue = { day: '', month: '', year: '' };

interface DateFieldProps {
  value: DateValue;
  onChange: (next: DateValue) => void;
  error?: string | null;
  disabled?: boolean;
}

/**
 * Entrada de data em três campos (dia, mês, ano).
 * Evita dependência de seletor nativo e funciona igual em iOS, Android e web.
 */
export function DateField({ value, onChange, error, disabled = false }: DateFieldProps) {
  const theme = useTheme();
  const monthRef = useRef<ComponentRef<typeof TextInput>>(null);
  const yearRef = useRef<ComponentRef<typeof TextInput>>(null);

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.colors.surface,
      borderColor: error ? theme.colors.danger : theme.colors.border,
      color: theme.colors.text,
    },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View style={styles.small}>
          <Label>Dia</Label>
          <TextInput
            accessibilityLabel="Dia de nascimento"
            value={value.day}
            onChangeText={(text) => {
              const digits = text.replace(/\D/g, '').slice(0, 2);
              onChange({ ...value, day: digits });
              if (digits.length === 2) monthRef.current?.focus();
            }}
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={2}
            placeholder="DD"
            placeholderTextColor={theme.colors.textMuted}
            editable={!disabled}
            style={inputStyle}
            returnKeyType="next"
          />
        </View>
        <View style={styles.small}>
          <Label>Mês</Label>
          <TextInput
            ref={monthRef}
            accessibilityLabel="Mês de nascimento"
            value={value.month}
            onChangeText={(text) => {
              const digits = text.replace(/\D/g, '').slice(0, 2);
              onChange({ ...value, month: digits });
              if (digits.length === 2) yearRef.current?.focus();
            }}
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={2}
            placeholder="MM"
            placeholderTextColor={theme.colors.textMuted}
            editable={!disabled}
            style={inputStyle}
            returnKeyType="next"
          />
        </View>
        <View style={styles.large}>
          <Label>Ano</Label>
          <TextInput
            ref={yearRef}
            accessibilityLabel="Ano de nascimento"
            value={value.year}
            onChangeText={(text) => {
              const digits = text.replace(/\D/g, '').slice(0, 4);
              onChange({ ...value, year: digits });
            }}
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={4}
            placeholder="AAAA"
            placeholderTextColor={theme.colors.textMuted}
            editable={!disabled}
            style={inputStyle}
            returnKeyType="done"
          />
        </View>
      </View>
      {error ? (
        <Muted accessibilityLiveRegion="polite" style={{ color: theme.colors.danger }}>
          {error}
        </Muted>
      ) : null}
    </View>
  );
}

export function dateValueFromIso(iso: string | null | undefined): DateValue {
  if (!iso) return EMPTY_DATE;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return EMPTY_DATE;
  return { day: match[3], month: match[2], year: match[1] };
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  small: { flex: 1, gap: spacing.xs },
  large: { flex: 1.4, gap: spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
});
