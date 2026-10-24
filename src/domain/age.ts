/**
 * Cálculo de idade e faixas etárias.
 *
 * Este módulo é intencionalmente livre de React e de imports: ele roda tanto no
 * app quanto no script de verificação (`node scripts/verify-domain.mjs`), que
 * importa o .ts diretamente via type stripping do Node.
 *
 * A idade nunca é armazenada: é sempre derivada da data de nascimento e da data
 * atual, para que o filtro etário acompanhe a passagem do tempo sozinho.
 */

export interface DateParts {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
}

export interface Age {
  years: number;
  months: number;
  days: number;
}

export interface AgeBand {
  id: string;
  label: string;
  min: number;
  max: number | null;
}

/** Faixas usadas para agrupar recomendações no catálogo. */
export const AGE_BANDS: AgeBand[] = [
  { id: '09-14', label: '9 a 14 anos', min: 9, max: 14 },
  { id: '15-24', label: '15 a 24 anos', min: 15, max: 24 },
  { id: '25-39', label: '25 a 39 anos', min: 25, max: 39 },
  { id: '40-49', label: '40 a 49 anos', min: 40, max: 49 },
  { id: '50-64', label: '50 a 64 anos', min: 50, max: 64 },
  { id: '65+', label: '65 anos ou mais', min: 65, max: null },
];

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function pad(value: number, size = 2): string {
  return String(value).padStart(size, '0');
}

export function toIsoDate(parts: DateParts): string {
  return `${pad(parts.year, 4)}-${pad(parts.month)}-${pad(parts.day)}`;
}

export function parseIsoDate(value: string): DateParts | null {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

/** Data "de hoje" em horário local, no formato usado pelo app. */
export function todayParts(now: Date = new Date()): DateParts {
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

/** Data local de hoje como `YYYY-MM-DD`. */
export function todayIso(now: Date = new Date()): string {
  return toIsoDate(todayParts(now));
}

function compareTuple(a: DateParts, b: DateParts): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

/** Idade completa (anos, meses e dias) entre duas datas. */
export function calcAge(birth: DateParts, today: DateParts): Age {
  let years = today.year - birth.year;
  let months = today.month - birth.month;
  let days = today.day - birth.day;

  if (days < 0) {
    months -= 1;
    const previousMonth = today.month === 1 ? 12 : today.month - 1;
    const previousYear = today.month === 1 ? today.year - 1 : today.year;
    days += daysInMonth(previousYear, previousMonth);
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (compareTuple(today, birth) < 0) {
    return { years: 0, months: 0, days: 0 };
  }
  return { years: Math.max(0, years), months, days };
}

/** Idade em anos completos a partir de uma data ISO de nascimento. */
export function ageInYears(birthIso: string, now: Date = new Date()): number | null {
  const birth = parseIsoDate(birthIso);
  if (!birth) return null;
  return calcAge(birth, todayParts(now)).years;
}

export function formatAge(age: Age): string {
  if (age.years === 0) return `${age.months} ${age.months === 1 ? 'mês' : 'meses'}`;
  return `${age.years} ${age.years === 1 ? 'ano' : 'anos'}`;
}

/** Faixa etária correspondente; `null` quando a idade está abaixo de 9 anos. */
export function bandForAge(age: number): AgeBand | null {
  for (const band of AGE_BANDS) {
    if (age >= band.min && (band.max === null || age <= band.max)) return band;
  }
  return null;
}

export function bandById(id: string): AgeBand | null {
  return AGE_BANDS.find((band) => band.id === id) ?? null;
}

export interface BirthDateValidation {
  ok: boolean;
  message?: string;
  iso?: string;
}

/**
 * Valida uma data que não pode estar no futuro (nascimento, realização de exame).
 * Regras: data real no calendário, não futura, no máximo 120 anos atrás.
 */
export function validatePastDate(
  parts: { year?: number | null; month?: number | null; day?: number | null },
  now: Date = new Date(),
  options: { maxYearsAgo?: number; minYear?: number } = {}
): BirthDateValidation {
  const { maxYearsAgo = 120, minYear = 0 } = options;
  const { year, month, day } = parts;
  if (!year || !month || !day) {
    return { ok: false, message: 'Informe dia, mês e ano.' };
  }
  if (year < minYear) {
    return { ok: false, message: 'Verifique o ano informado.' };
  }
  if (month < 1 || month > 12) {
    return { ok: false, message: 'Mês deve estar entre 1 e 12.' };
  }
  if (day < 1 || day > daysInMonth(year, month)) {
    return { ok: false, message: 'Dia inválido para o mês informado.' };
  }
  const candidate: DateParts = { year, month, day };
  const today = todayParts(now);
  if (compareTuple(candidate, today) > 0) {
    return { ok: false, message: 'A data não pode estar no futuro.' };
  }
  if (calcAge(candidate, today).years > maxYearsAgo) {
    return { ok: false, message: 'Verifique o ano informado.' };
  }
  return { ok: true, iso: toIsoDate(candidate) };
}

/** Data de nascimento: mesma validação, com piso no ano de 1900. */
export function validateBirthDate(
  parts: { year?: number | null; month?: number | null; day?: number | null },
  now: Date = new Date()
): BirthDateValidation {
  return validatePastDate(parts, now, { maxYearsAgo: 120, minYear: 1900 });
}
