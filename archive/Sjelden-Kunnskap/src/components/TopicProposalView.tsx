import React, { useState } from 'react';
import { TopicProposal, TopicDossier } from '../types';
import { Lightbulb, ThumbsUp, Sparkles, BookOpen, Clock, Send, CheckCircle2, ChevronRight } from 'lucide-react';
import { AstrolabeIllustration, CabinetTipIllustration } from './TipIllustrations';

interface TopicProposalViewProps {
  proposals: TopicProposal[];
  onVoteProposal: (id: string) => void;
  onOpenSuggestModal: () => void;
  onSelectDossier: (dossier: TopicDossier) => void;
}

export const TopicProposalView: React.FC<TopicProposalViewProps> = ({
  proposals,
  onVoteProposal,
  onOpenSuggestModal,
  onSelectDossier,
}) => {
  return (
    <div id="proposals-view-container" className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-[#16181D] border border-[#2D3139] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Lightbulb className="w-3.5 h-3.5" /> Brukerforslag & Kunnskapshull
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#E0E2E6]">
            Hva ønsker du at vi skal avdekke?
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-lg">
            Foreslå obskure fenomener, glemte ekspedisjoner eller tapte oppfinnelser. Vårt arkiv og AI-kurator genererer et komplett forskningsdossier.
          </p>
        </div>

        <button
          onClick={onOpenSuggestModal}
          className="px-6 py-3 bg-[#D4AF37] hover:bg-[#F2D06B] text-[#0F1115] font-bold text-xs uppercase tracking-wider rounded transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Lightbulb className="w-4 h-4" /> Foreslå Nytt Tema
        </button>
      </div>

      {/* Proposals list */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] border-b border-[#2D3139] pb-2">
          Samfunnets Etterlyste Emner ({proposals.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proposals.map((item) => (
            <div
              key={item.id}
              className="bg-[#16181D] border border-[#2D3139] rounded-xl p-5 flex flex-col justify-between hover:border-[#D4AF37]/50 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-[#1C1E24] border border-[#2D3139] text-[#D4AF37] text-[10px] font-mono uppercase">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    Foreslått av {item.author}
                  </span>
                </div>

                <h3 className="text-base font-serif font-bold text-[#E0E2E6] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans mb-4">
                  {item.description}
                </p>
              </div>

              <div className="border-t border-[#2D3139] pt-3 flex items-center justify-between">
                <button
                  onClick={() => onVoteProposal(item.id)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#1C1E24] hover:bg-[#2D3139] border border-[#2D3139] rounded text-xs text-gray-300 transition-colors cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{item.votes} stemmer</span>
                </button>

                {item.dossier ? (
                  <button
                    onClick={() => onSelectDossier(item.dossier!)}
                    className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Åpne Dossier →
                  </button>
                ) : (
                  <span className="text-[10px] text-amber-300/70 italic">
                    Under etterforskning...
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
