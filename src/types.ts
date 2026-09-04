export interface IntuitiveTrap {
  question: string;
  options: string[];
  intuitiveWrongAnswerIndex: number;
  correctIndex: number;
  counterIntuitiveExplanation: string;
}

export interface MechanismChallenge {
  title: string;
  prompt: string;
  keyMissingMechanisms: string[];
  commonFallacy: string;
}

export interface HumanIgnoranceFrontier {
  unresolvedQuestion: string;
  whyScienceDoesNotKnowYet: string;
  openTheories: string[];
}

export interface BlindspotChallenge {
  topic: string;
  curiosityHook: string;
  intuitiveTrap: IntuitiveTrap;
  mechanismChallenge: MechanismChallenge;
  humanIgnoranceFrontier: HumanIgnoranceFrontier;
}

export interface EvaluationResult {
  feedback: string;
  epistemicAccuracyScore: number;
  revealedBlindspots: string[];
  deepDivingQuestion: string;
  epistemicTitle: string;
}

export type FrontierCategory =
  | "Kosmos & Fysikk"
  | "Hjerne & Bevissthet"
  | "Hverdagsmysterier"
  | "Liv & Evolusjon"
  | "Matematikk & Paradoks";

export interface KnowledgeFrontier {
  id: string;
  title: string;
  category: FrontierCategory;
  teaser: string;
  whatPeopleAssume: string;
  theUnsolvedCore: string;
  counterIntuitiveTruth: string;
  wonderQuestion: string;
  tags: string[];
}

export interface CalibrationItem {
  id: number;
  statement: string;
  optionA: string;
  optionB: string;
  correctAnswer: "A" | "B";
  explanation: string;
  counterIntuitiveReason: string;
}

export interface UserCalibrationResult {
  brierScore: number;
  overconfidenceBias: "Overkonfidens" | "Godt kalibrert" | "Underkonfidens";
  scorePercent: number;
  correctCount: number;
  totalCount: number;
}
