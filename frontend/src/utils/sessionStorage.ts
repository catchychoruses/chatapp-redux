export function getSessionStorage<T>(key: string): T | null {
  try {
    const serializedState = sessionStorage.getItem(key);
    if (!serializedState) return null;
    return JSON.parse(serializedState);
  } catch (err) {
    return null;
  }
}
