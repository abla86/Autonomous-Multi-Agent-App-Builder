export type Category =
  | 'Alle'
  | 'Vitenskap'
  | 'Historie'
  | 'Kunst & Kultur'
  | 'Natur & Dypet'
  | 'Glemte Oppfinnelser'
  | 'Koder & Mystikk';

export interface RareFact {
  id: string;
  title: string;
  category: Exclude<Category, 'Alle'>;
  rarityScore: number; // 80 - 99 (% people who don't know this)
  summary: string;
  fullStory: string;
  obscureDetails: string[];
  tag: string;
  source: string;
  likes: number;
  readingTimeMin: number;
  isDailyHighlight?: boolean;
}

export interface MysteryClue {
  id: string;
  number: number;
  title: string;
  type: 'dokument' | 'fysisk' | 'vitne' | 'anomali';
  description: string;
  revealedText: string;
}

export interface MysteryTheory {
  id: string;
  title: string;
  description: string;
  isConsensusOrBest: boolean;
  scientificConfidence: string;
  votes: number;
}

export interface Mystery {
  id: string;
  title: string;
  subtitle: string;
  era: string;
  location: string;
  difficulty: 'Middels' | 'Krevende' | 'Uoppklarlig';
  status: 'Uoppklart' | 'Delvis oppklart' | 'Vitenskapelig avdekket';
  brief: string;
  clues: MysteryClue[];
  theories: MysteryTheory[];
  historicalResolution: string;
  archiveNotes: string;
  rarityFactor: number;
}

export interface QuizQuestion {
  id: string;
  category: Exclude<Category, 'Alle'>;
  difficulty: 'Sjelden' | 'Ekstremt obskur' | 'Arkivmester';
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  bonusDidYouKnow: string;
}

export interface TopicDossier {
  topic: string;
  title: string;
  category: string;
  rarityScore: number;
  coreFact: string;
  detailedStory: string;
  obscureDetails: string[];
  quizQuestion?: {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  };
  source: string;
}

export interface TopicProposal {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  votes: number;
  status: 'foreslått' | 'under_etterforskning' | 'avdekket';
  createdAt: string;
  dossier?: TopicDossier;
}

export interface UserStats {
  solvedMysteries: string[];
  quizScore: number;
  quizzesTaken: number;
  streakDays: number;
  bookmarkedFactIds: string[];
  likedFactIds: string[];
  archiveRank: string;
}
