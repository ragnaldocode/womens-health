/** Contratos de armazenamento local. */

export interface Profile {
  /** Data de nascimento em `YYYY-MM-DD`. Guardada crua: a idade é sempre calculada. */
  birthDate: string;
  createdAt: string;
}

export interface ExamRecord {
  id: number;
  examId: string;
  /** Data em que o exame foi realizado (`YYYY-MM-DD`). */
  performedOn: string;
  createdAt: string;
}

export interface Snapshot {
  profile: Profile | null;
  records: ExamRecord[];
}

export interface StorageAdapter {
  load(): Promise<Snapshot>;
  saveBirthDate(iso: string): Promise<void>;
  addRecord(examId: string, performedOn: string): Promise<ExamRecord>;
  removeRecord(id: number): Promise<void>;
  clearAll(): Promise<void>;
}
