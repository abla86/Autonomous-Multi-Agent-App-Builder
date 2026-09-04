import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Search,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Brain,
  Compass,
  AlertCircle,
  Lightbulb,
  Award,
  Loader2,
  RotateCcw
} from "lucide-react";
import { BlindspotChallenge, EvaluationResult } from "../../types";

const SUGGESTED_TOPICS = [
  "Kaffe & Våkenhet",
  "Hvordan sykkelen balanserer",
  "Hvorfor vi sover",
  "Penger og Renter",
  "Hukommelse & Glemmer",
  "Kvantefysikk",
  "Klima & Tilbakekobling",
  "Musikk og Følelser"
];

export function BlindspotDetective() {
  const [topicInput, setTopicInput] = useState<string>("");
  const [activeTopic, setActiveTopic] = useState<string>("");
  const [challenge, setChallenge] = useState<BlindspotChallenge | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Steg-håndtering
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Steg 1: Valgt svar
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnsweredTrap, setHasAnsweredTrap] = useState<boolean>(false);

  // Steg 2: Brukerens forklaring
  const [userExplanation, setUserExplanation] = useState<string>("");
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  // Steg 3: Tankeeksperiment
  const [thoughtExperiment, setThoughtExperiment] = useState<any | null>(null);
  const [isLoadingThoughtExperiment, setIsLoadingThoughtExperiment] = useState<boolean>(false);

  const startProbe = async (topicToTest: string) => {
    if (!topicToTest.trim()) return;
    setIsLoading(true);
    setError(null);
    setChallenge(null);
    setCurrentStep(1);
    setSelectedOption(null);
    setHasAnsweredTrap(false);
    setUserExplanation("");
    setEvaluation(null);
    setThoughtExperiment(null);
    setActiveTopic(topicToTest);

    try {
      const res = await fetch("/api/blindspot/probe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicToTest }),
      });

      if (!res.ok) {
        throw new Error("Kunne ikke kontakte sokratisk utforsker");
      }

      const data = await res.json();
      if (data.challenge) {
        setChallenge(data.challenge);
      } else {
        throw new Error("Mottok ikke gyldig utfordring");
      }
    } catch (err: any) {
      setError(err.message || "Noe gikk galt under opprettelse av blindsonetest");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrapChoice = (optionIndex: number) => {
    if (hasAnsweredTrap || !challenge) return;
    setSelectedOption(optionIndex);
    setHasAnsweredTrap(true);

    if (optionIndex === challenge.intuitiveTrap.correctIndex) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handleEvaluateExplanation = async () => {
    if (!userExplanation.trim() || !challenge) return;
    setIsEvaluating(true);

    try {
      const res = await fetch("/api/blindspot/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: activeTopic,
          userExplanation,
          challenge,
        }),
      });

      if (!res.ok) throw new Error("Feil under vurdering");
      const data = await res.json();
      if (data.evaluation) {
        setEvaluation(data.evaluation);
        confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      setError(err.message || "Kunne ikke evaluere forklaring");
    } finally {
      setIsEvaluating(false);
    }
  };

  const loadThoughtExperiment = async () => {
    if (!challenge) return;
    setIsLoadingThoughtExperiment(true);

    try {
      const res = await fetch("/api/thought-experiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mysteryTitle: challenge.humanIgnoranceFrontier.unresolvedQuestion,
          details: challenge.humanIgnoranceFrontier.whyScienceDoesNotKnowYet,
        }),
      });

      if (!res.ok) throw new Error("Feil under generering av tankeeksperiment");
      const data = await res.json();
      if (data.thoughtExperiment) {
        setThoughtExperiment(data.thoughtExperiment);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingThoughtExperiment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header / Topic Prompt */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-3">
            <Brain className="w-3.5 h-3.5" /> Sokratisk Blindsonesøker
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Hva tror du at du forstår?
          </h2>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            Mennesker lider av <em>Den forklarende dybdeillusjonen</em>: Vi tror vi forstår vanlige ting helt til vi tvinges til å forklare mekanismen. Skriv inn et emne, og la den sokratiske detektiven avsløre dine skjulte blindsoner.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              startProbe(topicInput);
            }}
            className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="F.eks. Kaffe, Sykkel, Penger, Søvn, Tyngdekraft..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !topicInput.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Undersøker...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Finn min blindsone
                </>
              )}
            </button>
          </form>

          {/* Quick suggestions */}
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            <span className="text-xs text-slate-500 mr-1 self-center">Prøv et emne:</span>
            {SUGGESTED_TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setTopicInput(topic);
                  startProbe(topic);
                }}
                className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors border border-slate-700/60"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Active Challenge Flow */}
      {challenge && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          {/* Header & Step progress */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
            <div>
              <div className="text-xs font-mono uppercase text-amber-400 tracking-wider">
                Blindsonetest for:
              </div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {challenge.topic}
              </h3>
            </div>

            {/* Stepper tabs */}
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setCurrentStep(1)}
                className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                  currentStep === 1
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                1. Intuisjonsfellen
              </button>
              <button
                onClick={() => setCurrentStep(2)}
                className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                  currentStep === 2
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                2. Mekanisme-testen
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                  currentStep === 3
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                3. Uvitenhetsfronten
              </button>
            </div>
          </div>

          {/* Curiosity Hook Banner */}
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent border-l-4 border-amber-400 rounded-r-xl">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" /> Det motintuitive premisset
            </div>
            <p className="text-sm font-medium text-slate-200 italic">
              "{challenge.curiosityHook}"
            </p>
          </div>

          {/* STEP 1: INTUITION TRAP */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <h4 className="text-base font-bold text-white mb-4">
                  {challenge.intuitiveTrap.question}
                </h4>

                <div className="space-y-2.5">
                  {challenge.intuitiveTrap.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === challenge.intuitiveTrap.correctIndex;
                    const isIntuitiveTrap = idx === challenge.intuitiveTrap.intuitiveWrongAnswerIndex;

                    let btnStyle = "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200";
                    if (hasAnsweredTrap) {
                      if (isCorrect) {
                        btnStyle = "bg-emerald-950/50 border-emerald-500 text-emerald-200 font-semibold shadow-md shadow-emerald-500/10";
                      } else if (isSelected && !isCorrect) {
                        btnStyle = "bg-rose-950/50 border-rose-500 text-rose-200";
                      } else {
                        btnStyle = "bg-slate-900/40 border-slate-800/60 text-slate-500";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={hasAnsweredTrap}
                        onClick={() => handleTrapChoice(idx)}
                        className={`w-full p-3.5 rounded-xl border text-left text-sm transition-all flex items-start gap-3 ${btnStyle}`}
                      >
                        <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs flex-shrink-0 text-slate-300">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {hasAnsweredTrap && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        )}
                        {hasAnsweredTrap && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trap Reveal & Next Step */}
              {hasAnsweredTrap && (
                <div className="p-4 bg-slate-950/90 border border-amber-500/30 rounded-xl space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                    <Sparkles className="w-4 h-4" /> Hvorfor intuisjonen tok feil
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {challenge.intuitiveTrap.counterIntuitiveExplanation}
                  </p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-amber-500/20"
                    >
                      Gå til Steg 2: Mekanisme-testen <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: MECHANISM CHALLENGE */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-xs font-mono uppercase text-indigo-400 font-semibold mb-1">
                  Mekanistisk Dybdeprøve
                </div>
                <h4 className="text-base font-bold text-white mb-2">
                  {challenge.mechanismChallenge.title}
                </h4>
                <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                  {challenge.mechanismChallenge.prompt}
                </p>

                <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg text-xs text-indigo-200 mb-4">
                  <strong>Klassisk tankefeller å unngå:</strong> {challenge.mechanismChallenge.commonFallacy}
                </div>

                {!evaluation ? (
                  <div className="space-y-3">
                    <textarea
                      rows={4}
                      value={userExplanation}
                      onChange={(e) => setUserExplanation(e.target.value)}
                      placeholder="Skriv din forklaring trinn for trinn her... Hva skjer først? Hvilken kraft eller molekyl gjør hva?"
                      className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">
                        Tips: Vær så konkret som mulig om årsak og virkning.
                      </span>
                      <button
                        onClick={handleEvaluateExplanation}
                        disabled={isEvaluating || !userExplanation.trim()}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                      >
                        {isEvaluating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Vurderer forklaring...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" /> Vurder min forståelse
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Evaluation Outcome */
                  <div className="space-y-4 pt-2">
                    <div className="p-4 bg-slate-900/90 border border-indigo-500/30 rounded-xl">
                      <div className="flex justify-between items-start gap-3 mb-3 pb-3 border-b border-slate-800">
                        <div>
                          <div className="text-[11px] font-mono text-slate-400 uppercase">
                            Din tildelte tittel:
                          </div>
                          <div className="text-lg font-extrabold text-amber-400 flex items-center gap-2">
                            <Award className="w-5 h-5" /> {evaluation.epistemicTitle}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] font-mono text-slate-400 uppercase">
                            Epistemisk Presisjon
                          </div>
                          <div className="text-2xl font-black font-mono text-white">
                            {evaluation.epistemicAccuracyScore}%
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-slate-200 leading-relaxed mb-4">
                        {evaluation.feedback}
                      </p>

                      {/* Missing mechanisms */}
                      <div className="space-y-2 mb-4">
                        <span className="text-xs font-semibold text-rose-300 block">
                          Blindsoner som ble avdekket i forklaringen:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {evaluation.revealedBlindspots.map((blindspot, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-rose-400 font-bold">•</span>
                              <span>{blindspot}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Deep question */}
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-200">
                        <strong>Sokratisk spørsmål til videre refleksjon:</strong> {evaluation.deepDivingQuestion}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-amber-500/20"
                      >
                        Gå til Steg 3: Menneskehetens Uvitenhetsfront <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: HUMAN IGNORANCE FRONTIER */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="p-5 bg-slate-950/70 rounded-xl border border-slate-800">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-3">
                  <Compass className="w-3.5 h-3.5" /> Uvitenhetens ytre grense
                </div>
                <h4 className="text-lg font-bold text-white mb-2">
                  Hva vitenskapen FREMDELES IKKE vet:
                </h4>
                <p className="text-sm font-semibold text-purple-300 mb-3">
                  "{challenge.humanIgnoranceFrontier.unresolvedQuestion}"
                </p>

                <div className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-lg text-xs text-slate-300 mb-4 leading-relaxed">
                  <strong className="text-purple-300">Hvorfor det er uløst:</strong>{" "}
                  {challenge.humanIgnoranceFrontier.whyScienceDoesNotKnowYet}
                </div>

                <div className="mb-4">
                  <span className="text-xs font-semibold text-slate-400 block mb-2">
                    Ledende hypoteser som debatteres i dag:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {challenge.humanIgnoranceFrontier.openTheories.map((theory, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 font-medium"
                      >
                        <span className="text-purple-400 font-mono text-[10px] block mb-0.5">
                          Hypotese {i + 1}
                        </span>
                        {theory}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Thought Experiment Button */}
                {!thoughtExperiment ? (
                  <button
                    onClick={loadThoughtExperiment}
                    disabled={isLoadingThoughtExperiment}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoadingThoughtExperiment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Konstruerer tankeeksperiment...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" /> Start interaktivt tankeeksperiment (Gedankenexperiment)
                      </>
                    )}
                  </button>
                ) : (
                  <div className="p-4 bg-slate-900/90 border border-purple-500/30 rounded-xl space-y-3 animate-fadeIn">
                    <div className="text-xs font-mono uppercase text-purple-400 font-semibold">
                      Tankeeksperiment
                    </div>
                    <h5 className="text-sm font-bold text-white">
                      {thoughtExperiment.title}
                    </h5>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {thoughtExperiment.scenario}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {thoughtExperiment.choices?.map((c: any, i: number) => (
                        <div key={i} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                          <span className="font-bold text-amber-300 block mb-1">{c.label}</span>
                          <span className="text-slate-400">{c.outcome}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs text-purple-200 italic">
                      "{thoughtExperiment.philosophicalPunchline}"
                    </div>
                  </div>
                )}
              </div>

              {/* Reset to explore another topic */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => {
                    setChallenge(null);
                    setTopicInput("");
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Utforsk et annet emne
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
