import React, { useState } from "react";
import { Sparkles, Image, Check, RefreshCw, BookmarkCheck, ArrowRight, Download, Share2, Layers } from "lucide-react";

interface ConceptArtStudioProps {
  onSavePrompt: (name: string, category: "concept-art", promptText: string) => void;
  onSendToSpatial?: (imageUrl: string) => void;
}

export const ConceptArtStudio: React.FC<ConceptArtStudioProps> = ({
  onSavePrompt,
  onSendToSpatial,
}) => {
  // Preset prompt from Task 1
  const [prompt, setPrompt] = useState<string>(
    "A photorealistic image of a futuristic natural history museum lobby, with a giant T-Rex skeleton made of glowing blue crystals."
  );

  const [promptName, setPromptName] = useState<string>("Futuristic Museum Lobby");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [modelName, setModelName] = useState<string>("gemini-3.1-flash-lite-image");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Generated artwork
  const [currentArtwork, setCurrentArtwork] = useState<{
    url: string;
    title: string;
    prompt: string;
    aspectRatio: string;
    model: string;
  }>({
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=85",
    title: "Cornerstone Concept Art: Luminous Crystal T-Rex",
    prompt:
      "A photorealistic image of a futuristic natural history museum lobby, with a giant T-Rex skeleton made of glowing blue crystals.",
    aspectRatio: "16:9",
    model: "gemini-3.1-flash-lite-image",
  });

  const handleGenerateArt = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/curator/generate-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          model: modelName,
        }),
      });

      const data = await res.json();
      setCurrentArtwork({
        url: data.imageUrl,
        title: data.title || "Futuristic Museum Lobby: Crystal T-Rex",
        prompt: prompt,
        aspectRatio: aspectRatio,
        model: modelName,
      });
    } catch (err) {
      console.error("Art generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePromptClick = () => {
    onSavePrompt(promptName, "concept-art", prompt);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-stone-100">
                Task 1: Generate Concept Art with Gemini Image Generation
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Curator Studio
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Act as the curator generating cornerstone concept art for the new dinosaur exhibit lobby.
            </p>
          </div>
        </div>

        <button
          onClick={handleSavePromptClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <BookmarkCheck className="w-4 h-4" />}
          <span>{savedSuccess ? "Saved to Drive!" : "Save: Futuristic Museum Lobby"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Run Settings & Prompt Bar (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-2">
              <Image className="w-4 h-4 text-cyan-400" />
              Prompt & Run Settings
            </h2>

            <form onSubmit={handleGenerateArt} className="space-y-4 text-xs">
              {/* Prompt Name */}
              <div>
                <label className="block text-stone-300 font-medium mb-1">
                  Prompt Name (Task 1: "Futuristic Museum Lobby"):
                </label>
                <input
                  type="text"
                  value={promptName}
                  onChange={(e) => setPromptName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Model selection */}
              <div>
                <label className="block text-stone-300 font-medium mb-1">
                  Model Selection (Gemini Image Generation):
                </label>
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="gemini-3.1-flash-lite-image">gemini-3.1-flash-lite-image (Default Media Gen)</option>
                  <option value="gemini-3.1-flash-image">gemini-3.1-flash-image (High Res 2K)</option>
                </select>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-stone-300 font-medium mb-1">Aspect Ratio:</label>
                <div className="grid grid-cols-4 gap-2">
                  {["16:9", "4:3", "1:1", "9:16"].map((ar) => (
                    <button
                      key={ar}
                      type="button"
                      onClick={() => setAspectRatio(ar)}
                      className={`py-1.5 rounded-lg border text-center font-medium transition ${
                        aspectRatio === ar
                          ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                          : "border-stone-800 bg-stone-950 text-stone-400 hover:bg-stone-800"
                      }`}
                    >
                      {ar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Text input */}
              <div>
                <label className="block text-stone-300 font-medium mb-1">
                  Prompt Request:
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                />
                <button
                  type="button"
                  onClick={() =>
                    setPrompt(
                      "A photorealistic image of a futuristic natural history museum lobby, with a giant T-Rex skeleton made of glowing blue crystals."
                    )
                  }
                  className="text-[11px] text-cyan-400 hover:underline mt-1 inline-block"
                >
                  Reset to lab prompt
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white shadow-md flex items-center justify-center gap-2 transition"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{isLoading ? "Synthesizing Concept Art…" : "Run (Generate Artwork)"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Educational Exhibit Context Note */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 text-xs text-stone-400 leading-relaxed">
            <h3 className="font-semibold text-stone-200 mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Curator Design Cornerstone
            </h3>
            <p>
              In modern museum exhibit architecture, generative AI visualizes lighting, specimen placement, and materials before structural engineering begins. The crystal T-Rex concept synthesizes anatomical fossil scanning with speculative optical geology.
            </p>
          </div>
        </div>

        {/* Right Stage: Generated Art Display & Inspector (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Header of the art frame */}
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-stone-100">{currentArtwork.title}</h3>
                <p className="text-xs text-stone-400">Model: {currentArtwork.model} • Ratio: {currentArtwork.aspectRatio}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20 font-medium">
                  Objective Complete
                </span>
              </div>
            </div>

            {/* Image Preview Canvas */}
            <div className="relative aspect-[16/9] w-full bg-stone-950 flex items-center justify-center overflow-hidden group">
              <img
                src={currentArtwork.url}
                alt={currentArtwork.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500"
              />

              {/* Action Overlays */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <a
                  href={currentArtwork.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-stone-950/80 backdrop-blur-md text-stone-200 text-xs font-medium border border-stone-800 hover:bg-stone-900 flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Full Res</span>
                </a>
              </div>
            </div>

            {/* Bottom Metadata & Send to Spatial Understanding */}
            <div className="p-4 bg-stone-950/60 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-stone-300 max-w-md">
                <span className="text-stone-500 font-mono uppercase text-[11px] block">Cornerstone Prompt:</span>
                "{currentArtwork.prompt}"
              </div>

              {onSendToSpatial && (
                <button
                  onClick={() => onSendToSpatial(currentArtwork.url)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow flex items-center gap-1.5 transition"
                >
                  <span>Detect with Spatial AI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
