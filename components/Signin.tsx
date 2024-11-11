'use client'

import { useActionState } from 'react';
import { PinInput } from './PinInput';
import { signin } from '@/actions/auth';
import { Modal } from './Modal';

import styles from './Signin.module.css';

const initialState: [null, null] = [null, null];

export interface SigninProps {
  playerId: string;
  onClose?: () => void;
}
export const Signin = ({ playerId, onClose }: SigninProps) => {
  const signinWithPlayerId = signin.bind(null, playerId);
  const [[, success], action] = useActionState(signinWithPlayerId, initialState);

  if (success) {
    if (onClose) onClose();
    return null;
  };

  return (
    <Modal onClose={onClose}>
      <form className={styles.form} action={action}>
        <PinInput name="pin" required />
        <button type="submit" className={styles.submit}>Sign In</button>
      </form>
    </Modal>
  );
};
