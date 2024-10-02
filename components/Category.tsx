'use client'

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pb.client';
import { upsertSelection } from '@/actions/selections';
import { Card } from '@/components/Card';

import type { CategoryNomination } from '@/app/[playerId]/[categoryId]/page';
import type { SelectionRecord } from '@/lib/types';

import styles from './Category.module.css';

type CategorySelection = Partial<Pick<SelectionRecord, 'id' | 'nomination'>>;

export interface CategoryProps {
  playerId: string;
  categoryId: string;
  nominations: CategoryNomination[];
}
export const Category = ({ playerId, categoryId, nominations }: CategoryProps) => {
  const [selection, setSelection] = useState<CategorySelection | undefined>(undefined);

  const fetchSelection = async () => {
    const [selection] = await pb.collection('selections').getFullList({
      filter: `player="${playerId}" && nomination.category="${categoryId}"`,
      fields: 'id, nomination',
      next: { tags: ['selections'] },
    }) as CategorySelection[];
    setSelection(selection);
  };

  useEffect(() => {
    fetchSelection();
    pb.collection('selections').subscribe('*', fetchSelection);
    return () => {
      pb.collection('selections').unsubscribe('*');
    };
  }, []); // eslint-disable-line

  return (
    <Card>
      <div className={styles.category}>
        {nominations.map(({id, nomineeName}) => (
          <NominationButton
            key={id}
            id={id}
            nomineeName={nomineeName}
            playerId={playerId}
            selection={selection}
          />
        ))}
      </div>
    </Card>
  );
};

interface NominationButtonProps extends Omit<CategoryNomination, 'categoryId' | 'categoryName'> {
  playerId: string;
  selection?: CategorySelection;
}
const NominationButton = ({ id, nomineeName, playerId, selection }: NominationButtonProps) => {
  const handleClick = () => {
    const record = {
      id: selection?.id,
      player: playerId,
      nomination: id,
    };
    upsertSelection(record);
  };

  return (
    <button
      className={[
        styles.nominationButton,
        id === selection?.nomination ? styles.selected : '',
      ].join(' ')}
      onClick={handleClick}
    >{nomineeName}</button>);
};
