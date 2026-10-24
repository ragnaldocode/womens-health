/**
 * Verificação da lógica de domínio, sem framework de teste.
 *
 * Roda direto no Node (>=22.18), importando os .ts por type stripping:
 *   npm run verify
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  AGE_BANDS,
  ageInYears,
  bandForAge,
  calcAge,
  parseIsoDate,
  toIsoDate,
  todayParts,
  validateBirthDate,
  validatePastDate,
} from '../src/domain/age.ts';
import {
  CATEGORIES,
  CONTENT_STATUS,
  appliesToAge,
  examAgeLabel,
  filterExams,
  normalize,
  parseCatalog,
  recommendations,
  searchExams,
  sortExams,
  summarize,
} from '../src/domain/exams.ts';

const here = dirname(fileURLToPath(import.meta.url));
const catalogPath = join(here, '..', 'src', 'data', 'exams.json');

let passed = 0;
const failures = [];

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    return;
  }
  failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
}

function eq(name, actual, expected) {
  check(name, Object.is(actual, expected), `esperado ${JSON.stringify(expected)}, recebido ${JSON.stringify(actual)}`);
}

const d = (iso) => parseIsoDate(iso);
const now = (iso) => new Date(`${iso}T12:00:00`);

// ---------------------------------------------------------------- idade exata
{
  const age = calcAge(d('1996-05-10'), d('2026-10-24'));
  eq('idade: anos completos', age.years, 30);
  eq('idade: meses', age.months, 5);
  eq('idade: dias', age.days, 14);

  eq('idade: véspera do aniversário não conta o ano', calcAge(d('2000-10-25'), d('2026-10-24')).years, 25);
  eq('idade: no dia do aniversário conta o ano', calcAge(d('2000-10-24'), d('2026-10-24')).years, 26);

  const crossMonth = calcAge(d('1990-12-31'), d('2026-01-01'));
  eq('idade: virada de ano', crossMonth.years, 35);
  eq('idade: virada de ano (meses)', crossMonth.months, 0);

  // 29 de fevereiro: comportamento documentado (completa em 28/02 nos anos não bissextos)
  eq('idade: nascimento em 29/02', calcAge(d('2000-02-29'), d('2026-02-28')).years, 25);

  eq(
    'idade: data de nascimento no futuro devolve zero',
    calcAge(d('2030-01-01'), d('2026-10-24')).years,
    0
  );
}

// ------------------------------------------------------------ idade automática
{
  eq('idade automática: 31/12 ainda tem 35', ageInYears('1990-12-31', now('2026-12-30')), 35);
  eq('idade automática: 31/12 passa a ter 36', ageInYears('1990-12-31', now('2026-12-31')), 36);
  eq('idade automática: data inválida devolve null', ageInYears('31/12/1990', now('2026-12-31')), null);
  eq(
    'idade automática: recalcula ao longo do tempo',
    [ageInYears('2000-06-15', now('2026-06-14')), ageInYears('2000-06-15', now('2027-06-15'))].join('→'),
    '25→27'
  );
}

// ----------------------------------------------------------------- faixas
{
  eq('faixa: 8 anos fora do catálogo', bandForAge(8), null);
  eq('faixa: 12 anos', bandForAge(12)?.id, '09-14');
  eq('faixa: 25 anos', bandForAge(25)?.id, '25-39');
  eq('faixa: 39 anos', bandForAge(39)?.id, '25-39');
  eq('faixa: 40 anos', bandForAge(40)?.id, '40-49');
  eq('faixa: 64 anos', bandForAge(64)?.id, '50-64');
  eq('faixa: 65 anos', bandForAge(65)?.id, '65+');
  eq('faixa: 90 anos', bandForAge(90)?.id, '65+');

  let contiguous = true;
  for (let index = 1; index < AGE_BANDS.length; index += 1) {
    const previous = AGE_BANDS[index - 1];
    const current = AGE_BANDS[index];
    if (previous.max === null || current.min !== previous.max + 1) contiguous = false;
  }
  check('faixas: sem lacunas nem sobreposição', contiguous);
  eq('faixas: limites por bandForAge e min/max', bandForAge(AGE_BANDS[2].min)?.id, AGE_BANDS[2].id);
}

// -------------------------------------------------------------- validação
{
  eq('validação: data futura rejeitada', validateBirthDate({ day: 1, month: 1, year: 2030 }, now('2026-10-24')).ok, false);
  eq('validação: 31/02 rejeitado', validateBirthDate({ day: 31, month: 2, year: 1990 }, now('2026-10-24')).ok, false);
  eq('validação: mês 13 rejeitado', validateBirthDate({ day: 1, month: 13, year: 1990 }, now('2026-10-24')).ok, false);
  eq('validação: ano 1899 rejeitado', validateBirthDate({ day: 1, month: 1, year: 1899 }, now('2026-10-24')).ok, false);
  eq('validação: campos vazios rejeitados', validateBirthDate({ day: null, month: null, year: null }, now('2026-10-24')).ok, false);
  eq(
    'validação: data válida normaliza para ISO',
    validateBirthDate({ day: 5, month: 3, year: 1990 }, now('2026-10-24')).iso,
    '1990-03-05'
  );
  eq(
    'validação: 29/02 em ano bissexto aceito',
    validateBirthDate({ day: 29, month: 2, year: 2000 }, now('2026-10-24')).ok,
    true
  );
  eq('validação: realização de exame não aceita futuro', validatePastDate({ day: 25, month: 10, year: 2026 }, now('2026-10-24')).ok, false);
  eq('validação: realização de exame aceita hoje', validatePastDate({ day: 24, month: 10, year: 2026 }, now('2026-10-24')).ok, true);
  eq('util: toIsoDate com zero à esquerda', toIsoDate({ year: 2026, month: 1, day: 4 }), '2026-01-04');
  eq('util: todayParts devolve data local', todayParts(now('2026-10-24')).month, 10);
}

// ------------------------------------------------------------------ catálogo
const rawCatalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const catalog = parseCatalog(rawCatalog);
const { exams } = catalog;
{
  check('catálogo: tem pelo menos 15 exames', exams.length >= 15, `recebido ${exams.length}`);
  eq('catálogo: sem ids duplicados', new Set(exams.map((exam) => exam.id)).size, exams.length);
  eq('catálogo: status de conteúdo declarado', catalog.contentStatus, CONTENT_STATUS);
  check('catálogo: última revisão em ISO', /^\d{4}-\d{2}-\d{2}$/.test(catalog.lastReviewed));
  check('catálogo: disclaimer presente', catalog.disclaimer.length > 40);

  const knownCategories = new Set(CATEGORIES.map((category) => category.id));
  check(
    'catálogo: todas as categorias são conhecidas',
    exams.every((exam) => knownCategories.has(exam.category))
  );
  check(
    'catálogo: todas as categorias são usadas',
    CATEGORIES.every((category) => exams.some((exam) => exam.category === category.id)),
    CATEGORIES.filter((category) => !exams.some((exam) => exam.category === category.id))
      .map((category) => category.id)
      .join(', ')
  );
  check(
    'catálogo: faixas etárias coerentes',
    exams.every((exam) => exam.ageMin === null || exam.ageMax === null || exam.ageMin <= exam.ageMax)
  );
  check(
    'catálogo: todo exame tem idade de referência',
    exams.every((exam) => exam.ageMin !== null || exam.ageMax !== null)
  );
  check(
    'catálogo: toda fonte tem organização e título',
    exams.every((exam) => exam.source.org.length > 2 && exam.source.title.length > 5)
  );
  check(
    'catálogo: periodicidade em texto quando há intervalo em meses',
    exams.every((exam) => exam.intervalMonths === null || (exam.interval ?? '').length > 3)
  );
  check(
    'catálogo: finalidade em linguagem simples (tamanho mínimo)',
    exams.every((exam) => exam.purpose.length > 30)
  );
  check(
    'catálogo: todo exame é elegível em alguma faixa etária',
    exams.every((exam) => {
      const candidateAges = [10, 12, 20, 30, 45, 55, 70, 80];
      return candidateAges.some((age) => appliesToAge(exam, age));
    })
  );

  let rejectedBadCatalog = false;
  try {
    parseCatalog({ exams: [{ id: 'x', name: 'X', category: 'nao-existe', purpose: 'p', source: { org: 'o', title: 't' }, lastReviewed: '2026-01-01', ageMin: null, ageMax: null, interval: null, intervalMonths: null, conditional: false, notes: null }] });
  } catch {
    rejectedBadCatalog = true;
  }
  check('catálogo: categoria inválida é rejeitada', rejectedBadCatalog);

  let rejectedDuplicate = false;
  try {
    parseCatalog({ exams: [rawCatalog.exams[0], rawCatalog.exams[0]] });
  } catch {
    rejectedDuplicate = true;
  }
  check('catálogo: id duplicado é rejeitado', rejectedDuplicate);
}

// -------------------------------------------------------------- busca/filtro
{
  eq('busca: normaliza acentos', normalize('Papanicolau Íntimo'), 'papanicolau intimo');
  check('busca: ignora maiúsculas', searchExams(exams, 'MAMOGRAFIA').some((exam) => exam.id === 'mamografia'));
  check('busca: encontra por finalidade', searchExams(exams, 'colo do útero').length >= 1);
  eq('busca: termo vazio devolve tudo', searchExams(exams, '   ').length, exams.length);
  eq('busca: termo inexistente devolve nada', searchExams(exams, 'zzzzz').length, 0);

  const forAge30 = filterExams(exams, { age: 30, onlyForAge: true });
  check(
    'filtro: 30 anos inclui Papanicolau',
    forAge30.some((exam) => exam.id === 'papanicolau')
  );
  check(
    'filtro: 30 anos exclui mamografia (50+)',
    !forAge30.some((exam) => exam.id === 'mamografia')
  );
  check(
    'filtro: 30 anos exclui vacina HPV (até 14)',
    !forAge30.some((exam) => exam.id === 'vacina-hpv')
  );

  const forAge60 = filterExams(exams, { age: 60, onlyForAge: true });
  check('filtro: 60 anos inclui mamografia', forAge60.some((exam) => exam.id === 'mamografia'));
  check(
    'filtro: 60 anos exclui densitometria (65+, condicional entre 50 e 64)',
    !forAge60.some((exam) => exam.id === 'densitometria-ossea')
  );
  check('filtro: 60 anos ainda inclui citologia (até 64)', forAge60.some((exam) => exam.id === 'papanicolau'));

  const forAge70 = filterExams(exams, { age: 70, onlyForAge: true });
  check('filtro: 70 anos exclui citologia', !forAge70.some((exam) => exam.id === 'papanicolau'));
  check('filtro: 70 anos exclui mamografia', !forAge70.some((exam) => exam.id === 'mamografia'));

  const forAge12 = filterExams(exams, { age: 12, onlyForAge: true });
  eq('filtro: 12 anos só a vacina', forAge12.map((exam) => exam.id).join(','), 'vacina-hpv');

  const byCategory = filterExams(exams, { categories: ['rastreamento'] });
  check(
    'filtro: por categoria',
    byCategory.length >= 3 && byCategory.every((exam) => exam.category === 'rastreamento')
  );

  const combined = filterExams(exams, { categories: ['rastreamento'], age: 30, onlyForAge: true });
  check(
    'filtro: categoria + idade combinados',
    combined.every((exam) => exam.category === 'rastreamento' && appliesToAge(exam, 30))
  );

  const onlyPending = filterExams(exams, { performedIds: ['mamografia'], onlyPending: true });
  check('filtro: pendentes exclui realizados', !onlyPending.some((exam) => exam.id === 'mamografia'));

  const sorted = sortExams(exams, 60);
  check('ordenação: elegíveis primeiro', appliesToAge(sorted[0], 60));
  check(
    'ordenação: não muta a lista original',
    exams[0].id === rawCatalog.exams[0].id
  );
}

// --------------------------------------------------------------- resumo/home
{
  const summary = summarize(exams, ['papanicolau', 'fora-do-catalogo'], 30);
  eq('resumo: total do catálogo', summary.total, exams.length);
  eq('resumo: realizados válidos ignoram id desconhecido', summary.performed, 1);
  eq('resumo: realizados na faixa', summary.performedApplicable, 1);
  eq(
    'resumo: aplicáveis = total - fora da faixa',
    summary.applicable,
    exams.filter((exam) => appliesToAge(exam, 30)).length
  );
  eq('resumo: pendentes na faixa', summary.pendingApplicable, summary.applicable - 1);
  check('resumo: percentual entre 0 e 100', summary.percentComplete >= 0 && summary.percentComplete <= 100);
  eq('resumo: sem data de nascimento aplica tudo', summarize(exams, [], null).applicable, exams.length);

  const recs = recommendations(exams, ['papanicolau'], 30, 3);
  eq('recomendações: respeitam o limite', recs.length, 3);
  check('recomendações: excluem já realizados', !recs.some((exam) => exam.id === 'papanicolau'));
  check('recomendações: respeitam a idade', recs.every((exam) => appliesToAge(exam, 30)));

  const allDone = recommendations(exams, exams.map((exam) => exam.id), 30, 3);
  eq('recomendações: nenhuma quando tudo realizado', allDone.length, 0);

  const recs34 = recommendations(exams, [], 34, 3);
  check(
    'recomendações: rotina antes dos condicionais',
    recs34.every((exam) => !exam.conditional) && recs34.length === 3,
    recs34.map((exam) => `${exam.id}${exam.conditional ? '(cond)' : ''}`).join(', ')
  );
  check(
    'recomendações: pré-natal não aparece na tela inicial de quem não é gestante',
    !recs34.some((exam) => exam.id === 'pre-natal')
  );

  eq('rótulo: faixa aberta acima', examAgeLabel({ ageMin: 65, ageMax: null }), 'A partir de 65 anos');
  eq('rótulo: faixa aberta abaixo', examAgeLabel({ ageMin: null, ageMax: 14 }), 'Até 14 anos');
  eq('rótulo: faixa fechada', examAgeLabel({ ageMin: 50, ageMax: 69 }), '50 a 69 anos');
  eq('rótulo: sem faixa', examAgeLabel({ ageMin: null, ageMax: null }), 'Sem faixa etária definida');
  eq('rótulo: exame condicional tem ressalva', exams.filter((exam) => exam.conditional).every((exam) => (exam.notes ?? '').length > 20), true);
}

// ---------------------------------------------------------------------- saída
const total = passed + failures.length;
if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} de ${total} verificações falharam:\n`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`✓ ${passed}/${total} verificações de domínio passaram`);
console.log(`  catálogo: ${exams.length} exames, ${CATEGORIES.length} categorias, revisão ${catalog.lastReviewed}`);
