export interface Nominee {
  id: string;
  name: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  pin?: string;
  hideSelections?: boolean;
}

export interface Category {
  id: string;
  name: string;
  year: number;
  points: number;
}

export interface Nomination {
  id: string;
  nominee: Nominee;
  category: Category;
  win: boolean;
}

export interface NominationRecord {
  id: string;
  nominee: string;
  category: string;
  win: boolean;
}

export interface Selection {
  id: string;
  player: Player;
  nomination: Nomination;
}

export interface SelectionRecord {
  id: string;
  player: string;
  nomination: string;
}

export interface Invite {
  id: string;
  token: string;
}

export enum OscarError {
  AvatarMissing,
  NameMissing,
  PinMissing,
  ConfirmationMissing,
  PinMismatch,
}

type RequestNull = [null, null]
type RequestError = [OscarError, null];
type RequestSuccess = [null, true];
export type RequestState = RequestNull | RequestError | RequestSuccess;

export interface SessionTokenClaims {
  [index: string]: string;
  plr: string;
}

export interface InviteTokenClaims {
  [index: string]: string;
  cod: string;
}
