import React, { useState } from "react";
import {
  Award,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Volume2,
  VolumeX,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Lock,
  X,
  Zap,
  Sliders,
  Compass,
  Target,
  Brain
} from "lucide-react";
import { useUserProgress } from "../../context/UserProgressContext";
import { LEVELS } from "../../data/progressData";
import { EpistemicTruthModal } from "./EpistemicTruthModal";

export function LevelIndicator() {
  const {
    xp,
    level,
    nextLevel,
    progressToNextLevel,
    achievements,
    categoryStats,
    resetProgress,
    soundEnabled,
    setSoundEnabled,
  } = useUserProgress();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTruthModalOpen, setIsTruthModalOpen] = useState(false);
  const [achievementFilter, setAchievementFilter] = useState<"all" | "unlocked" | "locked">("all");

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  const filteredAchievements = achievements.filter((a) => {
    if (achievementFilter === "unlocked") return a.isUnlocked;
    if (achievementFilter === "locked") return !a.isUnlocked;
    return true;
  });

  return (
    <>
      {/* Navbar Pill Indicator */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="group relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 transition-all text-left shadow-md hover:shadow-amber-500/10"
        title="Klikk for å se din Erkjennelsesprofil og bragder"
      >
        {/* Level Icon Badge with Progress Glow */}
        <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/30 text-sm flex-shrink-0">
          <span>{level.badgeIcon}</span>
        </div>

        {/* Level Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
              Lv. {level.level}
            </span>
            <span className="text-[11px] font-bold text-slate-200 hidden md:inline truncate max-w-[130px]">
              {level.title}
            </span>
          </div>

          {/* Mini XP Progress Bar */}
          <div className="w-16 sm:w-20 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 mt-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>
        </div>

        {/* XP Count */}
        <div className="hidden sm:flex items-center gap-1 pl-1 border-l border-slate-800 text-xs font-mono font-bold text-slate-300">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{xp.toLocaleString("no-NO")}</span>
          <span className="text-[10px] text-slate-400 font-normal">XP</span>
        </div>
      </button>

      {/* Modal: Full User Progress & Achievements */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-fadeIn text-slate-100">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header: Current Rank Hero */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent border border-slate-800 rounded-2xl mb-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border-2 border-amber-400/40 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/10 flex-shrink-0">
                {level.badgeIcon}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  Ditt Epistemiske Erkjennelsesnivå
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Nivå {level.level}: {level.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  "{level.description}"
                </p>
              </div>

              {/* Total XP Highlight */}
              <div className="text-center sm:text-right bg-slate-950/80 px-4 py-3 rounded-xl border border-slate-800 flex-shrink-0">
                <div className="text-[10px] uppercase font-mono text-slate-400">Total Erfaring</div>
                <div className="text-xl font-black font-mono text-amber-400 flex items-center justify-center sm:justify-end gap-1">
                  <Sparkles className="w-4 h-4" /> {xp.toLocaleString("no-NO")} XP
                </div>
              </div>
            </div>

            {/* Progress to Next Level Bar */}
            {nextLevel ? (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 mb-6">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-semibold text-slate-300">
                    Fremgang mot <strong className="text-white">{nextLevel.title}</strong>
                  </span>
                  <span className="font-mono text-amber-400 font-bold">
                    {xp} / {nextLevel.minXp} XP ({progressToNextLevel}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${progressToNextLevel}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 mt-1.5 text-right">
                  {nextLevel.minXp - xp} XP gjenstår til neste nivå
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-500/10 border border-amber-400/30 rounded-xl mb-6 text-center text-xs text-amber-300 font-semibold">
                👑 Du har nådd det absolutte toppnivået: Erkjennelsens Arkitekt!
              </div>
            )}

            {/* XP Breakdown by Source */}
            <div className="mb-6">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Kilde til opptjente erfaringpoeng (XP)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                    <Sliders className="w-3 h-3 text-cyan-400" /> Fysikk-Lab
                  </div>
                  <div className="text-base font-bold font-mono text-cyan-300">
                    {categoryStats.sim} XP
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                    <Brain className="w-3 h-3 text-amber-400" /> Blindsoner
                  </div>
                  <div className="text-base font-bold font-mono text-amber-300">
                    {categoryStats.blindspot} XP
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                    <Target className="w-3 h-3 text-emerald-400" /> Kalibrering
                  </div>
                  <div className="text-base font-bold font-mono text-emerald-300">
                    {categoryStats.calibration} XP
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                    <Compass className="w-3 h-3 text-purple-400" /> Uvitenhetskart
                  </div>
                  <div className="text-base font-bold font-mono text-purple-300">
                    {categoryStats.frontier} XP
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements Section */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Epistemiske Bragder ({unlockedCount} av {achievements.length} opplåst)
                </h4>

                {/* Filter Tabs */}
                <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                  <button
                    onClick={() => setAchievementFilter("all")}
                    className={`px-2 py-0.5 rounded font-medium ${
                      achievementFilter === "all" ? "bg-slate-800 text-white" : "text-slate-400"
                    }`}
                  >
                    Alle
                  </button>
                  <button
                    onClick={() => setAchievementFilter("unlocked")}
                    className={`px-2 py-0.5 rounded font-medium ${
                      achievementFilter === "unlocked" ? "bg-slate-800 text-white" : "text-slate-400"
                    }`}
                  >
                    Låst opp ({unlockedCount})
                  </button>
                  <button
                    onClick={() => setAchievementFilter("locked")}
                    className={`px-2 py-0.5 rounded font-medium ${
                      achievementFilter === "locked" ? "bg-slate-800 text-white" : "text-slate-400"
                    }`}
                  >
                    Gjenstående ({achievements.length - unlockedCount})
                  </button>
                </div>
              </div>

              {/* Achievements Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {filteredAchievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                      ach.isUnlocked
                        ? "bg-slate-950/80 border-amber-500/40 text-slate-200"
                        : "bg-slate-950/30 border-slate-800 text-slate-500 opacity-60"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${
                        ach.isUnlocked
                          ? "bg-amber-500/20 border border-amber-500/30 text-amber-300"
                          : "bg-slate-800/40 border border-slate-800"
                      }`}
                    >
                      {ach.isUnlocked ? ach.icon : <Lock className="w-4 h-4 text-slate-500" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold ${ach.isUnlocked ? "text-white" : "text-slate-400"}`}>
                          {ach.title}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-amber-400/90">
                          +{ach.xpReward} XP
                        </span>
                      </div>
                      <p className="text-[11px] leading-tight text-slate-400 mt-0.5">
                        {ach.description}
                      </p>
                      {ach.isUnlocked && ach.unlockedAt && (
                        <div className="text-[9px] font-mono text-emerald-400/80 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Låst opp
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Controls: Truth Guarantee, Audio Toggle, Reset */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                {/* Epistemic Truth Guarantee Button */}
                <button
                  onClick={() => setIsTruthModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg flex items-center gap-1.5 transition-colors font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Sannhetsgaranti & Kilder
                </button>

                {/* Sound Toggle */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
                  title="Skru av eller på lydeffekter"
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Lyd på
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-slate-500" /> Lyd av
                    </>
                  )}
                </button>
              </div>

              {/* Reset button */}
              <button
                onClick={() => {
                  if (confirm("Er du sikker på at du vil nullstille din erfaring og bragder?")) {
                    resetProgress();
                  }
                }}
                className="text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Nullstill data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sannhetsgaranti Modal */}
      <EpistemicTruthModal
        isOpen={isTruthModalOpen}
        onClose={() => setIsTruthModalOpen(false)}
      />
    </>
  );
}
