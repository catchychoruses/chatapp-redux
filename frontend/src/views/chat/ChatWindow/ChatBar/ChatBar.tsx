import { ArrowLeft } from 'lucide-react';
import styles from './ChatBar.module.scss';
import clsx from 'clsx';
import { useAppSelector } from '@/store/reduxHelpers';
import { useNavigate } from 'react-router';
import { selectCurrentRoom } from '@/store/slices';

type ChatBarProps = {
  theme: string;
};

export const ChatBar = ({ theme }: ChatBarProps) => {
  const navigate = useNavigate();

  const currentRoom = useAppSelector(selectCurrentRoom);

  const handleRoomsListToggle = () => {
    navigate('/chat-list');
  };

  return (
    <div className={clsx(styles['chat-bar'], styles[`${theme}-theme`])}>
      <div className={styles['menu-toggle']}>
        <ArrowLeft onClick={handleRoomsListToggle} />
      </div>

      <p>{currentRoom.displayName}</p>
    </div>
  );
};
