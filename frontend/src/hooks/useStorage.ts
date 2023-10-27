import { useState } from 'react';

export function useStorage<T>(
  type: 'local' | 'session' = 'local',
  key: string,
  initialValue: T
) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item =
        type === 'local'
          ? window.localStorage.getItem(key)
          : window.sessionStorage.getItem(key);

      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        type === 'local'
          ? window.localStorage.setItem(key, JSON.stringify(valueToStore))
          : window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}
