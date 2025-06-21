export type Mood = 1 | 2 | 3 | 4 | 5;

export interface Note {
  id: string;
  date: string; // YYYY-MM-DD format
  content: string;
  mood?: Mood;
  images: string[]; // Array of image URIs
  createdAt: Date;
  updatedAt: Date;
}

export interface DayData {
  date: string;
  hasNote: boolean;
  mood?: Mood;
}