import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Target,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  Sparkles,
  Zap,
  HelpCircle,
  Sliders
} from "lucide-react";
import { CALIBRATION_QUESTIONS } from "../../data/frontiers";
import { CalibrationItem } from "../../types";

interface UserAttempt {
  question: CalibrationItem;
  chosenAnswer: "A" | "B";
  confidence: number; // 50, 70, 90, 99
  isCorrect: boolean;
}

export function CalibrationArena() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | null>(null);
  const [confidence, setConfidence] = useState<number>(70);
  const [hasSubmittedCurrent, setHasSubmittedCurrent] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<UserAttempt[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentQ = CALIBRATION_QUESTIONS[currentIndex];

  const handleSubmitRound = () => {
    if (!selectedAnswer) return;
    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    const newAttempt: UserAttempt = {
      question: currentQ,
      chosenAnswer: selectedAnswer,
      confidence,
      isCorrect,
    };

    setAttempts((prev) => [...prev, newAttempt]);
    setHasSubmittedCurrent(true);

    if (isCorrect) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < CALIBRATION_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setConfidence(70);
      setHasSubmittedCurrent(false);
    } else {
      setIsFinished(true);
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
    }
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setConfidence(70);
    setHasSubmittedCurrent(false);
    setAttempts([]);
    setIsFinished(false);
  };

  // Compute calibration score:
  // Average confidence vs actual accuracy
  const correctCount = attempts.filter((a) => a.isCorrect).length;
  const accuracyPercent = attempts.length > 0 ? (correctCount / attempts.length) * 100 : 0;
  const avgConfidence =
    attempts.length > 0
      ? attempts.reduce((acc, curr) => acc + curr.confidence, 0) / attempts.length
      : 0;

  // Overconfidence bias: difference between confidence and accuracy
  const biasDiff = avgConfidence - accuracyPercent;
  let calibrationArchetype = "Godt kalibrert";
  let archetypeDesc = "Du har en sunn selvinnsikt og vet når du gjetter vs når du faktisk vet.";

  if (biasDiff > 15) {
    calibrationArchetype = "Overkonfident optimist";
    archetypeDesc = "Du føler deg ofte mye sikrere enn sannsynligheten tilsier – klassisk Dunning-Kruger effekt!";
  } else if (biasDiff < -15) {
    calibrationArchetype = "Underkonfident tenker";
    archetypeDesc = "Du undervurderer dine egne resonnementer og tipper lav selvtillit selv når du har rett.";
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
              <Target className="w-3.5 h-3.5" /> Metakognitiv kalibrering
            </div>
            <h3 className="text-xl font-bold text-white">Kalibrerings-Arenaen</h3>
            <p className="text-sm text-slate-400">
              Det handler ikke bare om å ha rett – det handler om å <em>vite når du vet</em>. Velg svar og sett din sikkerhetsgrad!
            </p>
          </div>
          <div className="text-xs font-mono px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-slate-400">
            Spørsmål {currentIndex + 1} av {CALIBRATION_QUESTIONS.length}
          </div>
        </div>

        {!isFinished ? (
          <div className="space-y-6">
            {/* Question card */}
            <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl">
              <h4 className="text-base sm:text-lg font-bold text-white mb-5 leading-snug">
                {currentQ.statement}
              </h4>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {(["A", "B"] as const).map((optKey) => {
                  const text = optKey === "A" ? currentQ.optionA : currentQ.optionB;
                  const isSelected = selectedAnswer === optKey;
                  const isCorrect = currentQ.correctAnswer === optKey;

                  let optClass = "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200";
                  if (hasSubmittedCurrent) {
                    if (isCorrect) {
                      optClass = "bg-emerald-950/40 border-emerald-500 text-emerald-200 font-bold shadow-md shadow-emerald-500/10";
                    } else if (isSelected && !isCorrect) {
                      optClass = "bg-rose-950/40 border-rose-500 text-rose-200";
                    } else {
                      optClass = "bg-slate-900/40 border-slate-800 text-slate-500";
                    }
                  } else if (isSelected) {
                    optClass = "bg-emerald-500/10 border-emerald-400 text-white font-semibold shadow-md shadow-emerald-500/10";
                  }

                  return (
                    <button
                      key={optKey}
                      disabled={hasSubmittedCurrent}
                      onClick={() => setSelectedAnswer(optKey)}
                      className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-center justify-between gap-3 ${optClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-slate-300">
                          {optKey}
                        </span>
                        <span>{text}</span>
                      </div>
                      {hasSubmittedCurrent && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      )}
                      {hasSubmittedCurrent && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Confidence selector */}
              {!hasSubmittedCurrent && (
                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Hvor sikker er du på dette svaret?
                    </span>
                    <span className="text-sm font-mono font-bold text-emerald-400">
                      {confidence}% sikker
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {[
                      { val: 50, label: "50% (Gjetter)" },
                      { val: 70, label: "70% (Tror det)" },
                      { val: 90, label: "90% (Ganske sikker)" },
                      { val: 99, label: "99% (Sverger!)" },
                    ].map((c) => (
                      <button
                        key={c.val}
                        onClick={() => setConfidence(c.val)}
                        className={`py-2 px-1 text-xs rounded-lg font-medium border transition-colors ${
                          confidence === c.val
                            ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit / Next Button */}
              {!hasSubmittedCurrent ? (
                <button
                  onClick={handleSubmitRound}
                  disabled={!selectedAnswer}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  Lås svar og vurder intuisjon
                </button>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-slate-900 border border-emerald-500/30 rounded-xl space-y-2">
                    <div className="text-xs font-bold uppercase text-emerald-400">
                      Fasit & Forklaring:
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {currentQ.explanation}
                    </p>
                    <div className="text-[11px] text-amber-300/90 pt-1">
                      <strong>Hvorfor intuisjonen tok feil:</strong> {currentQ.counterIntuitiveReason}
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all"
                  >
                    {currentIndex + 1 < CALIBRATION_QUESTIONS.length
                      ? "Neste spørsmål →"
                      : "Se min ferdige kalibreringsrapport →"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Finished Screen: Calibration Report */
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-xl text-center max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl mx-auto mb-3">
                🎯
              </div>

              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                Din metakognitive profil:
              </div>
              <h4 className="text-2xl font-black text-emerald-400 mb-2">
                {calibrationArchetype}
              </h4>
              <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                {archetypeDesc}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 text-left">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Treffsikkerhet</div>
                  <div className="text-xl font-bold font-mono text-white">
                    {correctCount} / {attempts.length} ({accuracyPercent.toFixed(0)}%)
                  </div>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Gjennomsnittlig sikkerhet</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {avgConfidence.toFixed(0)}%
                  </div>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Overkonfidens-gap</div>
                  <div className={`text-xl font-bold font-mono ${biasDiff > 10 ? 'text-rose-400' : 'text-cyan-400'}`}>
                    {biasDiff > 0 ? `+${biasDiff.toFixed(0)}%` : `${biasDiff.toFixed(0)}%`}
                  </div>
                </div>
              </div>

              <button
                onClick={resetGame}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Prøv kalibreringen på nytt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
