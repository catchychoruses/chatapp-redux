import { memo } from 'react';
import styles from './Messages.module.scss';
import clsx from 'clsx';
import { Message } from './Message';
import { MessageType } from '@/types';

type MessagesProps = {
  messages: MessageType[];
  userTyping: string | null;
  loading: boolean;
  userID: string;
};

export const Messages = memo(
  ({ messages, loading, userID, userTyping }: MessagesProps) => {
    console.log('rerendered messages');

    return (
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
            <Message message={message} currentUserID={userID} key={index} />
          ))
        )}
      </div>
    );
  }
);

Messages.displayName = 'Messages';
