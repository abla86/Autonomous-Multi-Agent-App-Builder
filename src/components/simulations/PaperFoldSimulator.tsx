import React, { useState } from "react";
import { Layers, Rocket, Globe, Sparkles } from "lucide-react";

interface Milestone {
  folds: number;
  label: string;
  equivalent: string;
  icon: string;
}

const MILESTONES: Milestone[] = [
  { folds: 0, label: "0 brett", equivalent: "0.1 mm (et vanlig A4-ark)", icon: "📄" },
  { folds: 7, label: "7 brett", equivalent: "1.28 cm (en notatblokk)", icon: "📒" },
  { folds: 14, label: "14 brett", equivalent: "1.64 meter (omtrent et menneske)", icon: "🧍" },
  { folds: 18, label: "18 brett", equivalent: "26.2 meter (et 8-etasjers bygg)", icon: "🏢" },
  { folds: 23, label: "23 brett", equivalent: "839 meter (høyere enn Burj Khalifa)", icon: "🏙️" },
  { folds: 30, label: "30 brett", equivalent: "107 km (kanten av verdensrommet, Kármán-linjen)", icon: "🛰️" },
  { folds: 36, label: "36 brett", equivalent: "6 871 km (jordens radius!)", icon: "🌍" },
  { folds: 42, label: "42 brett", equivalent: "439 804 km (forbi MÅNEN!)", icon: "🌕" },
  { folds: 51, label: "51 brett", equivalent: "225 millioner km (helt til SOLEN!)", icon: "☀️" },
];

export function PaperFoldSimulator() {
  const [folds, setFolds] = useState<number>(0);

  // Thickness in meters: 0.0001m * 2^folds
  const thicknessMeters = 0.0001 * Math.pow(2, folds);

  const formatDistance = (meters: number) => {
    if (meters < 0.001) return `${(meters * 1000).toFixed(2)} mm`;
    if (meters < 1) return `${(meters * 100).toFixed(2)} cm`;
    if (meters < 1000) return `${meters.toFixed(2)} meter`;
    if (meters < 1000000) return `${(meters / 1000).toLocaleString("no-NO", { maximumFractionDigits: 1 })} km`;
    return `${(meters / 1000).toLocaleString("no-NO", { maximumFractionDigits: 0 })} km`;
  };

  // Find nearest milestone
  const currentMilestone = [...MILESTONES].reverse().find((m) => folds >= m.folds) || MILESTONES[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" /> Eksponentiell blindhet
          </div>
          <h3 className="text-xl font-bold text-white">Papirbrette-Paradokset</h3>
          <p className="text-sm text-slate-400">
            Dra i slideren for å brette et 0.1 mm ark i to. Hvor mange brett før du når månen?
          </p>
        </div>
      </div>

      {/* Main Interactive Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-8">
        {/* Left Column: Visual Stacking */}
        <div className="md:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden">
          <div className="text-6xl mb-3 transition-transform duration-300 transform scale-110">
            {currentMilestone.icon}
          </div>

          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
            Nåværende målestokk
          </div>
          <div className="text-lg font-bold text-center text-cyan-300">
            {currentMilestone.equivalent}
          </div>

          {/* Stacking layer visualization */}
          <div className="w-48 h-8 mt-6 bg-slate-900 border border-slate-800 rounded-lg relative overflow-hidden flex items-end justify-center p-1">
            <div
              className="w-full bg-gradient-to-t from-cyan-500 to-teal-400 rounded transition-all duration-300"
              style={{
                height: `${Math.min(100, Math.max(8, (folds / 52) * 100))}%`,
              }}
            />
          </div>
          <span className="text-[11px] text-slate-500 mt-2 font-mono">
            {Math.pow(2, folds).toLocaleString("no-NO")} lag papir
          </span>
        </div>

        {/* Right Column: Values and Slider */}
        <div className="md:col-span-7 space-y-5">
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs text-slate-400 font-medium">Antall brett:</span>
              <span className="text-3xl font-black text-amber-400 font-mono">{folds}</span>
            </div>

            <input
              type="range"
              min="0"
              max="52"
              value={folds}
              onChange={(e) => setFolds(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
              <span>0 (0.1 mm)</span>
              <span>23 (Burj Khalifa)</span>
              <span>42 (Månen!)</span>
              <span>51 (Solen!)</span>
            </div>
          </div>

          {/* Result Metric Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/20">
            <div className="text-xs text-cyan-400 font-semibold mb-1 uppercase tracking-wider">
              Beregnet tykkelse
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono break-words">
              {formatDistance(thicknessMeters)}
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Formel: <code className="text-cyan-300 font-mono">0.1 mm × 2^{folds}</code>. Hjernen vår forventer at 42 brett blir kanskje som en bok. I virkeligheten har du passert månen med over 50 000 km!
            </p>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-2">
            {[0, 14, 23, 30, 42, 51].map((f) => (
              <button
                key={f}
                onClick={() => setFolds(f)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  folds === f
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {f} brett
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Epistemic takeaway */}
      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
        <strong className="text-cyan-300">Kognitiv innsikt:</strong> Menneskehjernen utviklet seg på den afrikanske savannen for å spore lineære bevegelser (et spyd kastes, et byttedyr løper 20 meter). Vi mangler sanseorgan for geometrisk vekst. Dette kunnskapshullet forklarer hvorfor samfunnet konsekvent undervurderer pandemispredning, klimatiske vippepunkter og renters rente.
      </div>
    </div>
  );
}
