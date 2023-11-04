import { memo } from 'react';
import styles from './Messages.module.scss';

import { Message } from './Message';
import { MessageType } from '@/types';

type MessagesProps = {
  messages: MessageType[];

  loading: boolean;
  userID: string;
};

export const Messages = memo(({ messages, loading, userID }: MessagesProps) => {
  return (
    <div className={styles.messages}>
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
});

Messages.displayName = 'Messages';
