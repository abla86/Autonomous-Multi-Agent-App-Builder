import React from 'react';
import { Search, Compass, BookOpen, Award, Flame, Sparkles } from 'lucide-react';
import { UserStats } from '../types';

interface NavigationProps {
  userStats: UserStats;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenSuggest: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  userStats,
  searchQuery,
  onSearchChange,
  onOpenSuggest,
}) => {
  return (
    <nav
      id="main-navigation"
      className="flex items-center justify-between px-6 lg:px-8 h-16 border-b border-[#2D3139] bg-[#16181D] z-30 sticky top-0"
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-tr from-[#D4AF37] to-[#F2D06B] rounded-sm flex items-center justify-center shadow-md">
          <span className="text-[#0F1115] font-black text-lg font-serif">S</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold tracking-wider uppercase text-[#E0E2E6]">
            Sjelden <span className="text-[#D4AF37] font-bold">Kunnskap</span>
          </span>
          <span className="text-[9px] uppercase tracking-widest text-gray-400 -mt-1 hidden sm:inline">
            Arkivet for det oversette & ukjente
          </span>
        </div>
      </div>

      {/* Search Bar & Global actions */}
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Finn obskure fakta, mysterier..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-[#1C1E24] border border-[#2D3139] rounded-full text-sm text-[#E0E2E6] placeholder-gray-500 w-56 lg:w-72 focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2 text-xs text-gray-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        {/* User Stats & Rank */}
        <div className="flex items-center gap-3 border-l border-[#2D3139] pl-4 lg:pl-6">
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 text-amber-400 bg-[#1C1E24] px-2 py-1 rounded border border-[#2D3139]" title="Dager på rad">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="font-bold">{userStats.streakDays} d</span>
            </div>
            <div className="flex items-center gap-1 text-[#D4AF37] bg-[#1C1E24] px-2 py-1 rounded border border-[#2D3139]" title="Mysterier & quiz-poeng">
              <Award className="w-3.5 h-3.5" />
              <span className="font-bold">{userStats.quizScore} p</span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37]">
              {userStats.archiveRank}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-[#E0E2E6] leading-tight">
              Arkivar Jensen
            </p>
          </div>

          <div className="w-9 h-9 rounded-full bg-[#1C1E24] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-inner font-serif font-bold text-xs">
            AJ
          </div>
        </div>
      </div>
    </nav>
  );
};
