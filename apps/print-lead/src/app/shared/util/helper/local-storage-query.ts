export function lsSetKey(key: string, value: unknown) {
  if (value) localStorage.setItem(key, JSON.stringify(value));
}

export function lsGetKey<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const value = localStorage.getItem(key);

  if (!value) return null;
  return JSON.parse(value) as T;
}

export function lsRemoveKey(key: string) {
  localStorage.removeItem(key);
}
