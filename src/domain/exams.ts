/**
 * Catálogo de exames preventivos: tipos, validação, busca e filtros.
 *
 * Módulo puro (sem React, sem imports) para poder ser exercitado diretamente
 * pelo script de verificação. Toda função recebe o catálogo como argumento.
 */

export type ExamCategoryId =
  | 'avaliacao-clinica'
  | 'rastreamento'
  | 'prevencao'
  | 'cardiovascular'
  | 'metabolico'
  | 'ossos'
  | 'ists'
  | 'mental'
  | 'bucal'
  | 'gestacao';

export interface ExamCategory {
  id: ExamCategoryId;
  label: string;
}

export const CATEGORIES: ExamCategory[] = [
  { id: 'rastreamento', label: 'Rastreamento de câncer' },
  { id: 'avaliacao-clinica', label: 'Avaliação clínica' },
  { id: 'prevencao', label: 'Prevenção e vacinas' },
  { id: 'cardiovascular', label: 'Saúde cardiovascular' },
  { id: 'metabolico', label: 'Saúde metabólica' },
  { id: 'ossos', label: 'Saúde óssea' },
  { id: 'ists', label: 'ISTs' },
  { id: 'mental', label: 'Saúde mental' },
  { id: 'gestacao', label: 'Gestação' },
  { id: 'bucal', label: 'Saúde bucal' },
];

export interface ExamSource {
  org: string;
  title: string;
  year?: number;
}

export interface Exam {
  id: string;
  name: string;
  category: ExamCategoryId;
  /** Finalidade do exame, em linguagem simples. */
  purpose: string;
  /** Idade mínima de referência (anos completos), quando aplicável. */
  ageMin: number | null;
  /** Idade máxima de referência (anos completos), quando aplicável. */
  ageMax: number | null;
  /** Periodicidade de referência, em texto. */
  interval: string | null;
  /** Periodicidade em meses, quando houver um intervalo fixo. */
  intervalMonths: number | null;
  /**
   * `true` quando a indicação depende de fatores de risco, sintomas, histórico
   * pessoal/familiar ou avaliação profissional — a idade sozinha não decide.
   */
  conditional: boolean;
  /** Condições, limitações e ressalvas relevantes. */
  notes: string | null;
  source: ExamSource;
  /** Data da última revisão do conteúdo deste item. */
  lastReviewed: string;
}

export const CONTENT_STATUS = 'pendente_de_validacao_clinica';

export interface CatalogFile {
  version: number;
  contentStatus: string;
  lastReviewed: string;
  disclaimer: string;
  exams: Exam[];
}

 export interface ParsedCatalog {
  exams: Exam[];
  version: number;
  contentStatus: string;
  lastReviewed: string;
  disclaimer: string;
}

const KNOWN_CATEGORIES = new Set<string>(CATEGORIES.map((category) => category.id));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, field: string, id: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Exame "${id}": campo "${field}" deve ser texto não vazio.`);
  }
  return value;
}

function optionalString(value: unknown, field: string, id: string): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') {
    throw new Error(`Exame "${id}": campo "${field}" deve ser texto ou nulo.`);
  }
  return value;
}

function optionalNumber(value: unknown, field: string, id: string): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Exame "${id}": campo "${field}" deve ser número ou nulo.`);
  }
  return value;
}

/**
 * Valida o arquivo do catálogo e devolve os exames normalizados.
 * Falha com mensagem explícita em vez de aceitar dados incompletos.
 */
export function parseCatalog(raw: unknown): ParsedCatalog {
  if (!isRecord(raw)) throw new Error('Catálogo inválido: esperado um objeto.');
  const examsRaw = raw.exams;
  if (!Array.isArray(examsRaw) || examsRaw.length === 0) {
    throw new Error('Catálogo inválido: "exams" deve ser uma lista não vazia.');
  }

  const seen = new Set<string>();
  const exams: Exam[] = examsRaw.map((item) => {
    if (!isRecord(item)) throw new Error('Catálogo inválido: cada exame deve ser um objeto.');
    const id = requireString(item.id, 'id', '(sem id)');
    if (seen.has(id)) throw new Error(`Catálogo inválido: id duplicado "${id}".`);
    seen.add(id);

    const category = requireString(item.category, 'category', id);
    if (!KNOWN_CATEGORIES.has(category)) {
      throw new Error(`Exame "${id}": categoria desconhecida "${category}".`);
    }

    const ageMin = optionalNumber(item.ageMin, 'ageMin', id);
    const ageMax = optionalNumber(item.ageMax, 'ageMax', id);
    if (ageMin !== null && ageMax !== null && ageMin > ageMax) {
      throw new Error(`Exame "${id}": ageMin maior que ageMax.`);
    }
    if (ageMin !== null && (ageMin < 0 || ageMin > 120)) {
      throw new Error(`Exame "${id}": ageMin fora do intervalo aceitável.`);
    }
    if (ageMax !== null && (ageMax < 0 || ageMax > 120)) {
      throw new Error(`Exame "${id}": ageMax fora do intervalo aceitável.`);
    }

    const source = item.source;
    if (!isRecord(source)) throw new Error(`Exame "${id}": "source" ausente.`);

    return {
      id,
      name: requireString(item.name, 'name', id),
      category: category as ExamCategoryId,
      purpose: requireString(item.purpose, 'purpose', id),
      ageMin,
      ageMax,
      interval: optionalString(item.interval, 'interval', id),
      intervalMonths: optionalNumber(item.intervalMonths, 'intervalMonths', id),
      conditional: item.conditional === true,
      notes: optionalString(item.notes, 'notes', id),
      source: {
        org: requireString(source.org, 'source.org', id),
        title: requireString(source.title, 'source.title', id),
        year: optionalNumber(source.year, 'source.year', id) ?? undefined,
      },
      lastReviewed: requireString(item.lastReviewed, 'lastReviewed', id),
    };
  });

  return {
    exams,
    version: typeof raw.version === 'number' ? raw.version : 1,
    contentStatus: typeof raw.contentStatus === 'string' ? raw.contentStatus : CONTENT_STATUS,
    lastReviewed: typeof raw.lastReviewed === 'string' ? raw.lastReviewed : '',
    disclaimer: typeof raw.disclaimer === 'string' ? raw.disclaimer : '',
  };
}

/** Minúsculas e sem acentos, para busca tolerante. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function categoryLabel(id: ExamCategoryId): string {
  return CATEGORIES.find((category) => category.id === id)?.label ?? id;
}

export function examAgeLabel(exam: Exam): string {
  const { ageMin, ageMax } = exam;
  if (ageMin === null && ageMax === null) return 'Sem faixa etária definida';
  if (ageMin !== null && ageMax === null) return `A partir de ${ageMin} anos`;
  if (ageMin === null && ageMax !== null) return `Até ${ageMax} anos`;
  return `${ageMin} a ${ageMax} anos`;
}

/** O exame é elegível para a idade informada? */
export function appliesToAge(exam: Exam, age: number | null): boolean {
  if (age === null) return true;
  if (exam.ageMin !== null && age < exam.ageMin) return false;
  if (exam.ageMax !== null && age > exam.ageMax) return false;
  return true;
}

export function searchExams(exams: Exam[], query: string): Exam[] {
  const term = normalize(query);
  if (term === '') return exams;
  return exams.filter((exam) => {
    const haystack = normalize(
      [exam.name, exam.purpose, categoryLabel(exam.category), exam.notes ?? ''].join(' ')
    );
    return haystack.includes(term);
  });
}

export interface FilterOptions {
  query?: string;
  categories?: ExamCategoryId[];
  age?: number | null;
  onlyForAge?: boolean;
  performedIds?: string[];
  onlyPending?: boolean;
}

export function filterExams(exams: Exam[], options: FilterOptions = {}): Exam[] {
  const { query = '', categories = [], age = null, onlyForAge = false } = options;
  const performed = new Set(options.performedIds ?? []);

  let result = searchExams(exams, query);
  if (categories.length > 0) {
    result = result.filter((exam) => categories.includes(exam.category));
  }
  if (onlyForAge) {
    result = result.filter((exam) => appliesToAge(exam, age));
  }
  if (options.onlyPending) {
    result = result.filter((exam) => !performed.has(exam.id));
  }
  return sortExams(result, age);
}

/** Ordena por relevância para a idade: elegíveis primeiro, depois por nome. */
export function sortExams(exams: Exam[], age: number | null): Exam[] {
  return [...exams].sort((a, b) => {
    const aFits = appliesToAge(a, age) ? 0 : 1;
    const bFits = appliesToAge(b, age) ? 0 : 1;
    if (aFits !== bFits) return aFits - bFits;
    return a.name.localeCompare(b.name, 'pt-BR');
  });
}

export interface Summary {
  total: number;
  applicable: number;
  performed: number;
  performedApplicable: number;
  pending: number;
  pendingApplicable: number;
  percentComplete: number;
}

/**
 * Resumo do catálogo considerando a idade e as marcações.
 * `applicable` conta só o que se aplica à faixa etária da usuária.
 */
export function summarize(exams: Exam[], performedIds: string[], age: number | null): Summary {
  const performed = new Set(performedIds);
  const applicable = exams.filter((exam) => appliesToAge(exam, age));
  const performedApplicable = applicable.filter((exam) => performed.has(exam.id));
  const performedTotal = exams.filter((exam) => performed.has(exam.id));
  return {
    total: exams.length,
    applicable: applicable.length,
    performed: performedTotal.length,
    performedApplicable: performedApplicable.length,
    pending: exams.length - performedTotal.length,
    pendingApplicable: applicable.length - performedApplicable.length,
    percentComplete:
      applicable.length === 0 ? 0 : Math.round((performedApplicable.length / applicable.length) * 100),
  };
}

/**
 * Próximos exames recomendados para a idade, ainda não realizados.
 * Itens que dependem de avaliação (ex.: pré-natal, densitometria por risco)
 * ficam depois dos exames de rotina, para não dominar a tela inicial.
 */
export function recommendations(exams: Exam[], performedIds: string[], age: number | null, limit = 4): Exam[] {
  const performed = new Set(performedIds);
  return exams
    .filter((exam) => appliesToAge(exam, age) && !performed.has(exam.id))
    .sort(
      (a, b) =>
        Number(a.conditional) - Number(b.conditional) || a.name.localeCompare(b.name, 'pt-BR')
    )
    .slice(0, limit);
}

export function findExam(exams: Exam[], id: string): Exam | null {
  return exams.find((exam) => exam.id === id) ?? null;
}
