import React, { useState } from "react";
import { Video, Film, Check, RefreshCw, BookmarkCheck, Play, Sparkles, Layers, Cpu, Clock, ChevronRight } from "lucide-react";
import { AMNH_HALLS } from "../data/exhibits";

interface VideoAnalyzerProps {
  onSavePrompt: (name: string, category: "video", promptText: string) => void;
}

export const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({ onSavePrompt }) => {
  const [videoName] = useState<string>("American Museum of Natural History Tour - 10 Min");
  const [promptName, setPromptName] = useState<string>("Museum Exhibit Highlights");
  const [promptText, setPromptText] = useState<string>(
    "Please provide a summary of the main exhibits shown in this video tour. List each distinct hall or section and give a one-sentence description of each."
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [selectedHall, setSelectedHall] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"summary" | "timeline" | "tokens">("summary");

  const [summaryOutput, setSummaryOutput] = useState<string | null>(null);

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/curator/analyze-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoName,
          prompt: promptText,
        }),
      });

      const data = await res.json();
      setSummaryOutput(data.analysis);
    } catch (err) {
      console.error("Video analysis error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClick = () => {
    onSavePrompt(promptName, "video", promptText);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-stone-100">
                Task 2: Analyze Long-Format Video (AMNH Museum Tour)
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                184,320 Tokens
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Research existing successful museum exhibits through automated multimodal frame-by-frame analysis.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <BookmarkCheck className="w-4 h-4" />}
          <span>{savedSuccess ? "Saved to Drive!" : "Save: Museum Exhibit Highlights"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sample Media Attachment & Prompt Config (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Video Attachment Card (Simulating AI Studio Sample Media) */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                Attached Sample Media
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Processed: 184,320 Tokens
              </span>
            </div>

            <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-16 h-12 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center relative overflow-hidden shrink-0 group">
                <img
                  src="https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=400&q=80"
                  alt="AMNH Tour"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-stone-950/40 flex items-center justify-center">
                  <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-stone-200 truncate">{videoName}</h4>
                <p className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                  <span>Duration: 10:00</span>
                  <span>•</span>
                  <span>600 Keyframes</span>
                </p>
              </div>
            </div>

            {/* Note box from the lab instructions */}
            <div className="mt-3 p-3 rounded-xl bg-stone-950 border border-amber-500/20 text-stone-300 text-xs leading-relaxed">
              <div className="flex items-center gap-1.5 font-semibold text-amber-400 mb-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>Multimodal Video Tokenization Note:</span>
              </div>
              <p className="text-[11px] text-stone-400">
                A language model "sees" a video as a sequence of thousands of individual frames. Each frame is converted into numerical tokens. The processing time represents the model 'reading' all of these tokens before synthesizing its exhibit report.
              </p>
            </div>
          </div>

          {/* Prompt Form */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">
              Curator Research Prompt
            </h2>

            <form onSubmit={handleRunAnalysis} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-300 font-medium mb-1">
                  Prompt Name (Task 2):
                </label>
                <input
                  type="text"
                  value={promptName}
                  onChange={(e) => setPromptName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-medium mb-1">
                  Prompt Question:
                </label>
                <textarea
                  rows={4}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl font-semibold bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white shadow-md flex items-center justify-center gap-2 transition"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isLoading ? "Analyzing 184,320 Video Tokens…" : "Run (Analyze Video)"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Exhibit Breakdown & Video Summary (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Tab bar for switching views */}
          <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-2xl p-2">
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                activeTab === "summary"
                  ? "bg-amber-600 text-white shadow"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Exhibit Halls Summary
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                activeTab === "timeline"
                  ? "bg-amber-600 text-white shadow"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Video Tour Timeline ({AMNH_HALLS.length} Halls)
            </button>
            <button
              onClick={() => setActiveTab("tokens")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                activeTab === "tokens"
                  ? "bg-amber-600 text-white shadow"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Token Architecture
            </button>
          </div>

          {/* Tab 1: AI Generated Summary */}
          {activeTab === "summary" && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-stone-100">
                    Model Text Summary: Distinct Halls & Sections
                  </h3>
                </div>
                <span className="text-[11px] text-stone-400 font-mono">
                  Gemini Video Analysis
                </span>
              </div>

              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 text-xs text-stone-300 leading-relaxed">
                {AMNH_HALLS.map((hall, idx) => (
                  <div
                    key={hall.name}
                    className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80 hover:border-amber-500/40 transition"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-amber-300 text-sm flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        {hall.name}
                      </span>
                      <span className="text-[11px] text-stone-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-500" />
                        {hall.timestamp}
                      </span>
                    </div>
                    <p className="text-stone-300 pl-7">{hall.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Interactive Hall Timeline */}
          {activeTab === "timeline" && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-stone-100">
                10-Minute Video Tour Interactive Timeline
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AMNH_HALLS.map((hall, idx) => (
                  <button
                    key={hall.name}
                    onClick={() => setSelectedHall(idx)}
                    className={`text-left p-3 rounded-xl border transition ${
                      selectedHall === idx
                        ? "bg-amber-500/10 border-amber-500 text-amber-200"
                        : "bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-800"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span>{hall.name}</span>
                      <span className="text-[10px] font-mono">{hall.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-stone-400 line-clamp-2">{hall.desc}</p>
                  </button>
                ))}
              </div>

              {/* Selected Hall Detail */}
              <div className="mt-4 p-4 rounded-xl bg-stone-950 border border-amber-500/30">
                <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
                  Hall Spotlight: {AMNH_HALLS[selectedHall].name}
                </h4>
                <p className="text-xs text-stone-200 leading-relaxed">
                  {AMNH_HALLS[selectedHall].desc}
                </p>
                <div className="mt-2 flex items-center gap-4 text-[11px] text-stone-400">
                  <span>Timestamp: {AMNH_HALLS[selectedHall].timestamp}</span>
                  <span>Tokens Allocated: {AMNH_HALLS[selectedHall].tokens.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Token Architecture Explanation */}
          {activeTab === "tokens" && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4 text-xs text-stone-300">
              <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                Understanding Multimodal Long-Format Token Count
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block text-[11px]">Sampling Rate</span>
                  <span className="text-base font-bold text-stone-100">1 FPS (Frame/sec)</span>
                  <p className="text-[11px] text-stone-400 mt-1">600 total visual frames sampled across 10:00</p>
                </div>

                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block text-[11px]">Frame Resolution</span>
                  <span className="text-base font-bold text-amber-400">258 Tokens / frame</span>
                  <p className="text-[11px] text-stone-400 mt-1">Patch-level spatial vision transformer embeddings</p>
                </div>

                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block text-[11px]">Total Video Context</span>
                  <span className="text-base font-bold text-emerald-400">184,320 Tokens</span>
                  <p className="text-[11px] text-stone-400 mt-1">Includes synchronized multi-channel audio tracks</p>
                </div>
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 leading-relaxed text-stone-400">
                <p>
                  Gemini models are native multimodal architectures that process raw video without needing an intermediate transcript. The visual tokens allow the model to recognize specimen layouts, vitrine labels, hall architecture, and visitor flows directly from the video stream.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
