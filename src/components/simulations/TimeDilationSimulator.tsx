import React, { useState, useEffect } from "react";
import { Clock, Rocket, Zap, Award } from "lucide-react";

export function TimeDilationSimulator() {
  const [velocityPercent, setVelocityPercent] = useState<number>(86.6); // 86.6% gives gamma = 2.0!
  const [earthSeconds, setEarthSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // v as fraction of c (0 to 0.999)
  const v = velocityPercent / 100;
  // Lorentz factor: gamma = 1 / sqrt(1 - v^2)
  const gamma = 1 / Math.sqrt(Math.max(0.0001, 1 - v * v));
  // Ship time = earthSeconds / gamma
  const shipSeconds = earthSeconds / gamma;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setEarthSeconds((prev) => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const resetClock = () => {
    setEarthSeconds(0);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-2">
            <Clock className="w-3.5 h-3.5" /> Spesiell relativitet
          </div>
          <h3 className="text-xl font-bold text-white">Tidsdilatasjons-Laboratoriet</h3>
          <p className="text-sm text-slate-400">
            Juster romskipets hastighet mot lysets fart (c) og se Einsteins lysklokke strekke tiden!
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isRunning ? "Pause" : "Fortsett"}
          </button>
          <button
            onClick={resetClock}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Nullstill klokker
          </button>
        </div>
      </div>

      {/* Sliders and Lorentz Factor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-300">
              Hastighet: <span className="font-mono text-purple-400">{velocityPercent}%</span> av lysets hastighet (<code className="text-xs text-slate-400">c</code>)
            </span>
            <span className="text-xs font-mono text-slate-400">{(v * 299792).toFixed(0)} km/s</span>
          </div>
          <input
            type="range"
            min="0"
            max="99.5"
            step="0.1"
            value={velocityPercent}
            onChange={(e) => setVelocityPercent(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400 mt-2"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
            <span>0% (jorden)</span>
            <span>86.6% (2x saktere)</span>
            <span>99.5% (10x saktere!)</span>
          </div>
        </div>

        {/* Lorentz Factor Card */}
        <div className="p-4 bg-gradient-to-br from-purple-950/40 to-slate-950 border border-purple-500/20 rounded-xl flex flex-col justify-center">
          <span className="text-[11px] uppercase tracking-wider text-purple-300 font-semibold mb-1">
            Lorentz-faktor (γ)
          </span>
          <div className="text-3xl font-black text-white font-mono">
            {gamma.toFixed(3)}×
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            1 sekund i romskipet = {gamma.toFixed(2)} sekunder på jorden
          </span>
        </div>
      </div>

      {/* Twin Clocks Visual Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Earth Clock */}
        <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-2xl">
            🌍
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-blue-400 font-semibold">
              Jord-tvillingens klokke
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {earthSeconds.toFixed(1)} <span className="text-xs text-slate-400 font-normal">sekunder</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              I ro i et inertialsystem
            </div>
          </div>
        </div>

        {/* Ship Clock */}
        <div className="p-5 bg-slate-950/80 border border-purple-500/30 rounded-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl">
            🚀
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-purple-400 font-semibold">
              Astronaut-tvillingens klokke
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {shipSeconds.toFixed(1)} <span className="text-xs text-slate-400 font-normal">sekunder</span>
            </div>
            <div className="text-[11px] text-purple-300/80 mt-0.5">
              Beveger seg med {(v * 100).toFixed(1)}% av c
            </div>
          </div>
        </div>
      </div>

      {/* Explanation Box */}
      <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
        <strong className="text-purple-300">Det dype paradokset:</strong>
        Lysets hastighet (<code className="text-purple-300">c</code>) er nøyaktig den samme for alle observatører, uansett hvor fort de beveger seg. For at lyset skal tilbakelegge den lengre, diagonale banen inni et romskip i bevegelse og likevel beholde konstant fart, <em>må selve tiden tikke saktere</em>. Tiden er ikke en universell elv, men en elastisk dimensjon!
      </div>
    </div>
  );
}
