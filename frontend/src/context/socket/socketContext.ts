import { io } from 'socket.io-client';
import { createContext, useEffect, useState } from 'react';
import { receiveMessage, selectUserData, setCurrentRoom } from '@/store/slices';
import { addAppListener } from '@/store/socketIOMiddleware';
import { MessageType } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/reduxHelpers';
import { fetchRooms } from '@/store/slices/rooms';

export const useWebSocket = () => {
  const appDispatch = useAppDispatch();

  const { id } = useAppSelector(selectUserData);
  const [userTyping, setUserTyping] = useState<string | null>(null);

  const [socket] = useState(() =>
    io(import.meta.env.VITE_BACKEND_API_URL, {
      transports: ['websocket']
    })
  );

  const emitRoomChange = ({
    prevRoomId,
    nextRoomId
  }: {
    prevRoomId?: string;
    nextRoomId: string;
  }) => {
    if (prevRoomId) {
      socket.emit('leaveRoom', prevRoomId);
    }
    socket.emit('joinRoom', nextRoomId);
  };

  const emitMessage = (message: {
    content: string;
    sentBy: string;
    roomId: string;
  }) => {
    socket.emit('message', message);
    setTimeout(() => appDispatch(fetchRooms(id)), 2000);
  };

  useEffect(() => {
    const unsubscribe = appDispatch(
      addAppListener({
        type: 'messages/fetchMessages/fulfilled',
        effect: (action, { dispatch, getState, unsubscribe }) => {
          unsubscribe();
          const id = getState().auth.userData.id;
          const currentRoom = getState().rooms.currentRoom;

          socket.on('message', (message: MessageType) => {
            if (message.roomId === currentRoom.id) {
              dispatch(receiveMessage(message));
              setUserTyping(null);
            }

            dispatch(fetchRooms(id));
          });
        }
      })
    );

    return () => unsubscribe({ cancelActive: true });
  }, [appDispatch, socket]);

  useEffect(() => {
    const unsubscribe = appDispatch(
      addAppListener({
        actionCreator: setCurrentRoom,
        effect: (action) => {
          sessionStorage.setItem(
            'currentRoom',
            JSON.stringify({
              id: action.payload.nextRoom.id,
              displayName: action.payload.nextRoom.displayName
            })
          );
        }
      })
    );

    return () => unsubscribe({ cancelActive: true });
  }, [appDispatch, socket]);

  useEffect(() => {
    const onTyping = (username: string) => {
      setUserTyping(username);
      setTimeout(() => setUserTyping(null), 2000);
    };

    socket.on('typing', onTyping);
    return () => {
      socket.off('typing', onTyping);
    };
  }, [socket]);

  return { socket, emitRoomChange, emitMessage, userTyping };
};

export const SocketContext = createContext(
  {} as ReturnType<typeof useWebSocket>
);
