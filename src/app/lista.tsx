import { useMemo, useState } from 'react';
import { Redirect, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { ExamCard } from '@/components/exam-card';
import { LoadingScreen } from '@/components/loading-screen';
import { Screen } from '@/components/screen';
import { Body, Label, Muted, Title } from '@/components/typography';
import { EXAMS } from '@/data/catalog';
import {
  CATEGORIES,
  appliesToAge,
  filterExams,
  type ExamCategoryId,
} from '@/domain/exams';
import { useAppData } from '@/hooks/use-app-data';
import { radius, spacing, useTheme } from '@/theme';

export default function ListScreen() {
  const theme = useTheme();
  const { status, profile, ageYears, performedIds } = useAppData();
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<ExamCategoryId[]>([]);
  const [onlyForAge, setOnlyForAge] = useState(true);
  const [onlyPending, setOnlyPending] = useState(false);

  const filtered = useMemo(
    () =>
      filterExams(EXAMS, {
        query,
        categories,
        age: ageYears,
        onlyForAge,
        performedIds,
        onlyPending,
      }),
    [query, categories, ageYears, onlyForAge, performedIds, onlyPending]
  );

  if (status === 'loading') {
    return <LoadingScreen message="Carregando seus registros…" />;
  }

  if (!profile) {
    return <Redirect href="/onboarding" />;
  }

  const toggleCategory = (id: ExamCategoryId) => {
    setCategories((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]
    );
  };

  const clearFilters = () => {
    setQuery('');
    setCategories([]);
    setOnlyPending(false);
    setOnlyForAge(true);
  };

  return (
    <Screen>
      <View style={{ gap: spacing.xs }}>
        <Title>Exames preventivos</Title>
        <Muted>
          {onlyForAge && ageYears !== null
            ? `Mostrando recomendações para ${ageYears} anos`
            : 'Mostrando o catálogo completo'}
        </Muted>
      </View>

      <TextInput
        accessibilityLabel="Buscar exame por nome"
        placeholder="Buscar por nome ou finalidade"
        placeholderTextColor={theme.colors.textMuted}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        style={[
          styles.search,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          },
        ]}
        returnKeyType="search"
      />

      <View style={styles.toggleRow}>
        <Chip
          label="Minha faixa etária"
          selected={onlyForAge}
          onPress={() => setOnlyForAge(true)}
        />
        <Chip label="Todos os exames" selected={!onlyForAge} onPress={() => setOnlyForAge(false)} />
        <Chip
          label="Não realizados"
          selected={onlyPending}
          onPress={() => setOnlyPending((value) => !value)}
        />
      </View>

      <View style={{ gap: spacing.sm }}>
        <Label>Categorias</Label>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {CATEGORIES.map((category) => (
            <Chip
              key={category.id}
              label={category.label}
              selected={categories.includes(category.id)}
              onPress={() => toggleCategory(category.id)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.resultHeader}>
        <Body style={{ fontWeight: '600' }}>
          {filtered.length} {filtered.length === 1 ? 'exame' : 'exames'}
        </Body>
        {(query !== '' || categories.length > 0 || onlyPending || !onlyForAge) && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpar filtros"
            onPress={clearFilters}
          >
            <Muted style={{ color: theme.colors.primary, fontWeight: '700' }}>Limpar filtros</Muted>
          </Pressable>
        )}
      </View>

      {filtered.length === 0 ? (
        <View
          style={[styles.empty, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Body style={{ fontWeight: '600' }}>Nenhum exame encontrado</Body>
          <Muted>Tente outro termo de busca ou remova os filtros aplicados.</Muted>
          <Button label="Limpar filtros" variant="secondary" onPress={clearFilters} />
        </View>
      ) : (
        <View style={{ gap: spacing.md }}>
          {filtered.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              performed={performedIds.includes(exam.id)}
              applies={appliesToAge(exam, ageYears)}
              onPress={() => router.push(`/exame/${exam.id}`)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    fontSize: 15,
  },
  toggleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chipsRow: { gap: spacing.sm, paddingRight: spacing.lg },
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  empty: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
});
