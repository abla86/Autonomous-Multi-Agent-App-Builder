import React from "react";
import { Sparkles, Scan, Video, BookmarkCheck, CheckCircle2, ChevronRight } from "lucide-react";

interface HeaderProps {
  activeTab: "spatial" | "concept-art" | "video";
  onTabChange: (tab: "spatial" | "concept-art" | "video") => void;
  onOpenSavedPrompts: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenSavedPrompts,
  savedCount,
}) => {
  return (
    <header className="bg-stone-900 border-b border-stone-800 text-stone-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Curator Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-red-950/40">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-100 tracking-tight text-base sm:text-lg">
                  Curator AI Studio
                </span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  Red Boxes Active
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                Museum Prototype • Robotics Spatial Understanding & Media Lab
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 bg-stone-950/70 p-1 rounded-xl border border-stone-800">
            <button
              id="nav-tab-spatial"
              onClick={() => onTabChange("spatial")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === "spatial"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
              }`}
            >
              <Scan className="w-4 h-4" />
              <span>Ask the Exhibit (Spatial)</span>
            </button>

            <button
              id="nav-tab-concept-art"
              onClick={() => onTabChange("concept-art")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === "concept-art"
                  ? "bg-stone-700 text-white shadow-sm"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">Task 1:</span> Concept Art
            </button>

            <button
              id="nav-tab-video"
              onClick={() => onTabChange("video")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === "video"
                  ? "bg-stone-700 text-white shadow-sm"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
              }`}
            >
              <Video className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Task 2:</span> AMNH Video Tour
            </button>
          </nav>

          {/* Saved Prompts Tracker */}
          <div className="flex items-center gap-2">
            <button
              id="btn-saved-prompts"
              onClick={onOpenSavedPrompts}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition"
              title="View saved lab prompts and progress verification"
            >
              <BookmarkCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline font-medium">Saved Prompts</span>
              <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 text-[11px] font-semibold rounded">
                {savedCount}/3
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
