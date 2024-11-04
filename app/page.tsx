'use client'

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { pb } from '@/lib/pb.client';
import { checkInvitation } from '@/actions/auth';
import { Player } from '@/components/Player';
import { NewPlayer } from '@/components/NewPlayer';

import type { RecordModel } from 'pocketbase';
import type { Player as PlayerType } from '@/lib/types';

import styles from './page.module.css';

export default function Home() {
  const invite = useSearchParams().get('i');

  const [invited, setInvited] = useState(false);
  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [isNewOpen, setIsNewOpen] = useState(false);

  const handlePlusClick = () => {
    setIsNewOpen(true);
  }

  const handleNewPlayerCloseClick = () => {
    setIsNewOpen(false);
  }

  const fetchSelection = async () => {
    const allPlayers = await pb.collection('players').getFullList({
      fields: 'id, name, avatar',
      cache: 'no-store',
      next: { tags: [ 'players' ]},
    }) as PlayerType[];
    const players = tally(
      parse(
        await pb.collection('selections').getFullList({
          fields: 'expand.player.id, expand.player.name, expand.player.avatar, expand.nomination.win, expand.nomination.expand.category.points',
          expand: 'player, nomination, nomination.category',
          cache: 'no-store',
          next: { tags: [ 'selections' ]},
        })
      )
    ) as PlayerType[];
    const otherPlayers = allPlayers.filter((player) => !players.some((talliedPlayer) => talliedPlayer.id === player.id));
    setPlayers([...players, ...otherPlayers]);
  };

  useEffect(() => {
    fetchSelection();
    pb.collection('nominations').subscribe('*', fetchSelection);
    return () => {
      pb.collection('nominations').unsubscribe('*');
    };
  }, []);

  useEffect(() => {
    fetchSelection();
    pb.collection('players').subscribe('*', fetchSelection);
    return () => {
      pb.collection('players').unsubscribe('*');
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (!invite) return;
      const invited = await checkInvitation(invite);
      setInvited(invited);
    })();
  }, []);

  return (
    <>
      <div>
        <h1>Players</h1>
        {invited && (
          <button className={styles.plus} onClick={handlePlusClick}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
          </button>
        )}
      </div>
      {players.map((player) => <Player key={player.id} player={player} />)}
      {isNewOpen && <NewPlayer onClose={handleNewPlayerCloseClick} />}
    </>
  );
}

interface PlayerSelection {
  player: PlayerType;
  win: boolean;
  points: number;
}

const parse = (records: RecordModel[]): PlayerSelection[] => {
  return records.map((record) => ({
    player: {
      id: record.expand?.player.id,
      name: record.expand?.player.name,
      avatar: record.expand?.player.avatar,
    },
    win: record.expand?.nomination.win,
    points: record.expand?.nomination.expand?.category.points,
  }));
};

const tally = (selections: PlayerSelection[]) => {
  const tallied = selections.reduce<Map<string, number>>((acc, curr) => {
    let prev = 0;
    if (acc.has(curr.player.id)) {
      prev = acc.get(curr.player.id)!
    }
    const addition = curr.win ? curr.points : 0;
    acc.set(curr.player.id, prev + addition);
    return acc;
  }, new Map());
  const entries = Array.from(tallied.entries());
  entries.sort(([, a], [, b]) => b - a);
  return entries.map(([playerId]) => {
    const selection = selections.find((selection) => selection.player.id === playerId)!;
    return selection.player;
  });
};
