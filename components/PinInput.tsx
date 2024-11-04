'use client'

import { useRef, useState } from 'react';

import styles from './PinInput.module.css';

export interface PinInputProps {
  name: string;
  required?: boolean;
}
export const PinInput = ({ name, required }: PinInputProps) => {
  const [values, setValues] = useState(['', '', '', '']);
  const refs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null)
  ];

  const handleChange = (index: number): React.ChangeEventHandler<HTMLInputElement> => ({ target }) => {
    if (target.value.length > 1) return;

    const newValues = [...values];
    newValues[index] = target.value;
    setValues(newValues);
    if (target.value !== '' && index !== 3) refs[index + 1].current?.focus();
  };

  const handleKeyDown = (index: number): React.KeyboardEventHandler<HTMLInputElement> => (event) => {
    // When slot is empty and backspace is pressed, move focus to previous slot.
    if (event.key === 'Backspace' && event.currentTarget.value === '') refs[index - 1].current?.focus();
  }

  return (
    <div className={styles.pinInput}>
      <input
        type="password"
        inputMode="numeric"
        name={name + 0}
        ref={refs[0]}
        value={values[0]}
        onChange={handleChange(0)}
        required={required}
      />
      <input
        type="password"
        inputMode="numeric"
        name={name + 1}
        ref={refs[1]}
        value={values[1]}
        onChange={handleChange(1)}
        onKeyDown={handleKeyDown(1)}
        required={required}
      />
      <input
        type="password"
        inputMode="numeric"
        name={name + 2}
        ref={refs[2]}
        value={values[2]}
        onChange={handleChange(2)}
        onKeyDown={handleKeyDown(2)}
        required={required}
      />
      <input
        type="password"
        inputMode="numeric"
        name={name + 3}
        ref={refs[3]}
        value={values[3]}
        onChange={handleChange(3)}
        onKeyDown={handleKeyDown(3)}
        required={required}
      />
    </div>
  );
};
