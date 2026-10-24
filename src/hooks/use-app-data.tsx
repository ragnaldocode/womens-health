import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import {
  ageInYears,
  bandForAge,
  calcAge,
  parseIsoDate,
  todayParts,
  type Age,
  type AgeBand,
} from '@/domain/age';
import { getStorage, type ExamRecord, type Profile } from '@/storage';

interface AppDataValue {
  status: 'loading' | 'ready' | 'error';
  error: string | null;
  profile: Profile | null;
  records: ExamRecord[];
  performedIds: string[];
  recordsByExam: Record<string, ExamRecord[]>;
  age: Age | null;
  ageYears: number | null;
  band: AgeBand | null;
  /** Data atual (`YYYY-MM-DD`), atualizada ao voltar ao app e a cada minuto. */
  today: string;
  saveBirthDate: (iso: string) => Promise<void>;
  addRecord: (examId: string, performedOn: string) => Promise<void>;
  removeRecord: (id: number) => Promise<void>;
  resetAll: () => Promise<void>;
  reload: () => Promise<void>;
}

const AppDataContext = createContext<AppDataValue | null>(null);

function currentToday(): string {
  const parts = todayParts(new Date());
  return `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [records, setRecords] = useState<ExamRecord[]>([]);
  const [today, setToday] = useState<string>(currentToday);

  useEffect(() => {
    const tick = () => setToday(currentToday());
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });
    const interval = setInterval(tick, 60_000);
    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  const reload = useCallback(async () => {
    try {
      const storage = await getStorage();
      const snapshot = await storage.load();
      setProfile(snapshot.profile);
      setRecords(snapshot.records);
      setStatus('ready');
      setError(null);
    } catch (cause) {
      setStatus('error');
      setError(cause instanceof Error ? cause.message : 'Falha ao carregar os dados locais.');
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveBirthDate = useCallback(async (iso: string) => {
    const storage = await getStorage();
    await storage.saveBirthDate(iso);
    const snapshot = await storage.load();
    setProfile(snapshot.profile);
    setRecords(snapshot.records);
  }, []);

  const addRecord = useCallback(async (examId: string, performedOn: string) => {
    const storage = await getStorage();
    const record = await storage.addRecord(examId, performedOn);
    setRecords((previous) => [record, ...previous]);
  }, []);

  const removeRecord = useCallback(async (id: number) => {
    const storage = await getStorage();
    await storage.removeRecord(id);
    setRecords((previous) => previous.filter((record) => record.id !== id));
  }, []);

  const resetAll = useCallback(async () => {
    const storage = await getStorage();
    await storage.clearAll();
    setProfile(null);
    setRecords([]);
  }, []);

  // A idade é sempre derivada: data de nascimento + data atual. Nunca é gravada.
  const age = useMemo<Age | null>(() => {
    if (!profile) return null;
    const birth = parseIsoDate(profile.birthDate);
    const now = new Date(`${today}T12:00:00`);
    if (!birth || Number.isNaN(now.getTime())) return null;
    return calcAge(birth, todayParts(now));
  }, [profile, today]);

  const ageYears = useMemo(() => {
    if (!profile) return null;
    return ageInYears(profile.birthDate, new Date(`${today}T12:00:00`));
  }, [profile, today]);

  const band = useMemo(() => (ageYears === null ? null : bandForAge(ageYears)), [ageYears]);

  const performedIds = useMemo(
    () => Array.from(new Set(records.map((record) => record.examId))),
    [records]
  );

  const recordsByExam = useMemo(() => {
    const map: Record<string, ExamRecord[]> = {};
    for (const record of records) {
      (map[record.examId] ??= []).push(record);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => b.performedOn.localeCompare(a.performedOn));
    }
    return map;
  }, [records]);

  const value = useMemo<AppDataValue>(
    () => ({
      status,
      error,
      profile,
      records,
      performedIds,
      recordsByExam,
      age,
      ageYears,
      band,
      today,
      saveBirthDate,
      addRecord,
      removeRecord,
      resetAll,
      reload,
    }),
    [
      status,
      error,
      profile,
      records,
      performedIds,
      recordsByExam,
      age,
      ageYears,
      band,
      today,
      saveBirthDate,
      addRecord,
      removeRecord,
      resetAll,
      reload,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData precisa estar dentro de <AppDataProvider>.');
  }
  return context;
}
