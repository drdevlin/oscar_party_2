'use client'

import { useActionState, useState } from 'react';
import { PinInput } from './PinInput';
import { Modal } from './Modal';
import { createPlayer } from '@/actions/players';
import { OscarError } from '@/lib/types';

import styles from './NewPlayer.module.css';

const initialState: [null, null] = [null, null];

export interface NewPlayerProps {
  onClose?: () => void;
}
export const NewPlayer = ({ onClose }: NewPlayerProps) => {
  const [[error, success], action] = useActionState(createPlayer, initialState);

  if (success) {
    if (onClose) onClose();
    return null;
  };

  return (
    <Modal onClose={onClose}>
      <form className={styles.form} action={action}>
        <div className={styles.inputGroup}>
          <label>Mood</label>
          <AvatarInput />
          <label>Name</label>
          <NameInput />
        </div>
        <div className={styles.inputGroup}>
          <label style={error === OscarError.PinMismatch ? { color: 'hsl(0 100% 50% / 0.7)' } : {}}>Set PIN</label>
          <PinInput name="pin" required />
        </div>
        <div className={styles.inputGroup}>
          <label style={error === OscarError.PinMismatch ? { color: 'hsl(0 100% 50% / 0.7)' } : {}}>Confirm PIN</label>
          <PinInput name="confirm" required />
        </div>
        <button type="submit" className={styles.submit}>Add New Player</button>
      </form>
    </Modal>
  );
};


const AvatarInput = () => {
  const [avatar, setAvatar] = useState('');

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    if (target.value.length > 2) return;
    if (target.value.length === 1) return;
    setAvatar(target.value);
  };

  return <input className={styles.avatarInput} name="avatar" placeholder="🤔" value={avatar} onChange={handleInputChange} required />;
};

const NameInput = () => {
  const [name, setName] = useState('');

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    if (target.value.length > 10) return;
    setName(target.value);
  };

  return <input className={styles.nameInput} name="name" value={name} onChange={handleInputChange} required />;
};
