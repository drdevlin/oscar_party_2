import { Player } from "@/lib/types";

type PlayerId = string;
type Score = number;
type RankDelta = number;

type PlayerScore = [PlayerId, Score];
export type PlayerRankChange = [PlayerId, RankDelta];

interface PlayerSelection {
  player: Player;
  win: boolean;
  points: number;
}

export const rankChangesStore = 'rankChanges' as const;

const storeRankChanges = (scores: PlayerScore[]) => {
  const previousRankChangesRecord = localStorage.getItem(rankChangesStore) ?? '[]';
  const previousRankChanges = (JSON.parse(previousRankChangesRecord) || []) as PlayerRankChange[];

  const rankToRankDelta = ([playerId]: PlayerScore, rank: number) => {
    const previousRank = previousRankChanges.findIndex(([storedPlayerId]) => playerId === storedPlayerId);
    const rankDelta = previousRank === -1 ? 0 : previousRank - rank;
    return [playerId, rankDelta];
  };

  const rankChanges = scores.map(rankToRankDelta);
  localStorage.setItem(rankChangesStore, JSON.stringify(rankChanges));
}

const toScore = (keeper: Map<PlayerId, Score>, selection: PlayerSelection) => {
  const score = keeper.get(selection.player.id) || 0;
  const increase = selection.win ? selection.points : 0;
  const newScore = score + increase;
  keeper.set(selection.player.id, newScore);
  return keeper;
};

const byScore = ([, a]: PlayerScore, [, b]: PlayerScore) => b - a;

export const tally = (selections: PlayerSelection[]) => {
  const scoreKeeper = new Map<PlayerId, Score>();
  const scoreKeeperWithScores = selections.reduce(toScore, scoreKeeper);
  const scores = Array
    .from(scoreKeeperWithScores.entries())
    .sort(byScore);

  storeRankChanges(scores);

  const playersSortedByScore = scores.map(([playerId]) => {
    const selection = selections.find((selection) => selection.player.id === playerId)!;
    return selection.player;
  });
  return playersSortedByScore;
};
