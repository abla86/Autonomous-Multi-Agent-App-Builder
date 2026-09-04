import React, { useState } from "react";
import {
  Brain,
  Sliders,
  Compass,
  Target,
  Sparkles,
  Zap,
  Info,
  Lightbulb,
  Layers,
  Clock
} from "lucide-react";
import { BlindspotDetective } from "./components/blindspot/BlindspotDetective";
import { FrontiersMap } from "./components/frontiers/FrontiersMap";
import { CalibrationArena } from "./components/calibration/CalibrationArena";
import { MontyHallSimulator } from "./components/simulations/MontyHallSimulator";
import { PaperFoldSimulator } from "./components/simulations/PaperFoldSimulator";
import { BicyclePhysicsSimulator } from "./components/simulations/BicyclePhysicsSimulator";
import { TimeDilationSimulator } from "./components/simulations/TimeDilationSimulator";

type TabType = "detective" | "simulators" | "frontiers" | "calibration";
type SimType = "monty" | "paper" | "bicycle" | "time";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("detective");
  const [activeSim, setActiveSim] = useState<SimType>("monty");
  const [probeTopic, setProbeTopic] = useState<string>("");

  const handleSelectTopicFromFrontier = (topic: string) => {
    setProbeTopic(topic);
    setActiveTab("detective");
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-900">
      {/* Top Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-gradient-to-b from-indigo-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-indigo-500 to-teal-400 p-[1.5px] flex items-center justify-center shadow-lg shadow-amber-500/10">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Brain className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                Terra Incognita
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  KunnskapsLab
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Utforsk det du ikke visste at du ikke visste
              </p>
            </div>
          </div>

          {/* Navigation Pill Buttons */}
          <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("detective")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "detective"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Blindsonesøker</span>
            </button>

            <button
              onClick={() => setActiveTab("simulators")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "simulators"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fysikk-Lab</span>
            </button>

            <button
              onClick={() => setActiveTab("frontiers")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "frontiers"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Uvitenhetskartet</span>
            </button>

            <button
              onClick={() => setActiveTab("calibration")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "calibration"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kalibrering</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* TAB 1: SOCRATIC BLINDSPOT DETECTIVE */}
        {activeTab === "detective" && <BlindspotDetective />}

        {/* TAB 2: INTERACTIVE SIMULATORS */}
        {activeTab === "simulators" && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-2">
                    <Zap className="w-3.5 h-3.5" /> Interaktive Laboratorier
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Motintuitive Sandkasser
                  </h2>
                  <p className="text-sm text-slate-300">
                    Test dine sanser mot sannsynlighet, skala, mekanikk og romtid.
                  </p>
                </div>

                {/* Sub-tabs for simulators */}
                <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setActiveSim("monty")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      activeSim === "monty"
                        ? "bg-cyan-500 text-slate-950 font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Monty Hall
                  </button>
                  <button
                    onClick={() => setActiveSim("paper")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      activeSim === "paper"
                        ? "bg-cyan-500 text-slate-950 font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Papirbretting
                  </button>
                  <button
                    onClick={() => setActiveSim("bicycle")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      activeSim === "bicycle"
                        ? "bg-cyan-500 text-slate-950 font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Sykkelens Fysikk
                  </button>
                  <button
                    onClick={() => setActiveSim("time")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      activeSim === "time"
                        ? "bg-cyan-500 text-slate-950 font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Tidsdilatasjon
                  </button>
                </div>
              </div>
            </div>

            {/* Active Simulation */}
            {activeSim === "monty" && <MontyHallSimulator />}
            {activeSim === "paper" && <PaperFoldSimulator />}
            {activeSim === "bicycle" && <BicyclePhysicsSimulator />}
            {activeSim === "time" && <TimeDilationSimulator />}
          </div>
        )}

        {/* TAB 3: HUMANITY'S FRONTIERS MAP */}
        {activeTab === "frontiers" && (
          <FrontiersMap onSelectTopicForProbe={handleSelectTopicFromFrontier} />
        )}

        {/* TAB 4: CALIBRATION ARENA */}
        {activeTab === "calibration" && <CalibrationArena />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Terra Incognita KunnskapsLab – Dedikert til menneskelig nysgjerrighet og metakognisjon.</span>
          </div>
          <div className="text-slate-400">
            Drevet av Gemini 3.8 Flash & Førsteprinsipper
          </div>
        </div>
      </footer>
    </div>
  );
}
