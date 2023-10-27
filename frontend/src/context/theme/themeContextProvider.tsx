import { FC, ReactNode } from 'react';
import { ThemeContext, useValue } from './themeContext';

type Props = {
  children: ReactNode;
};
export const ThemeContextProvider: FC<Props> = ({ children }) => {
  return (
    <ThemeContext.Provider value={useValue()}>{children}</ThemeContext.Provider>
  );
};
