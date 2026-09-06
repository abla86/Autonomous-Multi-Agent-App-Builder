import React from "react";
import { X, CheckCircle2, BookmarkCheck, Copy, Check, ExternalLink } from "lucide-react";
import { SavedPromptItem } from "../types";

interface SavedPromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPrompts: SavedPromptItem[];
}

export const SavedPromptsModal: React.FC<SavedPromptsModalProps> = ({
  isOpen,
  onClose,
  savedPrompts,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">
                Lab Saved Prompts & Objectives
              </h3>
              <p className="text-xs text-stone-400">
                Google Cloud Skills Boost • Museum Exhibit AI Prototype Objectives
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Prompts list */}
        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {savedPrompts.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-stone-200 text-xs sm:text-sm">
                      {item.name}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-400">
                      {item.category}
                    </span>
                  </div>

                  <span className="text-[11px] text-emerald-400 font-medium">
                    Verified
                  </span>
                </div>

                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800/80 text-xs text-stone-300 font-mono leading-relaxed select-all">
                  {item.prompt}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-stone-500">{item.timestamp}</span>
                  <button
                    onClick={() => handleCopy(item.prompt, item.id)}
                    className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 transition"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? "Copied" : "Copy Prompt"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-800 text-xs text-stone-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            All 3 Lab Milestones Saved & Ready for Check My Progress
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
