import { ThemeContext } from '@/context/theme/themeContext';
import clsx from 'clsx';
import { useContext } from 'react';
import styles from './ThemeToggle.module.scss';
import { Button } from '@/shared/components/Button';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <Button
      display={theme === 'light' ? <Sun /> : <Moon />}
      variant="circle"
      className={clsx(styles['theme-toggle'], styles[`${theme}-theme`])}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    />
  );
};
