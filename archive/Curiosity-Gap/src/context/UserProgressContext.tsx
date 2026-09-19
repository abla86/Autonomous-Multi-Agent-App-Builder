import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { UserLevel, Achievement, XPTransaction, XPCategory } from "../types";
import { LEVELS, ACHIEVEMENTS } from "../data/progressData";

const STORAGE_KEY = "terra_incognita_progress_v2";

interface NotificationItem {
  id: string;
  amount: number;
  reason: string;
  isLevelUp?: boolean;
  levelTitle?: string;
}

interface UserProgressContextType {
  xp: number;
  level: UserLevel;
  nextLevel: UserLevel | null;
  progressToNextLevel: number; // 0 - 100
  awardXP: (amount: number, reason: string, category: XPCategory, achievementId?: string) => void;
  achievements: (Achievement & { isUnlocked: boolean })[];
  recentTransactions: XPTransaction[];
  notifications: NotificationItem[];
  dismissNotification: (id: string) => void;
  resetProgress: () => void;
  categoryStats: Record<XPCategory, number>;
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

// Web Audio synthesizer for crisp, subtle epistemic audio feedback
function playSound(type: "xp" | "levelup" | "achievement") {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "xp") {
      // Pleasant light chime
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === "levelup") {
      // Harmonic major chord triad
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(freq, now + idx * 0.08);
        g.gain.setValueAtTime(0.09, now + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + idx * 0.08);
        o.stop(now + idx * 0.08 + 0.35);
      });
    } else if (type === "achievement") {
      // Bright celebratory arpeggio
      [659.25, 830.61, 987.77].forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(freq, now + idx * 0.06);
        g.gain.setValueAtTime(0.07, now + idx * 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + idx * 0.06);
        o.stop(now + idx * 0.06 + 0.25);
      });
    }
  } catch {
    // Gracefully ignore audio errors (e.g. autoplay block)
  }
}

export const UserProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [xp, setXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed.xp === "number" ? parsed.xp : 80;
      }
    } catch {}
    return 80; // Starting baseline XP
  });

  const [unlockedAchievements, setUnlockedAchievements] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.unlockedAchievements || {};
      }
    } catch {}
    return {};
  });

  const [transactions, setTransactions] = useState<XPTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.transactions || [];
      }
    } catch {}
    return [
      {
        id: "init",
        amount: 80,
        reason: "Velkommen til Terra Incognita KunnskapsLab!",
        category: "blindspot",
        timestamp: Date.now(),
      },
    ];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          xp,
          unlockedAchievements,
          transactions: transactions.slice(0, 40),
        })
      );
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  }, [xp, unlockedAchievements, transactions]);

  // Derive current level
  const currentLevel =
    [...LEVELS].reverse().find((lvl) => xp >= lvl.minXp) || LEVELS[0];
  const nextLevelIndex = LEVELS.findIndex((l) => l.level === currentLevel.level) + 1;
  const nextLevel = nextLevelIndex < LEVELS.length ? LEVELS[nextLevelIndex] : null;

  // Calculate percentage to next level
  let progressToNextLevel = 100;
  if (nextLevel) {
    const range = nextLevel.minXp - currentLevel.minXp;
    const progress = xp - currentLevel.minXp;
    progressToNextLevel = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
  }

  // Dismiss notification helper
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Award XP function
  const awardXP = useCallback(
    (amount: number, reason: string, category: XPCategory, achievementId?: string) => {
      setXp((prevXp) => {
        const newXp = prevXp + amount;
        const oldLvl = [...LEVELS].reverse().find((lvl) => prevXp >= lvl.minXp) || LEVELS[0];
        const newLvl = [...LEVELS].reverse().find((lvl) => newXp >= lvl.minXp) || LEVELS[0];

        const isLevelUp = newLvl.level > oldLvl.level;

        // Sound & Confetti
        if (soundEnabled) {
          if (isLevelUp) {
            playSound("levelup");
          } else if (achievementId) {
            playSound("achievement");
          } else {
            playSound("xp");
          }
        }

        if (isLevelUp) {
          confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.4 },
            colors: ["#f59e0b", "#6366f1", "#10b981", "#ec4899"],
          });
        }

        // Add toast notification
        const notifId = `${Date.now()}-${Math.random()}`;
        setNotifications((prev) => [
          ...prev.slice(-3),
          {
            id: notifId,
            amount,
            reason,
            isLevelUp,
            levelTitle: isLevelUp ? newLvl.title : undefined,
          },
        ]);

        // Auto dismiss after 4.5s
        setTimeout(() => {
          dismissNotification(notifId);
        }, 4500);

        return newXp;
      });

      // Track transaction
      const newTx: XPTransaction = {
        id: `${Date.now()}-${Math.random()}`,
        amount,
        reason,
        category,
        timestamp: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev.slice(0, 39)]);

      // Handle achievement unlock
      if (achievementId && !unlockedAchievements[achievementId]) {
        setUnlockedAchievements((prev) => ({
          ...prev,
          [achievementId]: new Date().toISOString(),
        }));
      }
    },
    [soundEnabled, unlockedAchievements, dismissNotification]
  );

  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setXp(50);
    setUnlockedAchievements({});
    setTransactions([
      {
        id: "reset",
        amount: 50,
        reason: "Nullstilte erfaringspoeng.",
        category: "blindspot",
        timestamp: Date.now(),
      },
    ]);
  }, []);

  // Category stats
  const categoryStats: Record<XPCategory, number> = {
    sim: 0,
    blindspot: 0,
    calibration: 0,
    frontier: 0,
  };

  transactions.forEach((tx) => {
    if (categoryStats[tx.category] !== undefined) {
      categoryStats[tx.category] += tx.amount;
    }
  });

  const mergedAchievements = ACHIEVEMENTS.map((ach) => ({
    ...ach,
    isUnlocked: !!unlockedAchievements[ach.id],
    unlockedAt: unlockedAchievements[ach.id],
  }));

  return (
    <UserProgressContext.Provider
      value={{
        xp,
        level: currentLevel,
        nextLevel,
        progressToNextLevel,
        awardXP,
        achievements: mergedAchievements,
        recentTransactions: transactions,
        notifications,
        dismissNotification,
        resetProgress,
        categoryStats,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      {children}

      {/* Floating XP Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`pointer-events-auto p-3.5 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-fadeIn max-w-sm flex items-start gap-3 ${
              notif.isLevelUp
                ? "bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-slate-900 border-amber-400/60 shadow-amber-500/20"
                : "bg-slate-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-500/10"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                notif.isLevelUp
                  ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30"
                  : "bg-emerald-500/20 border border-emerald-400/40 text-emerald-400"
              }`}
            >
              {notif.isLevelUp ? "👑" : `+${notif.amount}`}
            </div>
            <div className="flex-1 min-w-0">
              {notif.isLevelUp ? (
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                    Nytt Erkjennelsesnivå!
                  </div>
                  <div className="text-sm font-extrabold text-white">
                    {notif.levelTitle}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">{notif.reason}</div>
                </div>
              ) : (
                <div>
                  <div className="text-[11px] font-mono font-semibold text-emerald-400">
                    +{notif.amount} XP Tildelt
                  </div>
                  <div className="text-xs font-medium text-slate-200 leading-snug">
                    {notif.reason}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => dismissNotification(notif.id)}
              className="text-slate-500 hover:text-slate-300 text-xs p-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </UserProgressContext.Provider>
  );
};

export function useUserProgress() {
  const context = useContext(UserProgressContext);
  if (!context) {
    throw new Error("useUserProgress must be used within a UserProgressProvider");
  }
  return context;
}
