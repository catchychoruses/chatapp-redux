import clsx from 'clsx';
import styles from './Message.module.scss';
import { MessageType } from '@/types';
import { ThemeContext } from '@/context/theme/themeContext';
import { useContext } from 'react';

interface MessageProps {
  message: MessageType;
  currentUserID: string;
}

export const Message = ({ message, currentUserID }: MessageProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={styles['message-wrapper']}>
      <div
        className={clsx({
          [styles.message]: true,
          [styles.own]: message.sentBy.userID === currentUserID
        })}
      >
        <span className={styles.username}>{message.sentBy.username}</span>
        <div
          className={clsx({
            [styles['msg-inner']]: true,
            [styles.own]: message.sentBy.userID === currentUserID,
            [styles[`${theme}-theme`]]: true
          })}
        >
          <span className={styles['time-sent']}>{message.timeSent}</span>
          <p>{message.content}</p>
        </div>
      </div>
    </div>
  );
};
