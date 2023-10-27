import { useContext, useEffect, useState } from 'react';
import { ChatBar } from './ChatBar';
import styles from './ChatWindow.module.scss';
import { Send } from 'lucide-react';
import { Message } from './Message';
import { useAppDispatch, useAppSelector } from '@/store/reduxHelpers';
import {
  fetchMessages,
  selectCurrentRoom,
  selectMessages,
  selectMessagesLoadingState,
  selectUserData,
  sendMessage
} from '@/store/slices';
import clsx from 'clsx';
import { ThemeContext } from '@/context/theme/themeContext';
import { Button } from '@/shared/components/Button';
import { SocketContext } from '@/context/socket';

export const ChatWindow = () => {
  const dispatch = useAppDispatch();

  const currentRoom = useAppSelector(selectCurrentRoom);
  const messages = useAppSelector(selectMessages);
  const user = useAppSelector(selectUserData);
  const loading = useAppSelector(selectMessagesLoadingState);

  const [msgInput, setMsgInput] = useState('');

  const { theme } = useContext(ThemeContext);
  const { socket, emitMessage, userTyping } = useContext(SocketContext);

  const handleInput = (input: string) => {
    setMsgInput(input);
    socket.emit('typing', { username: user.username, roomId: currentRoom.id });
  };

  const handleSendMessage = (content: string) => {
    if (content) {
      const time = new Date().toLocaleTimeString('pl', {
        timeStyle: 'short',
        hour12: false
      });

      dispatch(
        sendMessage({
          content,
          sentBy: { username: user.username, userId: user.id },
          roomId: currentRoom.id,
          timeSent: time
        })
      );
      emitMessage({ content, sentBy: user.id, roomId: currentRoom.id });

      setMsgInput('');
    }
  };

  useEffect(() => {
    if (currentRoom) {
      socket.emit('joinRoom', currentRoom.id);
      dispatch(fetchMessages(currentRoom.id));
    }
  }, [currentRoom, dispatch, socket]);

  return (
    <div className={clsx(styles['chat-window'], styles[`${theme}-theme`])}>
      <ChatBar theme={theme} />

      <div className={styles.messages}>
        <div
          className={clsx({
            [styles.typing]: true,
            [styles['is-typing']]: userTyping
          })}
        >
          {userTyping} is typing...
        </div>

        {loading ? (
          <p className={styles.status}>Loading...</p>
        ) : !messages.length ? (
          <p className={styles.status}>Your messages will go here! :)</p>
        ) : (
          messages.map((message, index) => (
            <Message message={message} currentUserId={user?.id} key={index} />
          ))
        )}
      </div>

      <form
        className={styles['new-msg']}
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(msgInput);
        }}
      >
        <input
          value={msgInput}
          onChange={(e) => handleInput(e.currentTarget.value)}
          className={clsx(styles['msg-input'], styles[`${theme}-theme`])}
          autoFocus
        ></input>
        <Button
          className={styles['send-button']}
          variant="circle"
          type="submit"
          display={<Send />}
        />
      </form>
    </div>
  );
};
