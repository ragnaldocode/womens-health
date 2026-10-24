import type { ExamRecord, Snapshot, StorageAdapter } from './types';

/**
 * Fallback para web (usado apenas na verificação em navegador; o app mobile
 * usa SQLite). Mantém os mesmos contratos do adaptador nativo.
 */

const PROFILE_KEY = 'preventiva.profile';
const RECORDS_KEY = 'preventiva.records';

function readRecords(): ExamRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ExamRecord[];
  } catch {
    return [];
  }
}

function writeRecords(records: ExamRecord[]): void {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function createWebStorage(): StorageAdapter {
  return {
    async load(): Promise<Snapshot> {
      const rawProfile = localStorage.getItem(PROFILE_KEY);
      let profile: Snapshot['profile'] = null;
      if (rawProfile) {
        try {
          profile = JSON.parse(rawProfile) as Snapshot['profile'];
        } catch {
          profile = null;
        }
      }
      return { profile, records: readRecords() };
    },

    async saveBirthDate(iso: string): Promise<void> {
      const raw = localStorage.getItem(PROFILE_KEY);
      let createdAt = new Date().toISOString();
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { createdAt?: string };
          if (parsed.createdAt) createdAt = parsed.createdAt;
        } catch {
          // ignora conteúdo inválido e regrava
        }
      }
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ birthDate: iso, createdAt }));
    },

    async addRecord(examId: string, performedOn: string): Promise<ExamRecord> {
      const records = readRecords();
      const nextId = records.reduce((max, record) => Math.max(max, record.id), 0) + 1;
      const record: ExamRecord = {
        id: nextId,
        examId,
        performedOn,
        createdAt: new Date().toISOString(),
      };
      writeRecords([record, ...records]);
      return record;
    },

    async removeRecord(id: number): Promise<void> {
      writeRecords(readRecords().filter((record) => record.id !== id));
    },

    async clearAll(): Promise<void> {
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(RECORDS_KEY);
    },
  };
}
