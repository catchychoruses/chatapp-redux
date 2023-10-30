import { ChatWindow } from './ChatWindow';
import './Chat.scss';
import { ChatList } from './ChatList';
import { Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/reduxHelpers';
import { selectUserData } from '@/store/slices';
import { useEffect } from 'react';
import { logoutAPI } from '@/store/slices/auth/authActions';
import { SocketContextProvider } from '@/context/socket';
import { fetchRooms } from '@/store/slices/rooms';

export const Chat = () => {
  const user = useAppSelector(selectUserData);
  const currentRoom = sessionStorage.getItem('currentRoom');
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (user.token) {
      const jwtPayload = JSON.parse(window.atob(user.token.split('.')[1]));
      if (Date.now() >= jwtPayload.exp * 1000) {
        dispatch(logoutAPI());
      }
    }
    if (!currentRoom) {
      dispatch(fetchRooms(user.ID));
    }
  }, [dispatch, user.token, currentRoom, user.ID]);

  if (!user.authenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <main className="main">
      <SocketContextProvider>
        <ChatList />
        <ChatWindow />
      </SocketContextProvider>
    </main>
  );
};
