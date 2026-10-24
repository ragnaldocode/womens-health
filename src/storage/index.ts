import { Platform } from 'react-native';

import type { StorageAdapter } from './types';

export type { ExamRecord, Profile, Snapshot, StorageAdapter } from './types';

let adapterPromise: Promise<StorageAdapter> | null = null;

/**
 * Escolhe o adaptador uma única vez.
 * - mobile: SQLite (expo-sqlite), dados no dispositivo;
 * - web: localStorage, apenas para desenvolvimento/verificação no navegador.
 */
export function getStorage(): Promise<StorageAdapter> {
  if (!adapterPromise) {
    adapterPromise = (async () => {
      if (Platform.OS === 'web') {
        const module = await import('./web');
        return module.createWebStorage();
      }
      const module = await import('./sqlite');
      return module.createSqliteStorage();
    })();
  }
  return adapterPromise;
}
