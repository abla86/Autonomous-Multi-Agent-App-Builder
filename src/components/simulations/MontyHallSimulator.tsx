import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Play, RotateCcw, Award, HelpCircle, Zap } from "lucide-react";

export function MontyHallSimulator() {
  const [carDoor, setCarDoor] = useState<number>(() => Math.floor(Math.random() * 3));
  const [selectedDoor, setSelectedDoor] = useState<number | null>(null);
  const [revealedGoatDoor, setRevealedGoatDoor] = useState<number | null>(null);
  const [finalDoor, setFinalDoor] = useState<number | null>(null);
  const [gameStage, setGameStage] = useState<"pick" | "decide" | "finished">("pick");

  // Multi-run stats
  const [switchWins, setSwitchWins] = useState<number>(0);
  const [switchTotal, setSwitchTotal] = useState<number>(0);
  const [stayWins, setStayWins] = useState<number>(0);
  const [stayTotal, setStayTotal] = useState<number>(0);
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false);

  const resetSingleGame = () => {
    setCarDoor(Math.floor(Math.random() * 3));
    setSelectedDoor(null);
    setRevealedGoatDoor(null);
    setFinalDoor(null);
    setGameStage("pick");
  };

  const handlePickDoor = (doorIndex: number) => {
    if (gameStage !== "pick") return;
    setSelectedDoor(doorIndex);

    // Host reveals a goat door that is neither chosen nor has the car
    const availableDoors = [0, 1, 2].filter((d) => d !== doorIndex && d !== carDoor);
    const chosenGoat = availableDoors[Math.floor(Math.random() * availableDoors.length)];
    setRevealedGoatDoor(chosenGoat);
    setGameStage("decide");
  };

  const handleFinalChoice = (switchChoice: boolean) => {
    if (gameStage !== "decide" || selectedDoor === null || revealedGoatDoor === null) return;

    let chosen: number;
    if (switchChoice) {
      chosen = [0, 1, 2].find((d) => d !== selectedDoor && d !== revealedGoatDoor)!;
      setFinalDoor(chosen);
      setSwitchTotal((prev) => prev + 1);
      if (chosen === carDoor) {
        setSwitchWins((prev) => prev + 1);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      }
    } else {
      chosen = selectedDoor;
      setFinalDoor(chosen);
      setStayTotal((prev) => prev + 1);
      if (chosen === carDoor) {
        setStayWins((prev) => prev + 1);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      }
    }
    setGameStage("finished");
  };

  const runBatchSimulation = (count: number) => {
    setIsAutoRunning(true);
    let newSwitchWins = switchWins;
    let newSwitchTotal = switchTotal + count;
    let newStayWins = stayWins;
    let newStayTotal = stayTotal + count;

    for (let i = 0; i < count; i++) {
      const actualCar = Math.floor(Math.random() * 3);
      const initialPick = Math.floor(Math.random() * 3);

      // In switch strategy:
      // If initial pick was car, switching loses. If initial was goat, switching ALWAYS lands on car!
      if (initialPick !== actualCar) {
        newSwitchWins++;
      }
      // In stay strategy:
      // If initial pick was car, you win.
      if (initialPick === actualCar) {
        newStayWins++;
      }
    }

    setTimeout(() => {
      setSwitchWins(newSwitchWins);
      setSwitchTotal(newSwitchTotal);
      setStayWins(newStayWins);
      setStayTotal(newStayTotal);
      setIsAutoRunning(false);
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    }, 350);
  };

  const resetAllStats = () => {
    setSwitchWins(0);
    setSwitchTotal(0);
    setStayWins(0);
    setStayTotal(0);
    resetSingleGame();
  };

  const switchWinRate = switchTotal > 0 ? ((switchWins / switchTotal) * 100).toFixed(1) : "0.0";
  const stayWinRate = stayTotal > 0 ? ((stayWins / stayTotal) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-2">
            <Zap className="w-3.5 h-3.5" /> Sannsynlighetens største intuisjonsfelle
          </div>
          <h3 className="text-xl font-bold text-white">Monty Hall Laboratoriet</h3>
          <p className="text-sm text-slate-400">
            Hvorfor '50/50' er feil, og hvorfor bytting dobler vinnersjansene dine.
          </p>
        </div>
        <button
          onClick={resetSingleGame}
          className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Ny runde
        </button>
      </div>

      {/* Stage Instruction */}
      <div className="mb-6 text-center">
        {gameStage === "pick" && (
          <p className="text-amber-300 font-medium text-sm animate-pulse">
            Trinn 1: Velg én av de 3 dørene nedenfor. Bak én skjuler det seg en sportsbil!
          </p>
        )}
        {gameStage === "decide" && (
          <div className="p-3 bg-indigo-950/60 border border-indigo-500/30 rounded-xl max-w-lg mx-auto">
            <p className="text-indigo-200 text-sm font-medium mb-3">
              Verten åpnet dør {revealedGoatDoor! + 1} og viste en geit! Vil du holde fast ved dør {selectedDoor! + 1} eller bytte?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => handleFinalChoice(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all hover:scale-105"
              >
                Bli stående (Dør {selectedDoor! + 1})
              </button>
              <button
                onClick={() => handleFinalChoice(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
              >
                Bytt dør! (Anbefalt matematisk)
              </button>
            </div>
          </div>
        )}
        {gameStage === "finished" && (
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 max-w-md mx-auto">
            <p className="font-bold text-sm">
              {finalDoor === carDoor ? (
                <span className="text-emerald-400 flex items-center justify-center gap-1.5">
                  <Award className="w-4 h-4" /> Gratulerer! Du vant sportsbilen!
                </span>
              ) : (
                <span className="text-rose-400">Desverre! Du fikk en geit.</span>
              )}
            </p>
            <button
              onClick={resetSingleGame}
              className="mt-2 text-xs text-amber-400 underline hover:text-amber-300"
            >
              Prøv en gang til
            </button>
          </div>
        )}
      </div>

      {/* 3 Doors Interactive Graphic */}
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
        {[0, 1, 2].map((doorIdx) => {
          const isSelected = selectedDoor === doorIdx;
          const isRevealedGoat = revealedGoatDoor === doorIdx;
          const isFinished = gameStage === "finished";
          const isWinner = isFinished && doorIdx === carDoor;
          const isFinal = isFinished && finalDoor === doorIdx;

          return (
            <div
              key={doorIdx}
              onClick={() => handlePickDoor(doorIdx)}
              className={`relative cursor-pointer transition-all duration-300 rounded-xl p-4 flex flex-col items-center justify-center min-h-[150px] border-2 select-none ${
                gameStage === "pick"
                  ? "hover:border-amber-400 hover:-translate-y-1 bg-slate-800/90 border-slate-700"
                  : ""
              } ${
                isSelected && gameStage === "decide"
                  ? "border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                  : ""
              } ${
                isRevealedGoat
                  ? "border-slate-700 bg-slate-900/60 opacity-80"
                  : ""
              } ${
                isFinished && isWinner
                  ? "border-emerald-500 bg-emerald-950/40 shadow-xl shadow-emerald-500/20 scale-105"
                  : ""
              } ${
                isFinished && !isWinner && isFinal
                  ? "border-rose-500 bg-rose-950/30"
                  : ""
              } ${
                !isSelected && !isRevealedGoat && gameStage === "decide"
                  ? "border-indigo-400/80 bg-indigo-950/20 hover:border-indigo-300"
                  : ""
              }`}
            >
              <div className="text-xs font-mono font-bold text-slate-400 mb-2">
                DØR {doorIdx + 1}
              </div>

              {/* Door Visual Inside */}
              <div className="text-3xl my-2">
                {isRevealedGoat && "🐐"}
                {isFinished && (doorIdx === carDoor ? "🏎️" : "🐐")}
                {!isRevealedGoat && !isFinished && (
                  <span className="text-slate-500">🚪</span>
                )}
              </div>

              {/* Status Tags */}
              {isSelected && gameStage === "decide" && (
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mt-1">
                  Ditt valg
                </span>
              )}
              {isRevealedGoat && (
                <span className="text-[10px] font-medium text-slate-400 mt-1">
                  Verten viste geit
                </span>
              )}
              {isFinished && isFinal && (
                <span className={`text-[10px] font-bold mt-1 uppercase ${isWinner ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isWinner ? "Seier!" : "Bom!"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Live Simulation Engine (Large Numbers Law) */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              Empirisk Bevismaskin: De store talls lov
            </h4>
            <p className="text-xs text-slate-400">
              Kjør tusenvis av runder på millisekunder og se sannsynligheten konvergere mot 66.7% vs 33.3%.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => runBatchSimulation(100)}
              disabled={isAutoRunning}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-md shadow-indigo-600/20"
            >
              <Play className="w-3 h-3" /> +100 runder
            </button>
            <button
              onClick={() => runBatchSimulation(1000)}
              disabled={isAutoRunning}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-md shadow-amber-600/20"
            >
              <Zap className="w-3 h-3" /> +1 000 runder
            </button>
            {(switchTotal > 0 || stayTotal > 0) && (
              <button
                onClick={resetAllStats}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
              >
                Nullstill
              </button>
            )}
          </div>
        </div>

        {/* Comparison Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Strategy: Switch */}
          <div className="p-3 bg-slate-900/90 rounded-lg border border-emerald-500/20">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-emerald-400">Strategi: ALLTID BYTT DØR</span>
              <span className="font-mono text-emerald-300 font-bold">{switchWinRate}% seire</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-1.5">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, Number(switchWinRate)))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{switchWins} gevinster av {switchTotal} runder</span>
              <span className="text-emerald-400/80">Teoretisk: 66.7%</span>
            </div>
          </div>

          {/* Strategy: Stay */}
          <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-300">Strategi: ALLTID BLI STÅENDE</span>
              <span className="font-mono text-slate-300 font-bold">{stayWinRate}% seire</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-1.5">
              <div
                className="bg-slate-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, Number(stayWinRate)))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{stayWins} gevinster av {stayTotal} runder</span>
              <span className="text-slate-400">Teoretisk: 33.3%</span>
            </div>
          </div>
        </div>

        {/* Intuition Reveal box */}
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-200/90 leading-relaxed">
          <strong>Hvorfor intuisjonen feiler:</strong> Når du velger dør først, er det 1/3 sjanse for at du har rett, og 2/3 sjanse for at bilen er bak én av de to andre. Fordi verten <em>alltid</em> må åpne en dør med geit, flytter hele 2/3-sannsynligheten seg over til den gjenværende døren!
        </div>
      </div>
    </div>
  );
}
