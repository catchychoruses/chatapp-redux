import { io } from 'socket.io-client';
import { createContext, useEffect, useState } from 'react';
import {
  fetchMessages,
  receiveMessage,
  selectCurrentRoom,
  selectRooms,
  selectUserData,
  setCurrentRoom
} from '@/store/slices';
import { addAppListener } from '@/store/socketIOMiddleware';
import { MessageType } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/reduxHelpers';
import { fetchRooms } from '@/store/slices/rooms';
import { throttle } from 'lodash-es';

export const useWebSocket = () => {
  const appDispatch = useAppDispatch();

  const user = useAppSelector(selectUserData);
  const currentRoom = useAppSelector(selectCurrentRoom);
  const rooms = useAppSelector(selectRooms);
  const [userTyping, setUserTyping] = useState<string | null>(null);

  const [socket] = useState(() =>
    io(import.meta.env.VITE_BACKEND_API_URL, {
      transports: ['websocket']
    })
  );

  const emitRoomChange = ({
    prevRoomID,
    nextRoomID
  }: {
    prevRoomID?: string;
    nextRoomID: string;
  }) => {
    if (prevRoomID) {
      socket.emit('leaveRoom', prevRoomID);
    }
    socket.emit('joinRoom', nextRoomID);
  };

  const emitMessage = (message: {
    content: string;
    sentBy: string;
    roomID: string;
  }) => {
    socket.emit('message', message);
    setTimeout(() => appDispatch(fetchRooms(user.ID)), 2000);
  };

  const emitTyping = throttle(() => {
    socket.emit('typing', { username: user.username, roomID: currentRoom.ID });
  }, 5000);

  useEffect(() => {
    if (rooms.length) {
      socket.emit('joinRoom', currentRoom.ID);
      appDispatch(fetchMessages(currentRoom.ID));
    }
  }, [rooms, currentRoom, appDispatch, socket]);

  useEffect(() => {
    const unsubscribe = appDispatch(
      addAppListener({
        type: 'messages/fetchMessages/fulfilled',
        effect: (action, { dispatch, getState, unsubscribe }) => {
          unsubscribe();
          const ID = getState().auth.userData.ID;
          const currentRoom = getState().rooms.currentRoom;
          socket.on('message', (message: MessageType) => {
            if (message.roomID === currentRoom.ID) {
              dispatch(receiveMessage(message));
              setUserTyping(null);
            }

            dispatch(fetchRooms(ID));
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
              ID: action.payload.nextRoom.ID,
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

  return { socket, emitRoomChange, emitMessage, userTyping, emitTyping };
};

export const SocketContext = createContext(
  {} as ReturnType<typeof useWebSocket>
);
