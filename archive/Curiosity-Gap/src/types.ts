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

export type XPCategory = "sim" | "blindspot" | "calibration" | "frontier";

export interface XPTransaction {
  id: string;
  amount: number;
  reason: string;
  category: XPCategory;
  timestamp: number;
}

export interface UserLevel {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  badgeIcon: string;
  rankColor: string;
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: XPCategory;
  xpReward: number;
  unlockedAt?: string;
}

export interface EpistemicTruthGuarantee {
  version: string;
  status: "verified";
  principles: {
    title: string;
    description: string;
    enforcement: string;
  }[];
}
