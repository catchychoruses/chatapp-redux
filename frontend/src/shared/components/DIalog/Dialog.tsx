import React, { useContext, useEffect, useRef, useState } from 'react';
import styles from './Dialog.module.scss';
import { ThemeContext } from '@/context/theme/themeContext';
import clsx from 'clsx';
import { Button } from '../Button';
import { X } from 'lucide-react';
import { useAppDispatch } from '@/store/reduxHelpers';
import { newRoom } from '@/store/slices/rooms';

interface DialogProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// this is some day going to be a shared dialog component :p

export const NewRoomDialog = ({ isOpen, setIsOpen }: DialogProps) => {
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDialogElement>(null);
  const { theme } = useContext(ThemeContext);

  const [modalClosing, setModalClosing] = useState(false);

  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setModalClosing(false);
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [isOpen]);

  const handleCreate = () => {
    dispatch(newRoom(emailInput));
    setModalClosing(true);
    setTimeout(() => {
      ref.current?.close();
      setIsOpen(false);
    }, 100);
  };
  return (
    <dialog ref={ref} className={styles['dialog-outer']}>
      <div
        className={clsx({
          [styles['dialog-inner']]: true,
          [styles[`${theme}-theme`]]: true,
          [styles['dialog-out']]: modalClosing
        })}
      >
        <Button
          variant="circle"
          display={<X />}
          className={styles['close-btn']}
          onClick={() => {
            setModalClosing(true);
            setTimeout(() => {
              ref.current?.close();
              setIsOpen(false);
            }, 100);
          }}
        />

        <header className={styles.header}>New Chat</header>

        <div className={styles['form-container']}>
          <label htmlFor="email">User Email:</label>
          <input
            type="email"
            name="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />
        </div>
        <Button display="Create" onClick={handleCreate} />
      </div>
    </dialog>
  );
};
