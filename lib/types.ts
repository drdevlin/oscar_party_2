export interface Nominee {
  id: string;
  name: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  pin?: string;
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
