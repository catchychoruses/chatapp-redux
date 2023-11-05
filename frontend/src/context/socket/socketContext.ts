import { io } from 'socket.io-client';
import { createContext, useEffect, useState } from 'react';
import {
  fetchMessages,
  receiveMessage,
  selectCurrentRoom,
  selectUserData,
  setCurrentRoom
} from '@/store/slices';
import { addAppListener } from '@/store/listenerMiddleware';
import { MessageType } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/reduxHelpers';
import { fetchRooms } from '@/store/slices/rooms';
import { debounce } from 'lodash-es';

export const useWebSocket = () => {
  const appDispatch = useAppDispatch();

  const user = useAppSelector(selectUserData);
  const currentRoom = useAppSelector(selectCurrentRoom);
  const [userTyping, setUserTyping] = useState<string | null>(null);

  const [socket] = useState(() =>
    io(import.meta.env.VITE_BACKEND_API_URL, {
      transports: ['websocket'],
      autoConnect: false
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
    setTimeout(() => appDispatch(fetchRooms(user.ID)), 500);
  };

  const emitTyping = debounce(
    () => {
      socket.emit('typing', {
        username: user.username,
        roomID: currentRoom.ID
      });
    },
    3000,
    { leading: true, trailing: false }
  );

  useEffect(() => {
    if (currentRoom) {
      socket.emit('joinRoom', currentRoom.ID);
      appDispatch(fetchMessages(currentRoom.ID));
    }
  }, [currentRoom, appDispatch, socket]);

  useEffect(() => {
    const unsubscribe = appDispatch(
      addAppListener({
        type: 'messages/fetchMessages/fulfilled',
        effect: (action, { dispatch, getState, unsubscribe }) => {
          const ID = getState().auth.userData.ID;
          const currentRoom = getState().rooms.currentRoom;

          unsubscribe();
          socket.connect();

          socket.on('message', (message: MessageType) => {
            if (message.roomID === currentRoom.ID) {
              dispatch(receiveMessage(message));
              setUserTyping(null);
              emitTyping.cancel();
            }

            dispatch(fetchRooms(ID));
          });
        }
      })
    );

    return () => {
      socket.disconnect();
      return unsubscribe({ cancelActive: true });
    };
  }, [appDispatch, socket, emitTyping]);

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
