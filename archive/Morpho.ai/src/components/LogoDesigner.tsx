import React, { useState } from "react";
import {
  Sparkles,
  Wand2,
  RefreshCw,
  Download,
  Play,
  Film,
  Layers,
  Check,
  AlertCircle,
  Info,
} from "lucide-react";
import { GeneratedLogo, ImageResolution } from "../types";
import {
  INDUSTRIES,
  LOGO_STYLES,
  COLOR_PALETTES,
} from "../data/presets";

interface LogoDesignerProps {
  onLogoGenerated: (logo: GeneratedLogo) => void;
  onAnimateLogo: (logo: GeneratedLogo) => void;
  onConvertToVideo: (logo: GeneratedLogo) => void;
}

export const LogoDesigner: React.FC<LogoDesignerProps> = ({
  onLogoGenerated,
  onAnimateLogo,
  onConvertToVideo,
}) => {
  const [companyName, setCompanyName] = useState("MORPHO LABS");
  const [industry, setIndustry] = useState("Technology & AI");
  const [description, setDescription] = useState(
    "A minimalist sun icon constructed from geometric rays, Bauhaus style, using a primary palette of cobalt and ochre. Sharp edges, high contrast, professional."
  );
  const [selectedStyle, setSelectedStyle] = useState(LOGO_STYLES[0].name);
  const [selectedPalette, setSelectedPalette] = useState(COLOR_PALETTES[0].name);

  // Mandatory affordance: 1K, 2K, 4K resolution
  const [imageSize, setImageSize] = useState<ImageResolution>("1K");
  const [aspectRatio, setAspectRatio] = useState("1:1");

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLogo, setCurrentLogo] = useState<GeneratedLogo | null>(null);
  const [previewBg, setPreviewBg] = useState<"dark" | "light" | "grid">("dark");

  const [statusMessageIndex, setStatusMessageIndex] = useState(0);

  const statusMessages = [
    "Synthesizing geometric contours with Gemini 3 Pro...",
    "Computing Bauhaus color harmonics & optical balance...",
    "Calibrating vector typography and negative space...",
    "Finalizing high-precision raster rendering...",
  ];

  // Enhance prompt with AI
  const handleEnhancePrompt = async () => {
    if (!description.trim() && !companyName.trim()) return;
    setIsEnhancing(true);
    setError(null);

    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          industry,
          rawDescription: description,
          style: selectedStyle,
          colorPalette: selectedPalette,
        }),
      });

      const data = await res.json();
      if (res.ok && data.enhancedPrompt) {
        setDescription(data.enhancedPrompt);
      } else {
        setError(data.error || "Failed to enhance prompt");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reach server");
    } finally {
      setIsEnhancing(false);
    }
  };

  // Generate Logo with model gemini-3-pro-image-preview
  const handleGenerateLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError("Please enter a company name");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setStatusMessageIndex(0);

    const messageInterval = setInterval(() => {
      setStatusMessageIndex((prev) => (prev + 1) % statusMessages.length);
    }, 2800);

    try {
      const res = await fetch("/api/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          industry,
          description,
          style: selectedStyle,
          colorPalette: selectedPalette,
          imageSize,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Logo generation failed");
      }

      const newLogo: GeneratedLogo = {
        id: "logo-" + Date.now(),
        imageUrl: data.imageUrl,
        companyName: companyName,
        industry: industry,
        promptUsed: data.promptUsed,
        imageSize: imageSize,
        aspectRatio: aspectRatio,
        timestamp: Date.now(),
      };

      setCurrentLogo(newLogo);
      onLogoGenerated(newLogo);
    } catch (err: any) {
      setError(err.message || "An error occurred while designing the logo");
    } finally {
      clearInterval(messageInterval);
      setIsGenerating(false);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Intro Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-[#FF3B00] uppercase tracking-[0.2em] font-black">
              MODULE // 01
            </span>
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
              [VECTOR SYNTHESIS ENGINE]
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F0F0F0]">
            IDENTITY DESIGN STUDIO
          </h1>
          <p className="mt-1 text-xs text-white/60 font-light tracking-wide max-w-2xl">
            Construct geometric brand emblems powered by{" "}
            <span className="font-bold text-[#FF3B00]">Gemini 3 Pro Image</span> with dedicated 1K, 2K, and 4K ultra-sharp output matrix.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#151515] border border-[#333] text-[10px] font-mono uppercase tracking-widest text-[#FF3B00]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B00] animate-pulse"></span>
            GEMINI 3 PRO READY
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#151515] border border-[#333] text-[10px] font-mono uppercase tracking-widest text-white/70">
            RES: {imageSize}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#180d0a] border border-[#FF3B00]/40 flex items-start gap-3 text-[#FF3B00] text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#FF3B00]" />
          <div className="flex-1 font-mono">
            <p className="font-bold uppercase tracking-wider">Engine Diagnostic</p>
            <p className="mt-0.5 text-white/80">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-white/40 hover:text-white text-[10px] uppercase font-bold tracking-widest"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Design Controls */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleGenerateLogo} className="bg-[#151515] border border-[#333] p-6 sm:p-8 relative space-y-6">
            {/* Constructivist Corner Accent */}
            <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-[#FF3B00] pointer-events-none"></div>

            {/* 01. Brand & Industry */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black mb-3 block">
                01. Identity Parameters
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company-name" className="block text-[10px] uppercase tracking-widest text-white/50 mb-1.5 font-bold">
                    Brand Name <span className="text-[#FF3B00]">*</span>
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. MORPHO, KINETIC, VORTEX"
                    className="w-full px-3.5 py-2.5 bg-[#0E0E0E] border border-[#333] text-[#F0F0F0] focus:border-[#FF3B00] outline-none text-xs font-mono uppercase tracking-wider transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="industry-select" className="block text-[10px] uppercase tracking-widest text-white/50 mb-1.5 font-bold">
                    Sector & Domain
                  </label>
                  <select
                    id="industry-select"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0E0E0E] border border-[#333] text-[#F0F0F0] focus:border-[#FF3B00] outline-none text-xs font-mono uppercase tracking-wider transition-colors"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind} className="bg-[#0E0E0E] text-white">
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 02. Description & AI Enhancer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="logo-description" className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black block">
                  02. Artistic Description
                </label>
                <button
                  type="button"
                  id="btn-enhance-prompt"
                  disabled={isEnhancing || isGenerating}
                  onClick={handleEnhancePrompt}
                  className="bg-white text-black px-3 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-[#FF3B00] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Wand2 className={`w-3 h-3 ${isEnhancing ? "animate-spin" : ""}`} />
                  <span>{isEnhancing ? "Synthesizing..." : "Refine with Gemini"}</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  id="logo-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A minimalist sun icon constructed from geometric rays, Bauhaus style..."
                  className="w-full px-4 py-3 bg-[#0E0E0E] border border-[#333] text-[#F0F0F0] focus:border-[#FF3B00] outline-none text-xs leading-relaxed font-light transition-colors resize-none"
                />
              </div>
            </div>

            {/* 03. Art Style Grid */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black mb-3 block">
                03. Aesthetic Paradigm
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LOGO_STYLES.map((style) => {
                  const isSelected = selectedStyle === style.name;
                  return (
                    <div
                      key={style.id}
                      id={`style-${style.id}`}
                      onClick={() => setSelectedStyle(style.name)}
                      className={`p-3 border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#FF3B00] bg-[#FF3B00]/10 text-[#FF3B00]"
                          : "border-[#333] bg-[#0E0E0E]/60 text-white/70 hover:border-white/40 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-black tracking-wider">{style.name}</span>
                        {isSelected && <span className="w-1.5 h-1.5 bg-[#FF3B00] rounded-full" />}
                      </div>
                      <p className="text-[9px] font-mono leading-tight opacity-50 line-clamp-2">
                        {style.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 04. Color Palette */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black mb-3 block">
                04. Chromatic Palette
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COLOR_PALETTES.map((palette) => {
                  const isSelected = selectedPalette === palette.name;
                  return (
                    <div
                      key={palette.id}
                      id={`palette-${palette.id}`}
                      onClick={() => setSelectedPalette(palette.name)}
                      className={`p-2.5 border text-left cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-[#FF3B00] bg-[#FF3B00]/10 text-[#FF3B00]"
                          : "border-[#333] bg-[#0E0E0E]/60 text-white/70 hover:border-white/40 hover:text-white"
                      }`}
                    >
                      <div>
                        <div className="text-[10px] uppercase font-black tracking-widest">{palette.name}</div>
                        <div className="text-[9px] font-mono opacity-50">{palette.description}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {palette.colors.map((c, i) => (
                          <span
                            key={i}
                            className="w-3.5 h-3.5 border border-white/20"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 05. Image Size (1K, 2K, 4K) & Aspect Ratio */}
            <div className="pt-4 border-t border-[#222]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Size: 1K, 2K, 4K */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black">
                      05. Resolution Specs
                    </label>
                    <span className="text-[9px] font-mono text-white/40">GEMINI 3 PRO</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["1K", "2K", "4K"] as ImageResolution[]).map((size) => {
                      const isSelected = imageSize === size;
                      const pixelLabels: Record<ImageResolution, string> = {
                        "1K": "1024px",
                        "2K": "2048px",
                        "4K": "4096px",
                      };
                      return (
                        <button
                          key={size}
                          type="button"
                          id={`btn-size-${size}`}
                          onClick={() => setImageSize(size)}
                          className={`p-2.5 border text-center transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#FF3B00] bg-[#FF3B00] text-black font-black"
                              : "border-[#333] bg-[#0E0E0E] text-white/60 hover:border-[#FF3B00] hover:text-white"
                          }`}
                        >
                          <div className="text-xs font-black tracking-widest">{size}</div>
                          <div className={`text-[9px] font-mono ${isSelected ? "text-black/80" : "text-white/40"}`}>
                            {pixelLabels[size]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black mb-2 block">
                    Canvas Ratio
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: "1:1", label: "Square" },
                      { val: "16:9", label: "Wide" },
                      { val: "4:3", label: "Classic" },
                    ].map((ratio) => {
                      const isSelected = aspectRatio === ratio.val;
                      return (
                        <button
                          key={ratio.val}
                          type="button"
                          id={`btn-ratio-${ratio.val.replace(":", "-")}`}
                          onClick={() => setAspectRatio(ratio.val)}
                          className={`p-2.5 border text-center transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#FF3B00] bg-[#FF3B00] text-black font-black"
                              : "border-[#333] bg-[#0E0E0E] text-white/60 hover:border-[#FF3B00] hover:text-white"
                          }`}
                        >
                          <div className="text-xs font-black tracking-widest">{ratio.val}</div>
                          <div className={`text-[9px] font-mono ${isSelected ? "text-black/80" : "text-white/40"}`}>
                            {ratio.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              id="btn-generate-logo"
              disabled={isGenerating || !companyName.trim()}
              className="w-full bg-[#FF3B00] text-black py-4 font-black uppercase text-xs tracking-[0.2em] hover:scale-[1.01] hover:bg-white transition-all shadow-[0_0_25px_rgba(255,59,0,0.3)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>SYNTHESIZING WITH GEMINI 3 PRO ({imageSize})...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>SYNTHESIZE EMBLEM ({imageSize})</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Bauhaus / Artistic Flair Viewport */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#151515] border border-[#333] p-6 sm:p-8 relative flex flex-col h-full">
            <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-[#FF3B00] pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] font-black block">
                VIEWPORT // CANVAS
              </label>

              {/* Canvas Backdrop mode */}
              <div className="flex items-center border border-[#333] text-[9px] font-mono uppercase tracking-widest">
                <button
                  type="button"
                  onClick={() => setPreviewBg("dark")}
                  className={`px-2.5 py-1 transition-colors ${
                    previewBg === "dark" ? "bg-white text-black font-bold" : "text-white/50 hover:text-white"
                  }`}
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg("light")}
                  className={`px-2.5 py-1 transition-colors ${
                    previewBg === "light" ? "bg-white text-black font-bold" : "text-white/50 hover:text-white"
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg("grid")}
                  className={`px-2.5 py-1 transition-colors ${
                    previewBg === "grid" ? "bg-white text-black font-bold" : "text-white/50 hover:text-white"
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>

            {/* The Artistic Flair Canvas Stage */}
            <div
              className={`relative flex-1 min-h-[380px] border border-[#222] flex items-center justify-center overflow-hidden transition-colors ${
                previewBg === "dark"
                  ? "bg-[#0E0E0E]"
                  : previewBg === "light"
                  ? "bg-[#EAEAEA]"
                  : "bg-[#111]"
              }`}
            >
              {/* Radial Dot Grid Background matching the Artistic Flair aesthetic */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#FF3B00 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />

              {/* Concentric circle architectural framing */}
              <div className="absolute w-72 h-72 border border-[#222] rounded-full pointer-events-none opacity-40"></div>
              <div className="absolute w-96 h-96 border border-[#222] rounded-full pointer-events-none opacity-20"></div>

              {isGenerating ? (
                <div className="text-center p-8 max-w-sm relative z-10">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-[#FF3B00]/20 border-t-[#FF3B00] animate-spin"></div>
                    <div className="absolute inset-2 bg-[#0A0A0A] rounded-full flex items-center justify-center border border-[#333]">
                      <Sparkles className="w-5 h-5 text-[#FF3B00] animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-1">
                    Synthesizing Vector Matrix
                  </h3>
                  <p className="text-[10px] font-mono text-[#FF3B00] h-6 uppercase tracking-wider">
                    {statusMessages[statusMessageIndex]}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="h-px w-8 bg-[#333]"></div>
                    <span className="text-[9px] font-mono opacity-40 uppercase">GEMINI 3 PRO</span>
                    <div className="h-px w-8 bg-[#333]"></div>
                  </div>
                </div>
              ) : currentLogo ? (
                <div className="relative group w-full h-full flex items-center justify-center p-6 z-10">
                  <img
                    src={currentLogo.imageUrl}
                    alt={`${currentLogo.companyName} Logo`}
                    referrerPolicy="no-referrer"
                    className="max-h-[320px] max-w-full object-contain drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                  />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() =>
                        downloadImage(
                          currentLogo.imageUrl,
                          `${currentLogo.companyName}-logo-${currentLogo.imageSize}.png`
                        )
                      }
                      className="p-2 bg-[#0A0A0A] border border-[#333] text-white hover:border-[#FF3B00] text-xs transition-colors"
                      title="Download image"
                    >
                      <Download className="w-4 h-4 text-[#FF3B00]" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-white/40 relative z-10">
                  <div className="w-14 h-14 mx-auto mb-3 bg-[#0A0A0A] border border-[#333] flex items-center justify-center">
                    <Wand2 className="w-6 h-6 text-[#FF3B00]" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/80">
                    Awaiting Generation
                  </p>
                  <p className="text-[10px] font-mono text-white/40 mt-1 max-w-xs mx-auto">
                    Configure company parameters and initiate synthesis.
                  </p>
                </div>
              )}

              {/* Bottom Frame Status bar */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none z-10">
                <div className="h-px w-16 bg-[#333]"></div>
                <span className="text-[9px] font-mono tracking-tighter opacity-40 uppercase text-white">
                  FRAME STATUS // READY
                </span>
                <div className="h-px w-16 bg-[#333]"></div>
              </div>
            </div>

            {/* Logo Meta info & Next Action buttons */}
            {currentLogo && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/60 px-1 border-b border-[#222] pb-2">
                  <span>
                    BRAND // <strong className="text-white">{currentLogo.companyName}</strong>
                  </span>
                  <span className="text-[#FF3B00] font-bold">
                    {currentLogo.imageSize} • {currentLogo.aspectRatio}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    id="btn-goto-animate"
                    onClick={() => onAnimateLogo(currentLogo)}
                    className="py-3 px-4 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-[#FF3B00] hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Animate Motion</span>
                  </button>

                  <button
                    type="button"
                    id="btn-goto-veo-video"
                    onClick={() => onConvertToVideo(currentLogo)}
                    className="py-3 px-4 border border-[#FF3B00] text-[#FF3B00] font-black uppercase text-[10px] tracking-widest hover:bg-[#FF3B00] hover:text-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Synthesize Video</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    downloadImage(
                      currentLogo.imageUrl,
                      `${currentLogo.companyName}-logo-${currentLogo.imageSize}.png`
                    )
                  }
                  className="w-full py-2.5 px-4 border border-[#333] hover:border-white text-white/70 hover:text-white text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#FF3B00]" />
                  <span>Export Master Asset ({currentLogo.imageSize})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
