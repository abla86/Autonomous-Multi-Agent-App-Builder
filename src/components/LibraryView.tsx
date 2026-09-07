import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Category, RareFact } from '../types';
import {
  BookOpen,
  Bookmark,
  Heart,
  Share2,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  Eye,
  Clock,
  Check
} from 'lucide-react';
import { AstrolabeIllustration, CabinetTipIllustration, ManuscriptTipIllustration } from './TipIllustrations';

interface LibraryViewProps {
  facts: RareFact[];
  bookmarkedIds: string[];
  likedIds: string[];
  onToggleBookmark: (factId: string) => void;
  onToggleLike: (factId: string) => void;
  onAddNewFact: (fact: RareFact) => void;
}

const CATEGORIES: Category[] = [
  'Alle',
  'Vitenskap',
  'Historie',
  'Kunst & Kultur',
  'Natur & Dypet',
  'Glemte Oppfinnelser',
];

export const LibraryView: React.FC<LibraryViewProps> = ({
  facts,
  bookmarkedIds,
  likedIds,
  onToggleBookmark,
  onToggleLike,
  onAddNewFact,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('Alle');
  const [activeFactDetail, setActiveFactDetail] = useState<RareFact | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredFacts = facts.filter((f) => {
    const matchesCategory = selectedCategory === 'Alle' || f.category === selectedCategory;
    const matchesBookmark = !onlyBookmarks || bookmarkedIds.includes(f.id);
    return matchesCategory && matchesBookmark;
  });

  const handleGenerateFact = async () => {
    setIsGenerating(true);
    try {
      const catToSend = selectedCategory === 'Alle' ? 'Vitenskap & Historie' : selectedCategory;
      const res = await fetch('/api/generate-fact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: catToSend }),
      });
      const newFactData = await res.json();

      const createdFact: RareFact = {
        id: `fact-${Date.now()}`,
        title: newFactData.title || 'Udokumentert Kuriositet',
        category: (selectedCategory === 'Alle' ? 'Vitenskap' : selectedCategory) as any,
        rarityScore: newFactData.rarityScore || 94,
        summary: newFactData.summary || 'En sjelden observasjon oppdaget i glemte kilder.',
        fullStory: newFactData.fullStory || newFactData.summary,
        obscureDetails: [
          'Dokumentert i uindekserte primærkilder.',
          'Ble gjenfunnet under tverrfaglige arkivstudier.',
        ],
        tag: newFactData.tag || 'Arkivfunn',
        source: newFactData.source || 'Sjelden Kunnskap AI Kurator',
        likes: 12,
        readingTimeMin: 2,
      };

      onAddNewFact(createdFact);
      setActiveFactDetail(createdFact);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (fact: RareFact) => {
    navigator.clipboard.writeText(`${fact.title} — ${fact.summary}`);
    setCopiedId(fact.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="library-view-container" className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-[#16181D] border border-[#2D3139] hover:border-[#D4AF37]/40 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-colors shadow-lg"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" /> Det Kuraterte Biblioteket
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#E0E2E6]">
            Arkivet for sjelden og obskur viten
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
            Utforsk historiske anomalier, ukjente naturfenomener, glemte patenter og hemmelige pigmenter bekreftet av kilder.
          </p>
        </div>

        <button
          id="generate-new-fact-btn"
          onClick={handleGenerateFact}
          disabled={isGenerating}
          className="px-5 py-3 bg-[#D4AF37] hover:bg-[#F2D06B] text-[#0F1115] font-bold text-xs uppercase tracking-wider rounded transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating ? 'Avdekker ny sjeldenhet...' : 'Avdekk Ny Sjeldenhet'}
        </button>
      </motion.div>

      {/* Category Pills & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2D3139] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#D4AF37] text-[#0F1115] font-bold'
                  : 'bg-[#16181D] text-gray-400 border border-[#2D3139] hover:text-[#E0E2E6]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => setOnlyBookmarks(!onlyBookmarks)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
              onlyBookmarks
                ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                : 'bg-[#16181D] border-[#2D3139] text-gray-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Lagrede ({bookmarkedIds.length})</span>
          </button>
        </div>
      </div>

      {/* Facts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacts.map((fact) => {
          const isBookmarked = bookmarkedIds.includes(fact.id);
          const isLiked = likedIds.includes(fact.id);

          return (
            <motion.div
              key={fact.id}
              id={`fact-card-${fact.id}`}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-[#16181D] border border-[#2D3139] rounded-xl p-5 flex flex-col justify-between hover:border-[#D4AF37]/60 shadow-lg transition-colors group"
            >
              <div>
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="px-2 py-0.5 rounded bg-[#1C1E24] border border-[#2D3139] text-[#D4AF37] font-mono text-[10px] uppercase">
                    {fact.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-amber-300/80 font-mono">
                      {fact.rarityScore}% sjelden
                    </span>
                  </div>
                </div>

                <h3
                  onClick={() => setActiveFactDetail(fact)}
                  className="text-base font-serif font-bold text-[#E0E2E6] group-hover:text-[#D4AF37] transition-colors cursor-pointer mb-2 leading-snug"
                >
                  {fact.title}
                </h3>

                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 mb-4 font-sans">
                  {fact.summary}
                </p>
              </div>

              <div className="border-t border-[#2D3139] pt-3 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleLike(fact.id)}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      isLiked ? 'text-rose-400 font-bold' : 'hover:text-gray-300'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                    <span>{fact.likes + (isLiked ? 1 : 0)}</span>
                  </button>

                  <button
                    onClick={() => onToggleBookmark(fact.id)}
                    className={`transition-colors cursor-pointer ${
                      isBookmarked ? 'text-[#D4AF37]' : 'hover:text-gray-300'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#D4AF37]' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={() => setActiveFactDetail(fact)}
                  className="text-[#D4AF37] hover:underline text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  Les mer →
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Modal Dossier */}
      {activeFactDetail && (
        <div className="fixed inset-0 bg-[#0F1115]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#16181D] border border-[#2D3139] rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#2D3139] pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#1C1E24] border border-[#2D3139] text-[#D4AF37] font-mono text-xs uppercase">
                  {activeFactDetail.category}
                </span>
                <span className="text-xs text-gray-400">
                  {activeFactDetail.readingTimeMin} min lesetid
                </span>
              </div>
              <button
                onClick={() => setActiveFactDetail(null)}
                className="text-gray-400 hover:text-white text-lg font-mono p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-[#D4AF37] mb-2 font-mono">
                <span>SJELDENHETSFARER: {activeFactDetail.rarityScore}%</span>
                <span>•</span>
                <span>{activeFactDetail.tag}</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#E0E2E6] mb-3 leading-snug">
                {activeFactDetail.title}
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed font-sans mb-4 p-3 bg-[#0F1115] rounded border-l-2 border-[#D4AF37]">
                {activeFactDetail.summary}
              </p>
            </div>

            {/* Full Story */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                Den Fullstendige Beretningen
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed font-serif whitespace-pre-line">
                {activeFactDetail.fullStory}
              </p>
            </div>

            {/* Obscure Details */}
            {activeFactDetail.obscureDetails && activeFactDetail.obscureDetails.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                  Oversette Detaljer & Kuriositeter
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-400 list-disc list-inside">
                  {activeFactDetail.obscureDetails.map((detail, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Academic / Archival Source */}
            <div className="p-3.5 bg-[#1C1E24] rounded border border-[#2D3139] text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Dokumentert Kilde</span>
                <span className="text-gray-300 font-serif italic">{activeFactDetail.source}</span>
              </div>
              <button
                onClick={() => handleCopy(activeFactDetail)}
                className="px-3 py-1 bg-[#2D3139] hover:bg-[#D4AF37] hover:text-[#0F1115] text-gray-300 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === activeFactDetail.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Kopiert
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" /> Del
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
