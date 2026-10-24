import examsFile from '@/data/exams.json';
import { parseCatalog } from '@/domain/exams';

/**
 * Catálogo embutido no app (JSON) — separado dos dados pessoais, que ficam
 * apenas no armazenamento local do dispositivo.
 */
export const CATALOG = parseCatalog(examsFile);
export const EXAMS = CATALOG.exams;
