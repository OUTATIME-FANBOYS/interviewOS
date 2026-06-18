export interface Flashcard {
  id: number;
  cat: string;
  sub: string;
  q: string;
  a: string;
}

export interface Quiz {
  cat: string;
  sub: string;
  q: string;
  opts: string[];
  correct: number;
  exp: string;
}

export interface CategoryMeta {
  color: string;
  icon: string;
}

export interface Progress {
  cardId: number;
  seen: boolean;
  mastered: boolean;
  attempts: number;
}
