import React, { useState } from "react";
import {
  Compass,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Brain,
  Atom,
  HelpCircle,
  Eye,
  X
} from "lucide-react";
import { KNOWLEDGE_FRONTIERS } from "../../data/frontiers";
import { KnowledgeFrontier, FrontierCategory } from "../../types";

const CATEGORIES: ("Alle" | FrontierCategory)[] = [
  "Alle",
  "Hverdagsmysterier",
  "Hjerne & Bevissthet",
  "Kosmos & Fysikk",
  "Liv & Evolusjon",
];

interface FrontiersMapProps {
  onSelectTopicForProbe: (topic: string) => void;
}

export function FrontiersMap({ onSelectTopicForProbe }: FrontiersMapProps) {
  const [selectedCategory, setSelectedCategory] = useState<"Alle" | FrontierCategory>("Alle");
  const [activeModalFrontier, setActiveModalFrontier] = useState<KnowledgeFrontier | null>(null);

  const filteredFrontiers =
    selectedCategory === "Alle"
      ? KNOWLEDGE_FRONTIERS
      : KNOWLEDGE_FRONTIERS.filter((f) => f.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5" /> Terra Incognita
            </div>
            <h2 className="text-2xl font-bold text-white">
              Menneskehetens Uvitenhetskart
            </h2>
            <p className="text-sm text-slate-300">
              Menneskehetens største vitenskapelige gåter og hverdagsmysterier som vitenskapen fremdeles ikke forstår.
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-1.5 self-start sm:self-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Frontiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFrontiers.map((frontier) => (
          <div
            key={frontier.id}
            onClick={() => setActiveModalFrontier(frontier)}
            className="group bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1 relative overflow-hidden"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent group-hover:via-amber-400 transition-colors" />

            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700/60">
                  {frontier.category}
                </span>
                <span className="text-xs text-slate-500 group-hover:text-amber-400 transition-colors flex items-center gap-1">
                  Les gåten <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors mb-2">
                {frontier.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {frontier.teaser}
              </p>

              {/* What people assume pill */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 mb-4">
                <div className="text-[10px] uppercase tracking-wider text-rose-400 font-semibold mb-0.5">
                  Vanlig antagelse:
                </div>
                <div className="text-xs text-slate-300 line-clamp-2">
                  "{frontier.whatPeopleAssume}"
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800/60">
              {frontier.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Deep-Dive */}
      {activeModalFrontier && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setActiveModalFrontier(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {activeModalFrontier.category}
              </span>
              <h2 className="text-2xl font-bold text-white mt-2">
                {activeModalFrontier.title}
              </h2>
            </div>

            {/* Teaser */}
            <p className="text-base text-amber-300 font-medium italic mb-6">
              "{activeModalFrontier.teaser}"
            </p>

            {/* Comparison Grid */}
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                  Hva de fleste tror:
                </span>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {activeModalFrontier.whatPeopleAssume}
                </p>
              </div>

              <div className="p-4 bg-indigo-950/30 rounded-xl border border-indigo-500/30">
                <span className="text-xs font-bold uppercase text-indigo-400 block mb-1">
                  Hvorfor det er et uforklart mysterium:
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {activeModalFrontier.theUnsolvedCore}
                </p>
              </div>

              <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-500/30">
                <span className="text-xs font-bold uppercase text-emerald-400 block mb-1">
                  Den motintuitive sannheten:
                </span>
                <p className="text-sm text-emerald-200 leading-relaxed">
                  {activeModalFrontier.counterIntuitiveTruth}
                </p>
              </div>
            </div>

            {/* Philosophical question */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 mb-6 italic">
              <strong>Tankevekker:</strong> {activeModalFrontier.wonderQuestion}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
              <button
                onClick={() => {
                  const topic = activeModalFrontier.title;
                  setActiveModalFrontier(null);
                  onSelectTopicForProbe(topic);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Brain className="w-4 h-4" /> Test min blindsone om dette emnet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
