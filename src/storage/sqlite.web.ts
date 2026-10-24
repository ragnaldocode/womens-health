import type { StorageAdapter } from './types';

/**
 * Stub de plataforma: expo-sqlite não é usado no bundle web (o wasm do driver
 * exige configuração extra de Metro e não faz parte do alvo do MVP).
 * Metro resolve `./sqlite` para este arquivo quando platform=web, o que também
 * mantém o expo-sqlite fora do bundle do navegador.
 */
export function createSqliteStorage(): StorageAdapter {
  throw new Error('SQLite local não está disponível na versão web; use o app no celular.');
}
