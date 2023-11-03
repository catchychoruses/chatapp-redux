import React, { useContext, useEffect, useRef, useState } from 'react';
import styles from './Dialog.module.scss';
import { ThemeContext } from '@/context/theme/themeContext';
import clsx from 'clsx';
import { Button } from '../Button';
import { X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/reduxHelpers';
import {
  fetchRooms,
  newRoom,
  selectCreateRoomError
} from '@/store/slices/rooms';
import { Input } from '../Input';

interface DialogProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// this is some day going to be a shared dialog component :p

export const NewRoomDialog = ({ isOpen, setIsOpen }: DialogProps) => {
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDialogElement>(null);
  const { theme } = useContext(ThemeContext);

  const error = useAppSelector(selectCreateRoomError);

  const [modalClosing, setModalClosing] = useState(false);

  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setModalClosing(false);
      ref.current?.showModal();
    } else {
      setEmailInput('');
      ref.current?.close();
    }
  }, [isOpen, error]);

  const handleCreate = () => {
    if (emailInput) {
      dispatch(newRoom(emailInput)).then((action) => {
        if (action.meta.requestStatus === 'fulfilled') {
          setModalClosing(true);
          setTimeout(() => {
            ref.current?.close();
            setIsOpen(false);
          }, 100);
          dispatch(fetchRooms(null));
        }
      });
    }
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

        <form
          className={styles['form-container']}
          onSubmit={(e) => {
            e.preventDefault(), handleCreate();
          }}
        >
          <label htmlFor="email">User Email:</label>
          <Input
            type="email"
            name="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            autoFocus
          />
          <Button display="Create" type="submit" />
        </form>
        <p>{error ?? error}</p>
      </div>
    </dialog>
  );
};
