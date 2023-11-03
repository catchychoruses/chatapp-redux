import { useContext, useState } from 'react';
import { ChatBar } from './ChatBar';
import styles from './ChatWindow.module.scss';
import { SendHorizontal } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/reduxHelpers';
import {
  selectCurrentRoom,
  selectMessages,
  selectMessagesLoadingState,
  selectUserData,
  sendMessage
} from '@/store/slices';
import clsx from 'clsx';
import { ThemeContext } from '@/context/theme/themeContext';
import { SocketContext } from '@/context/socket';
import { Messages } from './Messages/Messages';
import { Button, Input } from '@/shared/components';

export const ChatWindow = () => {
  const dispatch = useAppDispatch();

  const currentRoom = useAppSelector(selectCurrentRoom);
  const messages = useAppSelector(selectMessages);
  const user = useAppSelector(selectUserData);
  const loading = useAppSelector(selectMessagesLoadingState);

  const [msgInput, setMsgInput] = useState('');

  const { theme } = useContext(ThemeContext);
  const { emitMessage, emitTyping, userTyping } = useContext(SocketContext);

  const handleInput = (input: string) => {
    if (input.length > msgInput.length) emitTyping();

    setMsgInput(input);
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
          sentBy: { username: user.username, userID: user.ID },
          roomID: currentRoom.ID,
          timeSent: time
        })
      );
      emitMessage({ content, sentBy: user.ID, roomID: currentRoom.ID });

      setMsgInput('');
    }
  };

  return (
    <div className={clsx(styles['chat-window'], styles[`${theme}-theme`])}>
      <ChatBar theme={theme} />

      <Messages
        messages={messages}
        loading={loading}
        userID={user.ID}
        userTyping={userTyping}
      />
      <form
        className={styles['new-msg']}
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(msgInput);
        }}
      >
        <Input
          value={msgInput}
          onChange={(e) => handleInput(e.currentTarget.value)}
          className={styles['msg-input']}
          autoFocus
        ></Input>
        <Button
          className={styles['send-button']}
          variant="circle"
          type="submit"
          display={<SendHorizontal />}
        />
      </form>
    </div>
  );
};
