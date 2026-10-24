import * as SQLite from 'expo-sqlite';

import type { ExamRecord, Profile, Snapshot, StorageAdapter } from './types';

const DB_NAME = 'preventiva.db';

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  birth_date TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id TEXT NOT NULL,
  performed_on TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exam_records_exam ON exam_records (exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_records_performed ON exam_records (performed_on);
`;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(SCHEMA);
      return db;
    })();
  }
  return dbPromise;
}

interface ProfileRow {
  birth_date: string;
  created_at: string;
}

interface RecordRow {
  id: number;
  exam_id: string;
  performed_on: string;
  created_at: string;
}

export function createSqliteStorage(): StorageAdapter {
  return {
    async load(): Promise<Snapshot> {
      const db = await getDb();
      const profileRow = await db.getFirstAsync<ProfileRow>(
        'SELECT birth_date, created_at FROM profile WHERE id = 1'
      );
      const rows = await db.getAllAsync<RecordRow>(
        'SELECT id, exam_id, performed_on, created_at FROM exam_records ORDER BY performed_on DESC, id DESC'
      );
      const profile: Profile | null = profileRow
        ? { birthDate: profileRow.birth_date, createdAt: profileRow.created_at }
        : null;
      return {
        profile,
        records: rows.map((row) => ({
          id: row.id,
          examId: row.exam_id,
          performedOn: row.performed_on,
          createdAt: row.created_at,
        })),
      };
    },

    async saveBirthDate(iso: string): Promise<void> {
      const db = await getDb();
      await db.runAsync(
        `INSERT INTO profile (id, birth_date, created_at) VALUES (1, ?, ?)
         ON CONFLICT(id) DO UPDATE SET birth_date = excluded.birth_date`,
        iso,
        new Date().toISOString()
      );
    },

    async addRecord(examId: string, performedOn: string): Promise<ExamRecord> {
      const db = await getDb();
      const createdAt = new Date().toISOString();
      const result = await db.runAsync(
        'INSERT INTO exam_records (exam_id, performed_on, created_at) VALUES (?, ?, ?)',
        examId,
        performedOn,
        createdAt
      );
      return { id: Number(result.lastInsertRowId), examId, performedOn, createdAt };
    },

    async removeRecord(id: number): Promise<void> {
      const db = await getDb();
      await db.runAsync('DELETE FROM exam_records WHERE id = ?', id);
    },

    async clearAll(): Promise<void> {
      const db = await getDb();
      await db.execAsync('DELETE FROM exam_records; DELETE FROM profile;');
    },
  };
}
