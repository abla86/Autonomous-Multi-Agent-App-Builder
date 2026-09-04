import React, { useState } from 'react';
import { Mystery, MysteryClue, MysteryTheory } from '../types';
import {
  Compass,
  FileSearch,
  Key,
  CheckCircle2,
  Lock,
  Sparkles,
  HelpCircle,
  Clock,
  MapPin,
  ChevronRight,
  Send,
  AlertCircle,
  Share2
} from 'lucide-react';
import { AstrolabeIllustration, CipherTipIllustration, ManuscriptTipIllustration } from './TipIllustrations';

interface DailyMysteryViewProps {
  mysteries: Mystery[];
  selectedMysteryId: string;
  onSelectMystery: (id: string) => void;
  onSolveMystery: (mysteryId: string) => void;
  isSolved: boolean;
}

export const DailyMysteryView: React.FC<DailyMysteryViewProps> = ({
  mysteries,
  selectedMysteryId,
  onSolveMystery,
  isSolved,
}) => {
  const currentMystery = mysteries.find((m) => m.id === selectedMysteryId) || mysteries[0];

  const [examinedClueIds, setExaminedClueIds] = useState<string[]>(['clue-1']);
  const [selectedTheoryId, setSelectedTheoryId] = useState<string | null>(null);
  const [userHypothesis, setUserHypothesis] = useState('');
  const [archivistHint, setArchivistHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [showResolution, setShowResolution] = useState(isSolved);
  const [hasVoted, setHasVoted] = useState(false);

  const handleExamineClue = (clueId: string) => {
    if (!examinedClueIds.includes(clueId)) {
      setExaminedClueIds((prev) => [...prev, clueId]);
    }
  };

  const handleRequestHint = async () => {
    setLoadingHint(true);
    try {
      const examinedClues = currentMystery.clues.filter((c) =>
        examinedClueIds.includes(c.id)
      ).map((c) => c.title);

      const response = await fetch('/api/mystery-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mysteryTitle: currentMystery.title,
          currentClues: examinedClues,
          userTheory: userHypothesis || 'Generelt arkivsøk',
        }),
      });
      const data = await response.json();
      setArchivistHint(data.hint);
    } catch (err) {
      setArchivistHint(
        'Arkivnotat: Se på kryssreferansene mellom de kjemiske analysene og de eldste historiske kildene.'
      );
    } finally {
      setLoadingHint(false);
    }
  };

  const handleSelectTheory = (theoryId: string) => {
    setSelectedTheoryId(theoryId);
    setHasVoted(true);
  };

  const handleFinalResolution = () => {
    setShowResolution(true);
    onSolveMystery(currentMystery.id);
  };

  const allCluesExamined = currentMystery.clues.every((c) => examinedClueIds.includes(c.id));

  return (
    <div id="daily-mystery-container" className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Mystery Header Banner */}
      <div className="relative rounded-xl overflow-hidden border border-[#2D3139] bg-[#16181D]">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#D4AF37]/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -right-6 -bottom-6 opacity-20 pointer-events-none hidden md:block">
          <CipherTipIllustration size={200} />
        </div>

        <div className="p-6 md:p-8 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37] text-[#0F1115] text-[10px] font-extrabold uppercase tracking-widest rounded-sm">
                <Compass className="w-3.5 h-3.5" /> Dagens Mysterium
              </span>
              <span className="text-xs bg-[#1C1E24] border border-[#2D3139] px-2.5 py-0.5 rounded text-gray-400">
                Sjeldenhetsfaktor: <strong className="text-[#D4AF37]">{currentMystery.rarityFactor}%</strong>
              </span>
              <span className="text-xs bg-[#1C1E24] border border-[#2D3139] px-2.5 py-0.5 rounded text-gray-400">
                Vanskelighetsgrad: <strong className="text-amber-400">{currentMystery.difficulty}</strong>
              </span>
            </div>

            {isSolved && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Mysterium Løst (+50p)
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-4xl font-serif font-bold text-[#E0E2E6] mb-2 tracking-tight">
            {currentMystery.title}
          </h1>
          <p className="text-sm md:text-base text-gray-400 font-serif italic mb-5">
            "{currentMystery.subtitle}"
          </p>

          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-400 border-t border-[#2D3139] pt-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Tidsperiode: <strong className="text-stone-300">{currentMystery.era}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Sted: <strong className="text-stone-300">{currentMystery.location}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Status: <strong className="text-amber-300">{currentMystery.status}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Investigation Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Briefing and Clues (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dossier Briefing Card */}
          <div className="bg-[#16181D] border border-[#2D3139] rounded-xl p-6 relative">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs uppercase tracking-widest font-bold text-[#D4AF37] flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-[#D4AF37]" /> Arkivets Saksmappe
              </h2>
              <span className="text-[11px] text-gray-400">Dossier #408-B</span>
            </div>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed font-sans mb-4">
              {currentMystery.brief}
            </p>
            <div className="p-3.5 bg-[#0F1115] rounded border-l-2 border-[#D4AF37] text-xs text-gray-400 leading-relaxed italic">
              {currentMystery.archiveNotes}
            </div>
          </div>

          {/* Clues & Physical Evidence Section */}
          <div className="bg-[#16181D] border border-[#2D3139] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#D4AF37]">
                  Undersøk Sporene ({examinedClueIds.length}/{currentMystery.clues.length})
                </h3>
                <p className="text-xs text-gray-400">
                  Lås opp og analyser de autentiske historiske bevisene
                </p>
              </div>
              <div className="flex gap-1">
                {currentMystery.clues.map((c) => (
                  <div
                    key={c.id}
                    className={`w-2.5 h-2.5 rounded-full ${
                      examinedClueIds.includes(c.id) ? 'bg-[#D4AF37]' : 'bg-[#2D3139]'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {currentMystery.clues.map((clue) => {
                const isExamined = examinedClueIds.includes(clue.id);

                return (
                  <div
                    key={clue.id}
                    id={`clue-card-${clue.id}`}
                    className={`p-4 rounded-lg border transition-all ${
                      isExamined
                        ? 'bg-[#1C1E24] border-[#D4AF37]/50 shadow-sm'
                        : 'bg-[#16181D] border-[#2D3139] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#2D3139] text-[#D4AF37] text-xs font-mono font-bold flex items-center justify-center">
                          {clue.number}
                        </span>
                        <h4 className="text-sm font-semibold text-[#E0E2E6]">
                          {clue.title}
                        </h4>
                      </div>
                      <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-[#0F1115] border border-[#2D3139] text-gray-400">
                        {clue.type}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                      {clue.description}
                    </p>

                    {isExamined ? (
                      <div className="p-3 bg-[#0F1115] rounded border border-[#2D3139] text-xs text-amber-200/90 leading-relaxed font-serif">
                        <div className="text-[10px] text-[#D4AF37] font-sans font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Analysert bevisfunn:
                        </div>
                        {clue.revealedText}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleExamineClue(clue.id)}
                        className="w-full py-2 bg-[#1C1E24] hover:bg-[#2D3139] border border-[#2D3139] text-[#D4AF37] text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Lock className="w-3 h-3" /> Undersøk spor #{clue.number}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Archivist Hint & Theory Voting (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tip Illustration & Archivist Assistant */}
          <div className="bg-[#16181D] border border-[#2D3139] rounded-xl p-5 relative overflow-hidden">
            <div className="flex items-center gap-4 mb-4">
              <div className="shrink-0">
                <ManuscriptTipIllustration size={64} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#D4AF37]">
                  Arkivarens Veiledning
                </h3>
                <p className="text-xs text-gray-400">
                  Konsulter dypere kilder og test din egen hypotese
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <textarea
                placeholder="Skriv din hypotese eller et spørsmål om mysteriet..."
                value={userHypothesis}
                onChange={(e) => setUserHypothesis(e.target.value)}
                className="w-full h-20 p-3 bg-[#0F1115] border border-[#2D3139] rounded text-xs text-[#E0E2E6] placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] resize-none"
              />
              <button
                onClick={handleRequestHint}
                disabled={loadingHint}
                className="w-full py-2 bg-[#1C1E24] hover:bg-[#2D3139] border border-[#D4AF37] text-[#D4AF37] text-xs font-bold rounded flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {loadingHint ? 'Rådspør arkivet...' : 'Få kuratortips & hypotese-analyse'}
              </button>

              {archivistHint && (
                <div className="p-3 bg-[#0F1115] border border-[#D4AF37]/50 rounded text-xs text-amber-100 leading-relaxed font-serif animate-fadeIn">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#D4AF37] block mb-1">
                    Arkivnotat fra Kuratoren:
                  </span>
                  {archivistHint}
                </div>
              )}
            </div>
          </div>

          {/* Hypotheses & Theory Selection */}
          <div className="bg-[#16181D] border border-[#2D3139] rounded-xl p-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#D4AF37] mb-2">
              Konkurrerende Teorier
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Hvilken historisk forklaring støtter bevisene best?
            </p>

            <div className="space-y-3 mb-5">
              {currentMystery.theories.map((theory) => {
                const isSelected = selectedTheoryId === theory.id;

                return (
                  <div
                    key={theory.id}
                    onClick={() => handleSelectTheory(theory.id)}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#1C1E24] border-[#D4AF37] ring-1 ring-[#D4AF37]'
                        : 'bg-[#0F1115] border-[#2D3139] hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-xs font-bold text-[#E0E2E6]">
                        {theory.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {theory.votes + (isSelected ? 1 : 0)} stemmer
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mb-2 leading-relaxed">
                      {theory.description}
                    </p>
                    <div className="text-[10px] text-[#D4AF37] italic">
                      Tillit: {theory.scientificConfidence}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Final Resolution Unlocking Button */}
            {!showResolution ? (
              <button
                id="solve-mystery-btn"
                onClick={handleFinalResolution}
                disabled={examinedClueIds.length < 2 || !selectedTheoryId}
                className="w-full py-3 bg-[#D4AF37] hover:bg-[#F2D06B] disabled:opacity-40 disabled:hover:bg-[#D4AF37] text-[#0F1115] font-bold text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Key className="w-4 h-4" />
                Avslør Arkivets Konklusjon (+50p)
              </button>
            ) : (
              <div className="p-4 bg-[#0F1115] border border-emerald-600/50 rounded-lg animate-fadeIn">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Arkivets Vitenskapelige Konsensus
                </div>
                <p className="text-xs text-gray-200 leading-relaxed font-serif mb-3">
                  {currentMystery.historicalResolution}
                </p>
                <div className="text-[11px] text-[#D4AF37] font-mono">
                  Mysterium registrert i din personlige arkivmappe.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
