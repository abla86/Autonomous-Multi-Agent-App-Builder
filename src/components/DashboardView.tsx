import React, { useState } from 'react';
import { Mystery, QuizQuestion, RareFact } from '../types';
import {
  Compass,
  HelpCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  Check,
  X,
  Share2,
  Lock,
  Flame,
  Award
} from 'lucide-react';
import {
  AstrolabeIllustration,
  CabinetTipIllustration,
  CipherTipIllustration,
  ManuscriptTipIllustration,
} from './TipIllustrations';

interface DashboardViewProps {
  mystery: Mystery;
  quizQuestion: QuizQuestion;
  dailyFact: RareFact;
  onGoToMystery: () => void;
  onGoToQuiz: () => void;
  onGoToLibrary: () => void;
  onOpenSuggestModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  mystery,
  quizQuestion,
  dailyFact,
  onGoToMystery,
  onGoToQuiz,
  onGoToLibrary,
  onOpenSuggestModal,
}) => {
  // Quick quiz state on the dashboard
  const [quickAnswerIdx, setQuickAnswerIdx] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleQuickAnswer = (idx: number) => {
    setQuickAnswerIdx(idx);
    setShowFeedback(true);
  };

  return (
    <div id="dashboard-view-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto pb-12">
      {/* Left Column (col-span-8) */}
      <section className="lg:col-span-8 flex flex-col gap-6">
        {/* Hero: Dagens Mysterium Card matching Professional Polish specifications */}
        <div className="relative rounded-xl overflow-hidden border border-[#2D3139] bg-[#16181D] group min-h-[340px] flex flex-col justify-end">
          {/* Background atmosphere and subtle ancient parchment texture */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F1115] via-[#16181D]/90 to-[#1C1E24]/70 z-0" />
          
          {/* Subtle Vector Cipher / Astrolabe in background */}
          <div className="absolute right-4 top-4 opacity-15 pointer-events-none">
            <CipherTipIllustration size={220} />
          </div>

          <div className="relative z-10 p-6 sm:p-8 w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37] text-[#0F1115] text-[10px] font-bold uppercase tracking-widest mb-4 rounded-sm shadow-sm">
              <Compass className="w-3.5 h-3.5" /> Dagens Mysterium
            </div>

            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#E0E2E6] mb-2 tracking-tight">
              {mystery.title}
            </h2>

            <p className="text-gray-300 max-w-xl text-xs sm:text-sm leading-relaxed mb-6 font-sans">
              {mystery.brief}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                id="dashboard-start-decoding-btn"
                onClick={onGoToMystery}
                className="px-6 sm:px-8 py-3 bg-white hover:bg-gray-200 text-[#0F1115] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md rounded-sm"
              >
                Begynn Dekoding <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <span className="text-xs text-gray-400">
                Sjeldenhetsgrad: <strong className="text-[#D4AF37] font-mono">{mystery.rarityFactor}%</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column lower cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Interaktiv Hurtigquiz */}
          <div className="bg-[#16181D] border border-[#2D3139] p-5 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-xs uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" /> Interaktiv Quiz
                </h3>
                <span className="text-[10px] bg-[#2D3139] px-2 py-0.5 rounded text-gray-400 font-mono">
                  {quizQuestion.difficulty}
                </span>
              </div>

              <p className="text-base font-serif text-[#E0E2E6] mb-4 leading-snug">
                {quizQuestion.question}
              </p>

              <div className="space-y-2 mb-4">
                {quizQuestion.options.slice(0, 3).map((opt, idx) => {
                  const isSelected = quickAnswerIdx === idx;
                  const isCorrect = idx === quizQuestion.correctAnswerIndex;

                  let style = 'bg-[#1C1E24] border-[#2D3139] text-gray-300 hover:border-[#D4AF37]';
                  if (showFeedback) {
                    if (isCorrect) {
                      style = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-medium';
                    } else if (isSelected) {
                      style = 'bg-rose-950/60 border-rose-500 text-rose-300';
                    } else {
                      style = 'bg-[#1C1E24]/40 border-[#2D3139] text-gray-500 opacity-60';
                    }
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => !showFeedback && handleQuickAnswer(idx)}
                      className={`p-2.5 border text-xs rounded transition-all cursor-pointer flex items-center justify-between ${style}`}
                    >
                      <span>{opt}</span>
                      {showFeedback && isCorrect && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  );
                })}
              </div>

              {showFeedback && (
                <div className="p-3 bg-[#0F1115] border border-[#2D3139] rounded text-[11px] text-amber-200/90 leading-relaxed font-serif mb-3 animate-fadeIn">
                  {quizQuestion.explanation}
                </div>
              )}
            </div>

            <button
              onClick={onGoToQuiz}
              className="text-[#D4AF37] hover:underline text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer pt-2"
            >
              Åpne full Quiz-arena (5 spørsmål) →
            </button>
          </div>

          {/* Card 2: Visste du at? with Tip illustration */}
          <div className="bg-[#16181D] border border-[#2D3139] p-5 rounded-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-4 -bottom-4 w-28 h-28 border-4 border-[#D4AF37]/10 rounded-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-xs uppercase tracking-widest text-[#D4AF37]">
                  Dagens 'Visste du at?'
                </h3>
                <span className="text-[10px] text-amber-300 font-mono">
                  {dailyFact.rarityScore}% sjeldenhet
                </span>
              </div>

              <p className="text-xs text-gray-400 mb-3 italic font-serif">
                "{dailyFact.title}"
              </p>

              <div className="bg-[#0F1115] p-3.5 border-l-2 border-[#D4AF37] rounded-r mb-3">
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-serif">
                  {dailyFact.summary}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#2D3139] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500 border border-[#16181D] text-[9px] flex items-center justify-center font-bold text-black">A</div>
                  <div className="w-5 h-5 rounded-full bg-blue-500 border border-[#16181D] text-[9px] flex items-center justify-center font-bold text-white">B</div>
                  <div className="w-5 h-5 rounded-full bg-emerald-500 border border-[#16181D] text-[9px] flex items-center justify-center font-bold text-white">C</div>
                </div>
                <span className="text-[11px] text-gray-400">
                  +{dailyFact.likes} lærte dette i dag
                </span>
              </div>

              <button
                onClick={onGoToLibrary}
                className="text-xs font-bold text-[#D4AF37] hover:underline cursor-pointer"
              >
                Les hele saken →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column (col-span-4) matching Professional Polish specifications */}
      <section className="lg:col-span-4 flex flex-col gap-6">
        {/* Kunnskapshull Card */}
        <div className="bg-[#16181D] border border-[#2D3139] rounded-xl flex flex-col">
          <div className="p-5 border-b border-[#2D3139]">
            <h3 className="font-bold text-xs uppercase tracking-widest text-[#D4AF37]">
              Kunnskapshull
            </h3>
            <p className="text-xs text-gray-500">Trender i det oversette & ukjente</p>
          </div>

          <div className="p-5 space-y-5">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 font-medium">Kvantebiologi</span>
                <span className="text-[#D4AF37] font-mono font-semibold">88% uutforsket</span>
              </div>
              <div className="h-1.5 w-full bg-[#2D3139] rounded-full overflow-hidden">
                <div className="h-full bg-[#D4AF37] w-[88%]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 font-medium">Dypvannsarkeologi</span>
                <span className="text-[#D4AF37] font-mono font-semibold">95% uutforsket</span>
              </div>
              <div className="h-1.5 w-full bg-[#2D3139] rounded-full overflow-hidden">
                <div className="h-full bg-[#D4AF37] w-[95%]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 font-medium">Glemte Språk & Kodekser</span>
                <span className="text-[#D4AF37] font-mono font-semibold">72% uutforsket</span>
              </div>
              <div className="h-1.5 w-full bg-[#2D3139] rounded-full overflow-hidden">
                <div className="h-full bg-[#D4AF37] w-[72%]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 font-medium">Glemte Antikke Mekanismer</span>
                <span className="text-[#D4AF37] font-mono font-semibold">84% uutforsket</span>
              </div>
              <div className="h-1.5 w-full bg-[#2D3139] rounded-full overflow-hidden">
                <div className="h-full bg-[#D4AF37] w-[84%]" />
              </div>
            </div>
          </div>

          {/* Next Milestone Card inside */}
          <div className="p-5 pt-0">
            <div className="bg-[#1C1E24] p-4 rounded-lg border border-dashed border-[#2D3139] text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                Neste milepæl
              </p>
              <p className="text-xs font-semibold text-[#E0E2E6]">
                Lås opp: 'Vatikanets Hemmelige Arkiver'
              </p>
              <div className="flex justify-center gap-1.5 mt-3">
                <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <div className="w-2 h-2 rounded-full bg-[#2D3139]" />
              </div>
            </div>
          </div>
        </div>

        {/* Tip illustration Card / Cabinet of Curiosities */}
        <div className="bg-[#16181D] border border-[#2D3139] rounded-xl p-5 relative overflow-hidden flex items-center gap-4">
          <div className="shrink-0">
            <AstrolabeIllustration size={75} />
          </div>
          <div>
            <span className="text-[10px] text-[#D4AF37] font-mono uppercase tracking-wider block mb-0.5">
              Kuratortips #14
            </span>
            <h4 className="text-xs font-bold text-[#E0E2E6] mb-1">
              Observasjonens Kunst
            </h4>
            <p className="text-[11px] text-gray-400 leading-relaxed font-serif">
              De største historiske hemmelighetene var aldri gravlagt – de ble bare aldri katalogisert.
            </p>
          </div>
        </div>

        {/* Premium / Pro Archivist Card */}
        <div className="bg-gradient-to-br from-[#D4AF37] to-[#B8962B] p-5 rounded-xl text-[#0F1115]">
          <h4 className="font-bold text-xs uppercase tracking-wider mb-1">
            Arkivarens Medlemskap
          </h4>
          <p className="text-[11px] leading-tight mb-3 font-medium opacity-90">
            Få tilgang til eksklusive lydarkiver, upubliserte kodekser og daglige dypdykk.
          </p>
          <div className="flex items-end justify-between">
            <span className="text-xl font-bold font-mono">
              49,- <span className="text-xs font-normal">/mnd</span>
            </span>
            <button
              onClick={() => alert('Du har nå tilgang til utvidet arkivvisning.')}
              className="bg-[#0F1115] hover:bg-stone-900 text-white text-[10px] px-3.5 py-1.5 rounded-sm font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Aktiver
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
