'use client'

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pb.client';
import { Player } from '@/components/Player';

import type { RecordModel } from 'pocketbase';
import type { Player as PlayerType } from '@/lib/types';

interface PlayerSelection {
  player: PlayerType;
  win: boolean;
  points: number;
}

export default function Home() {
  const [players, setPlayers] = useState<PlayerType[]>([]);

  const fetchSelection = async () => {
    const allPlayers = await pb.collection('players').getFullList({
      fields: 'id, name, avatar',
      cache: 'no-store',
    }) as PlayerType[];
    const players = tally(
      parse(
        await pb.collection('selections').getFullList({
          fields: 'expand.player.id, expand.player.name, expand.player.avatar, expand.nomination.win, expand.nomination.expand.category.points',
          expand: 'player, nomination, nomination.category',
          next: { tags: ['selections'] },
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

  return (
    <>
      <h1>Players</h1>
      {players.map((player) => <Player key={player.id} player={player} />)}
    </>
  );
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
