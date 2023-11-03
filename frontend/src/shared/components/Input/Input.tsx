import { ComponentPropsWithoutRef, forwardRef, useContext } from 'react';
import styles from './Input.module.scss';
import { clsx } from 'clsx';
import { ThemeContext } from '@/context/theme/themeContext';

interface InputProps extends ComponentPropsWithoutRef<'input'> {
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...otherProps }: InputProps, ref) => {
    const { theme } = useContext(ThemeContext);
    return (
      <input
        ref={ref}
        className={clsx(
          className && className,
          styles.input,
          styles[`${theme}-theme`]
        )}
        {...otherProps}
      />
    );
  }
);

Input.displayName = 'Input';
