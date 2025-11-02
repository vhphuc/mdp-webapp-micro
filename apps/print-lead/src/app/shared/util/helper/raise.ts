export function raise(message?: string): never {
  throw new Error(message ?? 'Variable is undefined or null');
}
