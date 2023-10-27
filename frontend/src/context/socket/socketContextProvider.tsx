import { FC, ReactNode } from 'react';
import { SocketContext, useWebSocket } from './socketContext';

type Props = {
  children: ReactNode;
};
export const SocketContextProvider: FC<Props> = ({ children }) => {
  return (
    <SocketContext.Provider value={useWebSocket()}>
      {children}
    </SocketContext.Provider>
  );
};
