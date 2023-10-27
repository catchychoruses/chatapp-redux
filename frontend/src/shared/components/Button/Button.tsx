import { ComponentPropsWithoutRef, ReactNode, useContext } from 'react';
import styles from './Button.module.scss';
import { ThemeContext } from '@/context/theme/themeContext';
import clsx from 'clsx';

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'default' | 'circle';
  display: string | ReactNode;
  className?: string;
}

export const Button = ({
  variant = 'default',
  display,
  className,
  ...otherProps
}: ButtonProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <button
      className={clsx(
        className && className,
        styles.button,
        styles[`${theme}-theme`],
        styles[variant]
      )}
      {...otherProps}
    >
      {display as ReactNode}
    </button>
  );
};
