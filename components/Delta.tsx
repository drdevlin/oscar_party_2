'use client';

import { rankChangesStore, PlayerRankChange } from "@/utils/tally";

const style = (index: number) => ({
  opacity: 0.1 * (index + 2),
  color: 'hsl(var(--gold-hsl))'
});

export const Delta = ({ playerId }: { playerId: string }) => {
  const rankChangesRecord = localStorage.getItem(rankChangesStore);
  if (!rankChangesRecord) return null;

  const rankChanges = JSON.parse(rankChangesRecord) as PlayerRankChange[];

  const [,delta] = rankChanges.find(([storedPlayerId]) => storedPlayerId === playerId) || [];
  if (!delta) return null;

  const symbol = delta > 0 ? '↑' : '↓';
  const indicator = Array(Math.min(Math.abs(delta), 9)).fill(symbol);

  return (
    <p>
      {indicator.map((icon, i) => (
        <span key={i} style={style(i)}>
          {icon}
        </span>
      ))}
    </p>
  );
};
