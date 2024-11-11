'use client'

import { useActionState } from 'react';
import { signout } from '@/actions/auth';
import { Modal } from './Modal';

import styles from './Signout.module.css';

const initialState: [null, null] = [null, null];

export interface SignoutProps {
  onClose?: () => void;
}
export const Signout = ({ onClose }: SignoutProps) => {
  const [[, success], action] = useActionState(signout, initialState);

  if (success) {
    if (onClose) onClose();
    return null;
  };

  const handleCancelClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    if (onClose) onClose();
  }

  return (
    <Modal onClose={onClose}>
      <form className={styles.form} action={action}>
        <button type="button" className={styles.cancel} onClick={handleCancelClick}>Stay In</button>
        <button type="submit" className={styles.submit}>Sign Out</button>
      </form>
    </Modal>
  );
};
