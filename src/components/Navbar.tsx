import React from "react";
import { Sparkles, Film, Image as ImageIcon, LayoutGrid, Wand2 } from "lucide-react";
import { ActiveTab } from "../types";

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  logoCount: number;
  videoCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  logoCount,
  videoCount,
}) => {
  return (
    <header className="bg-[#0A0A0A] border-b border-[#222] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name in Artistic Flair theme */}
          <div
            className="flex items-center gap-3.5 cursor-pointer select-none"
            onClick={() => onTabChange("logo-designer")}
          >
            <div className="w-10 h-10 bg-[#FF3B00] rounded-full flex items-center justify-center font-black text-black text-base shadow-[0_0_15px_rgba(255,59,0,0.3)]">
              M
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-[#F0F0F0]">
                  MORPHO<span className="text-[#FF3B00]">.AI</span>
                </h1>
                <span className="hidden sm:inline-block text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 border border-[#333] text-white/50 bg-[#121212]">
                  GEMINI 3 PRO • VEO 3.1
                </span>
              </div>
              <p className="text-[10px] font-mono uppercase tracking-widest opacity-40 hidden sm:block">
                Logo Synthesis & Motion Choreography
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-2 sm:gap-6 text-xs font-bold tracking-[0.2em] uppercase">
            <button
              id="nav-logo-designer"
              onClick={() => onTabChange("logo-designer")}
              className={`flex items-center gap-2 px-3 py-2 transition-all cursor-pointer ${
                activeTab === "logo-designer"
                  ? "text-[#FF3B00] border-b-2 border-[#FF3B00]"
                  : "opacity-40 hover:opacity-100 text-[#F0F0F0]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Design</span>
            </button>

            <button
              id="nav-logo-animator"
              onClick={() => onTabChange("logo-animator")}
              className={`flex items-center gap-2 px-3 py-2 transition-all cursor-pointer ${
                activeTab === "logo-animator"
                  ? "text-[#FF3B00] border-b-2 border-[#FF3B00]"
                  : "opacity-40 hover:opacity-100 text-[#F0F0F0]"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Motion</span>
            </button>

            <button
              id="nav-picture-to-video"
              onClick={() => onTabChange("picture-to-video")}
              className={`flex items-center gap-2 px-3 py-2 transition-all cursor-pointer ${
                activeTab === "picture-to-video"
                  ? "text-[#FF3B00] border-b-2 border-[#FF3B00]"
                  : "opacity-40 hover:opacity-100 text-[#F0F0F0]"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Image-to-Video</span>
              <span className="sm:hidden">Video</span>
              <span className="text-[9px] font-black uppercase tracking-wider bg-[#FF3B00] text-black px-1.5 py-0.2">
                VEO
              </span>
            </button>

            <button
              id="nav-gallery"
              onClick={() => onTabChange("gallery")}
              className={`flex items-center gap-2 px-3 py-2 transition-all cursor-pointer ${
                activeTab === "gallery"
                  ? "text-[#FF3B00] border-b-2 border-[#FF3B00]"
                  : "opacity-40 hover:opacity-100 text-[#F0F0F0]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Studio</span>
              {(logoCount > 0 || videoCount > 0) && (
                <span className="w-4 h-4 rounded-full bg-[#FF3B00] text-black text-[9px] flex items-center justify-center font-black">
                  {logoCount + videoCount}
                </span>
              )}
            </button>
          </nav>

          {/* System status indicator */}
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono opacity-50 uppercase tracking-widest">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>AI CORE V4-STABLE</span>
          </div>
        </div>
      </div>
    </header>
  );
};
