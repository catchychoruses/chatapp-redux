import styles from './ChatList.module.scss';
import {
  selectCurrentRoom,
  selectRooms,
  selectUserData,
  setCurrentRoom
} from '@/store/slices';
import { useCallback, useContext, useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { useAppDispatch, useAppSelector } from '@/store/reduxHelpers';
import { ThemeContext } from '@/context/theme/themeContext';
import { Button } from '@/shared/components/Button';
import { MessageSquare, User2Icon } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { logoutAPI } from '@/store/slices/auth';
import { useLocation, useNavigate } from 'react-router';
import { fetchRooms } from '@/store/slices/rooms';
import { SocketContext } from '@/context/socket';
import { NewRoomDialog } from '@/shared/components/DIalog';

export const ChatList = () => {
  const dispatch = useAppDispatch();

  const rooms = useAppSelector(selectRooms);
  const currentRoom = useAppSelector(selectCurrentRoom);
  const user = useAppSelector(selectUserData);

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { theme } = useContext(ThemeContext);
  const { emitRoomChange } = useContext(SocketContext);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleChangeRoom = useCallback(
    (roomId: string, displayName: string) => {
      if (pathname === '/chat-list') navigate('/');

      if (roomId !== currentRoom.id) {
        dispatch(
          setCurrentRoom({
            prevRoomId: currentRoom.id,
            nextRoom: { id: roomId, displayName }
          })
        );
        emitRoomChange({ prevRoomId: currentRoom.id, nextRoomId: roomId });
        sessionStorage.setItem(
          'currentRoom',
          JSON.stringify({ id: roomId, displayName })
        );
      }
    },
    [currentRoom.id, dispatch, pathname, navigate, emitRoomChange]
  );

  const toggleNewChatDialog = () => {
    setIsDialogOpen(true);
  };

  useEffect(() => {
    if (currentRoom) {
      dispatch(fetchRooms(user.id));
    }
  }, [user, currentRoom, dispatch]);

  return (
    <div
      className={clsx({
        [styles['chat-list']]: true,
        [styles[`${theme}-theme`]]: true,
        [styles.hidden]: location.pathname === '/',
        [styles.browser]: location.pathname === '/'
      })}
    >
      <div className={styles['header-bar']}>
        <p>Chats</p>
      </div>
      <div className={styles['items-wrapper']}>
        {rooms.map((room) => (
          <div
            className={clsx({
              [styles['chat-list-item']]: true,
              [styles.current]: room.roomId === currentRoom.id,
              [styles[`${theme}-theme`]]: true
            })}
            key={room.roomId}
            onClick={() => handleChangeRoom(room.roomId, room.displayName)}
          >
            <User2Icon size={'2.5rem'} className={styles.avatar} />
            <div className={styles['msg-info']}>
              <span>{room.displayName}</span>
              <span className={styles['last-msg']}>
                {room.lastMsg?.content}
              </span>
            </div>
          </div>
        ))}
        <div className={styles['new-room']}>
          <Button
            display={
              <>
                <MessageSquare size="1.375rem" />
                New Chat
              </>
            }
            onClick={toggleNewChatDialog}
          />
          <NewRoomDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
        </div>
      </div>
      <div className={styles.actions}>
        {/*  <Button
          variant="circle"
          className={styles.settings}
          display={<Settings />}
        />*/}
        <ThemeToggle />
        <Button
          className={styles.logout}
          display={'Logout'}
          onClick={(e) => {
            e.preventDefault();
            dispatch(logoutAPI());
            if (location.pathname === '/chat-list') navigate('/login');
          }}
        />
      </div>
    </div>
  );
};
