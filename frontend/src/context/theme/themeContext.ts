import { useStorage } from '@/hooks/useStorage';
import { createContext, useEffect } from 'react';

export type Theme = 'light' | 'dark';

const initialTheme = () => {
  const prefferedTheme = window.matchMedia('(prefers-color-scheme: dark)');

  if (prefferedTheme.matches) {
    return 'dark';
  } else {
    return 'light';
  }
};

export const useValue = () => {
  const [theme, setTheme] = useStorage<Theme>('local', 'theme', initialTheme());

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');

      document.getElementById('root')?.classList.remove('light-theme');
      document.getElementById('root')?.classList.add('dark-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');

      document.getElementById('root')?.classList.add('light-theme');
      document.getElementById('root')?.classList.remove('dark-theme');
    }
  }, [theme]);

  return { theme, setTheme };
};

export const ThemeContext = createContext({} as ReturnType<typeof useValue>);
