import React, { useState, useRef } from "react";
import {
  Play,
  Pause,
  Film,
  Download,
  Smartphone,
  CreditCard,
  Building2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { GeneratedLogo, GeneratedVideo, AnimationMode, VideoAspectRatio } from "../types";
import { LOGO_ANIMATION_PROMPTS } from "../data/presets";

interface LogoAnimatorProps {
  currentLogo: GeneratedLogo | null;
  savedLogos: GeneratedLogo[];
  onSelectLogo: (logo: GeneratedLogo) => void;
  onVideoGenerated: (video: GeneratedVideo) => void;
}

export const LogoAnimator: React.FC<LogoAnimatorProps> = ({
  currentLogo,
  savedLogos,
  onSelectLogo,
  onVideoGenerated,
}) => {
  // Motion animation presets
  const [animationMode, setAnimationMode] = useState<AnimationMode>("ambient-glow");
  const [isPlaying, setIsPlaying] = useState(true);
  const [motionSpeed, setMotionSpeed] = useState<number>(1);
  const [glowIntensity, setGlowIntensity] = useState<number>(50);
  const [activeMockup, setActiveMockup] = useState<"app-icon" | "business-card" | "signboard">("app-icon");

  // Veo AI Video generation state
  const [veoPrompt, setVeoPrompt] = useState(LOGO_ANIMATION_PROMPTS[0].prompt);
  const [veoAspectRatio, setVeoAspectRatio] = useState<VideoAspectRatio>("16:9");
  const [veoResolution, setVeoResolution] = useState<"720p" | "1080p">("720p");
  const [isGeneratingVeo, setIsGeneratingVeo] = useState(false);
  const [veoError, setVeoError] = useState<string | null>(null);
  const [generatedVeoVideo, setGeneratedVeoVideo] = useState<GeneratedVideo | null>(null);
  const [pollingStatus, setPollingStatus] = useState<string>("");

  // 3D tilt tracking ref
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (animationMode !== "3d-tilt" || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: (y / (rect.height / 2)) * -18,
      y: (x / (rect.width / 2)) * 18,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Veo video generation pipeline using veo-3.1-fast-generate-preview
  const handleGenerateVeoVideo = async () => {
    if (!currentLogo) {
      setVeoError("Please select or generate a logo first.");
      return;
    }

    setIsGeneratingVeo(true);
    setVeoError(null);
    setGeneratedVeoVideo(null);
    setPollingStatus("Contacting Veo 3.1 Fast video engine...");

    try {
      // Step 1: Start video generation
      const startRes = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: veoPrompt,
          imageBase64: currentLogo.imageUrl,
          aspectRatio: veoAspectRatio, // '16:9' or '9:16'
          resolution: veoResolution,
        }),
      });

      const startData = await startRes.json();
      if (!startRes.ok || !startData.operationName) {
        throw new Error(startData.error || "Failed to start Veo video generation.");
      }

      const opName = startData.operationName;
      setPollingStatus("Synthesizing fluid logo animation with Veo 3.1...");

      // Step 2: Poll operation status
      let isDone = false;
      let attempts = 0;
      const maxAttempts = 120;

      const poll = async () => {
        while (!isDone && attempts < maxAttempts) {
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 3500));

          if (attempts === 3) {
            setPollingStatus("Analyzing logo contours and specular reflections...");
          } else if (attempts === 8) {
            setPollingStatus("Generating cinematic camera movement & particle dynamics...");
          } else if (attempts === 15) {
            setPollingStatus("Encoding high-definition video frames...");
          }

          try {
            const statusRes = await fetch("/api/video-status", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ operationName: opName }),
            });

            const statusData = await statusRes.json();
            if (!statusRes.ok) {
              throw new Error(statusData.error || "Status check failed");
            }

            if (statusData.error) {
              throw new Error(statusData.error);
            }

            if (statusData.done && statusData.streamUrl) {
              isDone = true;
              const videoObj: GeneratedVideo = {
                id: "video-" + Date.now(),
                operationName: opName,
                streamUrl: statusData.streamUrl,
                prompt: veoPrompt,
                sourceImage: currentLogo.imageUrl,
                aspectRatio: veoAspectRatio,
                resolution: veoResolution,
                timestamp: Date.now(),
                title: `${currentLogo.companyName} Animated Logo`,
              };
              setGeneratedVeoVideo(videoObj);
              onVideoGenerated(videoObj);
              setPollingStatus("Video ready!");
              break;
            }
          } catch (pollErr: any) {
            console.warn("Polling retry error:", pollErr);
          }
        }

        if (!isDone && attempts >= maxAttempts) {
          throw new Error("Video generation timed out. Please try again.");
        }
      };

      await poll();
    } catch (err: any) {
      setVeoError(err.message || "Veo video generation encountered an error");
    } finally {
      setIsGeneratingVeo(false);
    }
  };

  if (!currentLogo && savedLogos.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-[#151515] border border-[#333] flex items-center justify-center mx-auto mb-4">
          <Play className="w-7 h-7 text-[#FF3B00]" />
        </div>
        <h2 className="text-base font-black uppercase tracking-[0.2em] text-[#F0F0F0]">No Identity Loaded</h2>
        <p className="text-xs font-mono text-white/50 mt-2 max-w-md mx-auto">
          Please design an emblem first in the DESIGN studio to preview interactive motion and synthesize Veo animations.
        </p>
      </div>
    );
  }

  const activeLogo = currentLogo || savedLogos[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-[#FF3B00] uppercase tracking-[0.2em] font-black">
              MODULE // 02
            </span>
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
              [MOTION CHOREOGRAPHY & VEO]
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F0F0F0]">
            ANIMATED LOGO STUDIO
          </h1>
          <p className="mt-1 text-xs text-white/60 font-light tracking-wide max-w-2xl">
            Real-time interactive kinetic choreography and cinematic AI video animations with{" "}
            <span className="font-bold text-[#FF3B00]">Veo 3.1 Fast</span>.
          </p>
        </div>

        {/* Quick Logo Switcher */}
        {savedLogos.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Switch:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs py-1">
              {savedLogos.map((lg) => (
                <button
                  key={lg.id}
                  onClick={() => onSelectLogo(lg)}
                  className={`w-9 h-9 border transition-all flex-shrink-0 cursor-pointer ${
                    lg.id === activeLogo.id
                      ? "border-[#FF3B00] shadow-[0_0_10px_rgba(255,59,0,0.5)]"
                      : "border-[#333] opacity-50 hover:opacity-100"
                  }`}
                  title={lg.companyName}
                >
                  <img
                    src={lg.imageUrl}
                    alt={lg.companyName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Animation Canvas & Live Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#151515] border border-[#333] p-6 sm:p-8 relative">
            <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-[#FF3B00] pointer-events-none"></div>

            {/* Mode Tabs matching Artistic Flair aesthetic */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-6 pb-4 border-b border-[#222]">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {[
                  { id: "ambient-glow", label: "Elastic Glow" },
                  { id: "3d-tilt", label: "3D Kinetic Tilt" },
                  { id: "orbit-spin", label: "Orbital Rays" },
                  { id: "shimmer-pulse", label: "Glitch Scan" },
                  { id: "mockup-showcase", label: "Brand Mockups" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAnimationMode(tab.id as AnimationMode)}
                    className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest whitespace-nowrap transition-all cursor-pointer ${
                      animationMode === tab.id
                        ? "border border-[#FF3B00] bg-[#FF3B00] text-black font-black"
                        : "border border-[#333] bg-[#0E0E0E] text-white/60 hover:border-white/40 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 border border-[#333] bg-[#0E0E0E] text-white/80 hover:text-white hover:border-[#FF3B00] transition-colors cursor-pointer"
                title={isPlaying ? "Pause Animation" : "Play Animation"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Animation Stage */}
            <div
              ref={stageRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative min-h-[400px] bg-[#0E0E0E] border border-[#222] overflow-hidden flex items-center justify-center p-8 select-none"
              style={{ perspective: "1000px" }}
            >
              {/* Radial Dot Matrix Backdrop */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#FF3B00 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />

              {/* Bauhaus Concentric Framing Circles */}
              <div className="absolute w-72 h-72 border border-[#222] rounded-full pointer-events-none opacity-40"></div>
              <div className="absolute w-96 h-96 border border-[#222] rounded-full pointer-events-none opacity-20"></div>

              {/* Standard Animation Modes */}
              {animationMode !== "mockup-showcase" && (
                <div
                  className="relative z-10 flex flex-col items-center justify-center transition-transform duration-100 ease-out"
                  style={{
                    transform:
                      animationMode === "3d-tilt"
                        ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.05, 1.05, 1.05)`
                        : undefined,
                  }}
                >
                  {/* Dynamic Radial Glow */}
                  <div
                    className="absolute -inset-8 rounded-full blur-3xl opacity-30 transition-all pointer-events-none"
                    style={{
                      backgroundColor: "#FF3B00",
                      filter: `blur(${glowIntensity}px)`,
                      transform: isPlaying ? "scale(1.1)" : "scale(1)",
                      animation: isPlaying ? `pulse ${3 / motionSpeed}s infinite ease-in-out` : "none",
                    }}
                  />

                  {/* Mode: Orbital Halo Rings */}
                  {animationMode === "orbit-spin" && (
                    <>
                      <div
                        className="absolute -inset-16 rounded-full border border-[#FF3B00]/40 pointer-events-none"
                        style={{
                          animation: isPlaying ? `spin ${8 / motionSpeed}s linear infinite` : "none",
                        }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF3B00] shadow-[0_0_12px_#FF3B00] absolute -top-1.5 left-1/2 -translate-x-1/2"></div>
                      </div>
                      <div
                        className="absolute -inset-24 rounded-full border border-white/20 border-dashed pointer-events-none"
                        style={{
                          animation: isPlaying ? `spin ${14 / motionSpeed}s linear infinite reverse` : "none",
                        }}
                      />
                    </>
                  )}

                  {/* Logo Image Container with Animated Effects */}
                  <div
                    className={`relative p-4 bg-[#151515]/90 border border-[#333] shadow-2xl ${
                      isPlaying && animationMode === "ambient-glow"
                        ? "animate-[bounce_4s_ease-in-out_infinite]"
                        : ""
                    }`}
                  >
                    <img
                      src={activeLogo.imageUrl}
                      alt={activeLogo.companyName}
                      referrerPolicy="no-referrer"
                      className="max-h-[250px] max-w-full object-contain drop-shadow-xl"
                    />

                    {/* Mode: Laser Shimmer Effect */}
                    {animationMode === "shimmer-pulse" && isPlaying && (
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF3B00]/30 to-transparent -skew-x-12 pointer-events-none"
                        style={{
                          animation: `shimmer ${2.5 / motionSpeed}s infinite ease-in-out`,
                        }}
                      />
                    )}
                  </div>

                  {/* Brand Typography Banner */}
                  <div className="mt-4 text-center">
                    <span className="text-white font-black tracking-widest uppercase text-xs drop-shadow-md">
                      {activeLogo.companyName}
                    </span>
                    <p className="text-[10px] font-mono text-[#FF3B00] tracking-widest uppercase mt-0.5">
                      {activeLogo.industry || "Identity System"}
                    </p>
                  </div>
                </div>
              )}

              {/* Mode: Mockup Showcase */}
              {animationMode === "mockup-showcase" && (
                <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-6 bg-[#0E0E0E] p-1 border border-[#333]">
                    <button
                      onClick={() => setActiveMockup("app-icon")}
                      className={`flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer ${
                        activeMockup === "app-icon" ? "bg-[#FF3B00] text-black" : "text-white/50 hover:text-white"
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      App Icon
                    </button>
                    <button
                      onClick={() => setActiveMockup("business-card")}
                      className={`flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer ${
                        activeMockup === "business-card" ? "bg-[#FF3B00] text-black" : "text-white/50 hover:text-white"
                      }`}
                    >
                      <CreditCard className="w-3 h-3" />
                      Card
                    </button>
                    <button
                      onClick={() => setActiveMockup("signboard")}
                      className={`flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer ${
                        activeMockup === "signboard" ? "bg-[#FF3B00] text-black" : "text-white/50 hover:text-white"
                      }`}
                    >
                      <Building2 className="w-3 h-3" />
                      HQ Sign
                    </button>
                  </div>

                  {activeMockup === "app-icon" && (
                    <div className="flex flex-col items-center animate-fade-in">
                      <div className="w-36 h-36 bg-[#151515] p-4 border border-[#333] shadow-2xl flex items-center justify-center relative">
                        <img
                          src={activeLogo.imageUrl}
                          alt={activeLogo.companyName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain relative z-10 drop-shadow-lg"
                        />
                        <div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-[#FF3B00]"></div>
                      </div>
                      <span className="text-white/60 font-mono text-[10px] uppercase tracking-widest mt-3">
                        iOS / Android System Icon
                      </span>
                    </div>
                  )}

                  {activeMockup === "business-card" && (
                    <div className="w-80 h-48 bg-[#151515] border border-[#333] p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden animate-fade-in">
                      <div className="absolute -top-px -left-px w-3 h-3 border-t border-l border-[#FF3B00]"></div>
                      <div className="flex items-start justify-between">
                        <img
                          src={activeLogo.imageUrl}
                          alt={activeLogo.companyName}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 object-contain border border-[#333] p-1 bg-black"
                        />
                        <span className="text-[9px] uppercase font-mono tracking-widest text-[#FF3B00]">
                          ARCHETYPE // 01
                        </span>
                      </div>
                      <div>
                        <h4 className="text-white text-sm font-black tracking-wider uppercase">
                          {activeLogo.companyName}
                        </h4>
                        <p className="text-white/40 font-mono text-[10px] mt-0.5">Corporate Specification</p>
                      </div>
                    </div>
                  )}

                  {activeMockup === "signboard" && (
                    <div className="w-full max-w-sm bg-[#151515] border border-[#333] p-8 shadow-2xl text-center relative overflow-hidden animate-fade-in">
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-[#FF3B00]" />
                      <div className="w-24 h-24 mx-auto mb-3 p-2 bg-[#0E0E0E] border border-[#333] flex items-center justify-center">
                        <img
                          src={activeLogo.imageUrl}
                          alt={activeLogo.companyName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h4 className="text-white text-base font-black tracking-widest uppercase">
                        {activeLogo.companyName}
                      </h4>
                      <p className="text-white/40 text-[9px] font-mono uppercase tracking-widest mt-1">
                        HQ Architecture
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Frame Status */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-4 pointer-events-none z-10">
                <div className="h-px w-16 bg-[#333]"></div>
                <span className="text-[9px] font-mono tracking-tighter opacity-40 uppercase text-white">
                  PREVIEWING FRAME 60 / 120
                </span>
                <div className="h-px w-16 bg-[#333]"></div>
              </div>
            </div>

            {/* Motion Controls Bar */}
            <div className="mt-6 pt-4 border-t border-[#222] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/50 mb-1.5">
                  <span>Velocity</span>
                  <span className="text-[#FF3B00] font-bold">{motionSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.25"
                  value={motionSpeed}
                  onChange={(e) => setMotionSpeed(parseFloat(e.target.value))}
                  className="w-full accent-[#FF3B00] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/50 mb-1.5">
                  <span>Aura Luminescence</span>
                  <span className="text-[#FF3B00] font-bold">{glowIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={glowIntensity}
                  onChange={(e) => setGlowIntensity(parseInt(e.target.value))}
                  className="w-full accent-[#FF3B00] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Video Synthesis with Veo 3.1 */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#151515] border border-[#333] p-6 sm:p-8 relative space-y-6">
            <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-[#FF3B00] pointer-events-none"></div>

            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black block">
                VEO MOTION GENERATOR
              </label>
              <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border border-[#333] text-[#FF3B00] bg-[#0E0E0E]">
                VEO 3.1 FAST
              </span>
            </div>

            <p className="text-xs text-white/60 font-light leading-relaxed">
              Convert the brand mark into a fluid temporal video simulation with spatial camera paths and cinematic lighting.
            </p>

            {veoError && (
              <div className="p-3 bg-[#180d0a] border border-[#FF3B00]/40 text-[#FF3B00] text-xs flex items-start gap-2 font-mono">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1">{veoError}</div>
              </div>
            )}

            {/* Video Prompt */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold mb-2 block">
                Camera & Motion Direction
              </label>
              <textarea
                rows={3}
                value={veoPrompt}
                onChange={(e) => setVeoPrompt(e.target.value)}
                placeholder="Describe motion dynamics (e.g. dramatic lighting sweep, 3D float, particle reveal)..."
                className="w-full px-3.5 py-2.5 bg-[#0E0E0E] border border-[#333] text-[#F0F0F0] focus:border-[#FF3B00] outline-none text-xs font-mono transition-colors resize-none"
              />

              {/* Prompt Suggestions */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                {LOGO_ANIMATION_PROMPTS.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => setVeoPrompt(preset.prompt)}
                    className="text-[9px] font-mono uppercase tracking-wider px-2.5 py-1 border border-[#333] bg-[#0E0E0E] hover:border-[#FF3B00] text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* MANDATORY ASPECT RATIO: 16:9 or 9:16 */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#222]">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold mb-2 block">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVeoAspectRatio("16:9")}
                    className={`p-2.5 border text-center transition-all cursor-pointer ${
                      veoAspectRatio === "16:9"
                        ? "border-[#FF3B00] bg-[#FF3B00] text-black font-black"
                        : "border-[#333] bg-[#0E0E0E] text-white/60 hover:border-[#FF3B00] hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-black">16:9</div>
                    <div className="text-[8px] font-mono uppercase">Landscape</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVeoAspectRatio("9:16")}
                    className={`p-2.5 border text-center transition-all cursor-pointer ${
                      veoAspectRatio === "9:16"
                        ? "border-[#FF3B00] bg-[#FF3B00] text-black font-black"
                        : "border-[#333] bg-[#0E0E0E] text-white/60 hover:border-[#FF3B00] hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-black">9:16</div>
                    <div className="text-[8px] font-mono uppercase">Portrait</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold mb-2 block">
                  Resolution
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVeoResolution("720p")}
                    className={`p-2.5 border text-center transition-all cursor-pointer ${
                      veoResolution === "720p"
                        ? "border-[#FF3B00] bg-[#FF3B00] text-black font-black"
                        : "border-[#333] bg-[#0E0E0E] text-white/60 hover:border-[#FF3B00] hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-black">720p</div>
                    <div className="text-[8px] font-mono uppercase">Preview</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVeoResolution("1080p")}
                    className={`p-2.5 border text-center transition-all cursor-pointer ${
                      veoResolution === "1080p"
                        ? "border-[#FF3B00] bg-[#FF3B00] text-black font-black"
                        : "border-[#333] bg-[#0E0E0E] text-white/60 hover:border-[#FF3B00] hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-black">1080p</div>
                    <div className="text-[8px] font-mono uppercase">Full HD</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Generate Video Action */}
            <button
              type="button"
              id="btn-generate-veo"
              disabled={isGeneratingVeo || !activeLogo}
              onClick={handleGenerateVeoVideo}
              className="w-full bg-[#FF3B00] text-black py-4 font-black uppercase text-xs tracking-[0.2em] hover:scale-[1.01] hover:bg-white transition-all shadow-[0_0_20px_rgba(255,59,0,0.25)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isGeneratingVeo ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>SYNTHESIZING VEO VIDEO...</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4 text-black" />
                  <span>RENDER VEO PROJECT ({veoAspectRatio})</span>
                </>
              )}
            </button>

            {/* Polling Progress Feedback */}
            {isGeneratingVeo && (
              <div className="p-4 bg-[#0E0E0E] border border-[#FF3B00]/40 space-y-2 font-mono">
                <div className="flex items-center justify-between text-[10px] text-[#FF3B00] font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B00] animate-ping" />
                    Veo Model Processing
                  </span>
                  <span className="text-white/40">~60s</span>
                </div>
                <p className="text-[10px] text-white/70">{pollingStatus}</p>
                <div className="w-full bg-[#222] h-1 overflow-hidden">
                  <div className="bg-[#FF3B00] h-1 animate-[shimmer_2s_infinite_linear]" style={{ width: "65%" }} />
                </div>
              </div>
            )}

            {/* Generated Veo Video Player Preview */}
            {generatedVeoVideo && (
              <div className="mt-4 p-4 bg-[#0E0E0E] border border-[#333] space-y-3">
                <div className="flex items-center justify-between text-white text-xs font-mono">
                  <span className="font-bold flex items-center gap-1.5 text-[#FF3B00]">
                    <CheckCircle2 className="w-4 h-4" />
                    VEO RENDER COMPLETE
                  </span>
                  <a
                    href={`${generatedVeoVideo.streamUrl}&download=1`}
                    download="animated-logo.mp4"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-black font-black uppercase text-[9px] tracking-widest hover:bg-[#FF3B00] hover:text-white transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    MP4
                  </a>
                </div>

                <div className="overflow-hidden bg-black border border-[#222] aspect-video flex items-center justify-center">
                  <video
                    src={generatedVeoVideo.streamUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
