import React, { useState, useEffect, useRef } from "react";
import { Compass, RotateCw, AlertTriangle, CheckCircle, Info, Sparkles } from "lucide-react";
import { useUserProgress } from "../../context/UserProgressContext";

export function BicyclePhysicsSimulator() {
  const { awardXP } = useUserProgress();
  const [speed, setSpeed] = useState<number>(15); // km/h
  const [gyroEnabled, setGyroEnabled] = useState<boolean>(true);
  const [casterTrail, setCasterTrail] = useState<"positive" | "zero" | "negative">("positive");
  const [leanAngle, setLeanAngle] = useState<number>(0); // degrees
  const [steerAngle, setSteerAngle] = useState<number>(0); // degrees
  const [isSimulatingFall, setIsSimulatingFall] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("Sykkelen er i stabil likevekt.");
  const hasAwardedGyroDefier = useRef(false);

  // Simulate self-correcting dynamics or tipping over
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (Math.abs(leanAngle) > 0.1) {
      interval = setInterval(() => {
        setLeanAngle((currentLean) => {
          // If speed is 0 or negative trail without gyro, it collapses
          if (speed < 4) {
            const nextLean = currentLean * 1.15;
            if (Math.abs(nextLean) > 40) {
              setStatusMessage("💥 Veltet! Ved for lav fart rekker ikke forhjulet å hente inn tyngdepunktet.");
              return nextLean > 0 ? 45 : -45;
            }
            return nextLean;
          }

          if (casterTrail === "negative" && !gyroEnabled) {
            const nextLean = currentLean * 1.2;
            if (Math.abs(nextLean) > 40) {
              setStatusMessage("💥 Veltet! Negativ trail og ingen gyro gjør styringen ustabil.");
              return nextLean > 0 ? 45 : -45;
            }
            return nextLean;
          }

          // Caster trail steers front wheel into the fall
          // Auto-recovery:
          const recoveryFactor = casterTrail === "positive" ? 0.65 : 0.88;
          const nextLean = currentLean * recoveryFactor;
          setSteerAngle(nextLean * 0.7);

          if (Math.abs(nextLean) < 0.5) {
            setStatusMessage("✅ Gjenopprettet! Forhjulet svingte automatisk inn i fallet og flyttet hjulene under tyngdepunktet.");
            if (!gyroEnabled && casterTrail === "positive" && !hasAwardedGyroDefier.current) {
              hasAwardedGyroDefier.current = true;
              awardXP(60, "Sykkelens Hemmelighet: Selvopprettet UTEN gyroskopisk kraft!", "sim", "bicycle_gyro");
            }
            return 0;
          }
          return nextLean;
        });
      }, 70);
    } else {
      setSteerAngle(0);
    }
    return () => clearInterval(interval);
  }, [leanAngle, speed, casterTrail, gyroEnabled, awardXP]);

  const nudgeBike = (direction: "left" | "right") => {
    const nudge = direction === "left" ? -18 : 18;
    setLeanAngle(nudge);
    setSteerAngle(direction === "left" ? -12 : 12);
    setStatusMessage(`Sykkelen dyttes mot ${direction === "left" ? "venstre" : "høyre"}! Følg med på forhjulet...`);
  };

  const resetBike = () => {
    setLeanAngle(0);
    setSteerAngle(0);
    setStatusMessage("Sykkelen er i ro og oppreist.");
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" /> 100 år med lærebokfeil
          </div>
          <h3 className="text-xl font-bold text-white">Sykkelens Selvoppretting</h3>
          <p className="text-sm text-slate-400">
            Hvorfor holder sykkelen seg oppreist? Skru av gyroskopet og se hva som skjer!
          </p>
        </div>
        <button
          onClick={resetBike}
          className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          Nullstill helning
        </button>
      </div>

      {/* Interactive 2D Bicycle Canvas / SVG */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden mb-6">
        <div className="text-xs text-slate-400 font-mono mb-2">
          Visning bakfra / dynamisk respons
        </div>

        {/* Dynamic Bike SVG */}
        <div className="w-64 h-56 flex items-center justify-center relative">
          {/* Ground line */}
          <div className="absolute bottom-6 w-full h-1 bg-slate-800 rounded-full" />

          {/* Bike Group rotated by leanAngle */}
          <div
            className="transition-transform duration-100 ease-out origin-bottom flex flex-col items-center"
            style={{
              transform: `rotate(${leanAngle}deg)`,
              transformOrigin: "50% 90%",
            }}
          >
            {/* Center of Mass Indicator */}
            <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
              Massesenter (CoM)
            </div>

            {/* Handlebars */}
            <div
              className="w-28 h-3 bg-slate-400 rounded-full relative flex items-center justify-center transition-transform duration-100"
              style={{
                transform: `rotate(${steerAngle}deg)`,
              }}
            >
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>

            {/* Frame Stem */}
            <div className="w-3 h-20 bg-slate-600 rounded-sm my-0.5" />

            {/* Rear / Front Wheel */}
            <div className="w-16 h-16 rounded-full border-4 border-slate-300 flex items-center justify-center relative shadow-lg">
              <div
                className={`w-1 h-full bg-slate-500 rounded ${
                  speed > 0 && gyroEnabled ? "animate-spin" : ""
                }`}
              />
              <div
                className={`h-1 w-full bg-slate-500 rounded absolute ${
                  speed > 0 && gyroEnabled ? "animate-spin" : ""
                }`}
              />
            </div>

            {/* Contact patch point */}
            <div className="w-3 h-1.5 bg-cyan-400 rounded-full mt-0.5" />
          </div>
        </div>

        {/* Status pill */}
        <div className="mt-2 text-xs font-medium px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 max-w-md text-center">
          {statusMessage}
        </div>
      </div>

      {/* Physics Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Nudge Controls */}
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Påfør forstyrrelse (dytt i fart)
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => nudgeBike("left")}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              👈 Dytt venstre
            </button>
            <button
              onClick={() => nudgeBike("right")}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              Dytt høyre 👉
            </button>
          </div>
        </div>

        {/* Gyro Toggle */}
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300">
              Gyroskopisk spinn (Hjulrotasjon)
            </label>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                gyroEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
              }`}
            >
              {gyroEnabled ? "Aktiv" : "Kansellert (0)"}
            </span>
          </div>
          <button
            onClick={() => setGyroEnabled(!gyroEnabled)}
            className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors border ${
              gyroEnabled
                ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                : "bg-amber-500/20 text-amber-300 border-amber-500/40"
            }`}
          >
            {gyroEnabled ? "Slå AV gyroskop (Science 2011)" : "Slå PÅ gyroskop"}
          </button>
        </div>

        {/* Speed Slider */}
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-300">Hastighet</label>
            <span className="font-mono text-xs text-amber-400 font-bold">{speed} km/t</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 mt-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0 (velter)</span>
            <span>15 (stabil)</span>
            <span>30 (lynrask)</span>
          </div>
        </div>
      </div>

      {/* The Big Scientific Takeaway */}
      <div className="p-4 bg-indigo-950/40 border border-indigo-500/20 rounded-xl text-xs text-indigo-200/90 leading-relaxed">
        <strong className="text-white block mb-1">Hvorfor lærebøkene tok feil:</strong>
        I over et århundre påsto fysikklærebøker at roterende hjul (gyroskoper) holdt sykkelen oppe. Men hvis du slår av gyroskopet ovenfor, ser du at sykkelen <em>fremdeles</em> retter seg opp hvis den har fart! Den virkelige hemmeligheten er styregeometrien: Når sykkelen lener seg mot høyre, gjør forgaffelens geometri at forhjulet svinger mot høyre fortere enn sykkelen velter, og styrer kontaktpunktet tilbake under massesenteret.
      </div>
    </div>
  );
}
