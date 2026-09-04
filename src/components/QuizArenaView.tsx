import React, { useState } from 'react';
import { QuizQuestion, UserStats } from '../types';
import { HelpCircle, Check, X, Award, RotateCcw, Sparkles, Lightbulb } from 'lucide-react';
import { AstrolabeIllustration, CabinetTipIllustration } from './TipIllustrations';

interface QuizArenaViewProps {
  questions: QuizQuestion[];
  userStats: UserStats;
  onUpdateScore: (points: number) => void;
}

export const QuizArenaView: React.FC<QuizArenaViewProps> = ({
  questions,
  userStats,
  onUpdateScore,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQ.correctAnswerIndex;
    if (isCorrect) {
      setScore((prev) => prev + 25);
      onUpdateScore(25);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div id="quiz-arena-container" className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-[#16181D] border border-[#2D3139] rounded-xl p-6 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" /> Interaktiv Quiz-arena
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#E0E2E6]">
            Test din innsikt i det oversette
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Faktaene som 95 % av befolkningen aldri har hørt om. Tjen poeng og avanser til høyere arkivarnivå.
          </p>
        </div>
        <div className="shrink-0 opacity-80">
          <AstrolabeIllustration size={90} />
        </div>
      </div>

      {!quizFinished ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Quiz Box (col-span-8) */}
          <div className="md:col-span-8 bg-[#16181D] border border-[#2D3139] rounded-xl p-6 flex flex-col justify-between">
            <div>
              {/* Question Meta */}
              <div className="flex items-center justify-between mb-4 border-b border-[#2D3139] pb-3 text-xs">
                <span className="text-gray-400">
                  Spørsmål <strong className="text-[#D4AF37]">{currentIndex + 1}</strong> av {questions.length}
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#1C1E24] border border-[#2D3139] text-[#D4AF37] text-[10px] font-mono uppercase">
                    {currentQ.category}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#2D3139] text-gray-300 text-[10px] font-semibold">
                    {currentQ.difficulty}
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <h2 className="text-lg sm:text-xl font-serif text-[#E0E2E6] mb-6 leading-relaxed">
                {currentQ.question}
              </h2>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctAnswerIndex;

                  let buttonStyle = 'bg-[#1C1E24] border-[#2D3139] text-[#E0E2E6] hover:border-[#D4AF37]';
                  if (isAnswered) {
                    if (isCorrect) {
                      buttonStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500';
                    } else if (isSelected) {
                      buttonStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                    } else {
                      buttonStyle = 'bg-[#1C1E24]/50 border-[#2D3139] text-gray-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full p-3.5 text-left border rounded-lg text-sm font-medium transition-all flex items-start justify-between gap-3 cursor-pointer ${buttonStyle}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#0F1115] border border-current text-xs font-mono flex items-center justify-center shrink-0 mt-0.5">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {isAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {isAnswered && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Answer Explanation & Bonus */}
            {isAnswered && (
              <div className="space-y-4 animate-fadeIn border-t border-[#2D3139] pt-4">
                <div className="p-4 bg-[#0F1115] border border-[#2D3139] rounded-lg">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Kuratorkommentar:
                  </p>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-serif">
                    {currentQ.explanation}
                  </p>
                </div>

                <div className="p-3 bg-[#1C1E24] border-l-2 border-[#D4AF37] rounded-r text-xs text-gray-400 leading-relaxed">
                  <strong className="text-[#D4AF37] block mb-0.5">Visste du at?</strong>
                  {currentQ.bonusDidYouKnow}
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#F2D06B] text-[#0F1115] font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
                >
                  {currentIndex + 1 < questions.length ? 'Neste spørsmål →' : 'Se resultater'}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Quiz Tip & Score Card (col-span-4) */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-[#16181D] border border-[#2D3139] rounded-xl p-5 text-center">
              <div className="w-16 h-16 rounded-full bg-[#1C1E24] border border-[#D4AF37] flex items-center justify-center mx-auto mb-3">
                <Award className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#E0E2E6] mb-1">
                Din Opptjening
              </h3>
              <p className="text-2xl font-mono font-bold text-[#D4AF37] mb-1">
                +{score} poeng
              </p>
              <p className="text-xs text-gray-400">
                Totalt arkivarpoeng: <strong>{userStats.quizScore}</strong>
              </p>
            </div>

            {/* Tip Illustration Card */}
            <div className="bg-[#16181D] border border-[#2D3139] rounded-xl p-5 text-center">
              <CabinetTipIllustration size={90} className="mx-auto mb-3" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-1">
                Arkivarens Innsikt
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed italic">
                "Kunnskap er ikke bare det som er oppført i leksikonet, men de tusen sannhetene som falt mellom linjene."
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Quiz Complete Screen */
        <div className="bg-[#16181D] border border-[#2D3139] rounded-xl p-8 text-center max-w-xl mx-auto space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#1C1E24] border-2 border-[#D4AF37] flex items-center justify-center mx-auto">
            <Award className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#E0E2E6] mb-2">
              Quiz Fullført!
            </h2>
            <p className="text-sm text-gray-400">
              Du samlet <span className="text-[#D4AF37] font-bold text-base">{score} poeng</span> i denne runden.
            </p>
          </div>

          <div className="p-4 bg-[#0F1115] border border-[#2D3139] rounded text-xs text-gray-300">
            Ditt bidrag til å utforske det oversette er lagret. Fortsett til neste tema i biblioteket for å fordype deg videre.
          </div>

          <button
            onClick={handleRestart}
            className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F2D06B] text-[#0F1115] font-bold text-xs uppercase tracking-wider rounded inline-flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Ta quizen på nytt
          </button>
        </div>
      )}
    </div>
  );
};
