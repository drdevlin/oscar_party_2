import { pb } from '@/lib/pb.server';
import { getSession } from '@/lib/jwt';
import { Back } from '@/components/Back';
import { Selection } from '@/components/Selection';
import { Auth } from '@/components/Auth';
import { HideSelections } from '@/components/HideSelections';

import type { RecordModel } from 'pocketbase';
import type { Category as CategoryType, Player } from '@/lib/types';

export const dynamic = 'force-dynamic';

export interface SelectionsProps {
  params: Promise<{ playerId: string }>;
}
export default async function Selections({ params }: SelectionsProps) {
  const { playerId } = await params;

  const user = await getSession();
  const selectionsBelongToUser = user === playerId;
  const locked = true; // TODO: user === null || !selectionsBelongToUser;

  const { hideSelections } = await pb.collection('players').getOne(playerId, {
    fields: 'hideSelections',
    cache: 'no-store',
  }) as Pick<Player, 'hideSelections'>;

  const hidden = hideSelections && !selectionsBelongToUser;

  const categories = await pb.collection('categories').getFullList() as CategoryType[];
  const selections = parse(
    await pb.collection('selections').getFullList({
      filter: `player="${playerId}"`,
      expand: 'nomination, nomination.nominee',
      cache: 'no-store',
      next: { tags: ['selections'] },
    })
  );

  return (
    <>
      <div>
        <Back href="/" />
        <h1>Selections</h1>
        <Auth playerId={playerId} differentPlayer={locked && user !== null} locked={locked} />
        {selectionsBelongToUser && <HideSelections playerId={playerId} />}
      </div>
      {hidden ? (
        <p>Player has hidden their selections.</p>
      ) : (
        categories.map((category) => {
        const selection = selections.find((selection) => selection.categoryId === category.id);
        return (
          <Selection
            key={category.id}
            playerId={playerId}
            categoryId={category.id}
            categoryName={category.name}
            nomineeName={selection?.nomineeName || ''}
            win={Boolean(selection?.win)}
            locked={locked}
          />
        );
      })
    )
    }
    </>
  );
}

export const generateStaticParams = async () => {
  const players = await pb.collection('players').getFullList({
    cache: 'no-store',
    next: { tags: ['players'] },
  }) as Player[];

  return players.map(({ id }) => ({ playerId: id }));
};

// Helpers
interface PlayerSelection {
  categoryId: string;
  nomineeName: string;
  win: boolean;
}
const parse = (records: RecordModel[]): PlayerSelection[] => {
  return records.map((record) => ({
    categoryId: record?.expand?.nomination?.category,
    nomineeName: record?.expand?.nomination?.expand?.nominee?.name,
    win: record?.expand?.nomination?.win,
  }));
};
