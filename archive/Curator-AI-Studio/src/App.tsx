/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Header } from "./components/Header";
import { SpatialViewer } from "./components/SpatialViewer";
import { ConceptArtStudio } from "./components/ConceptArtStudio";
import { VideoAnalyzer } from "./components/VideoAnalyzer";
import { SavedPromptsModal } from "./components/SavedPromptsModal";
import { INITIAL_SAVED_PROMPTS } from "./data/exhibits";
import { SavedPromptItem } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"spatial" | "concept-art" | "video">("spatial");
  const [savedPrompts, setSavedPrompts] = useState<SavedPromptItem[]>(INITIAL_SAVED_PROMPTS);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);

  const handleSavePrompt = (name: string, category: "spatial" | "concept-art" | "video", promptText: string) => {
    const existingIndex = savedPrompts.findIndex((p) => p.name === name);
    const newItem: SavedPromptItem = {
      id: `saved-${Date.now()}`,
      name,
      category,
      prompt: promptText,
      timestamp: "Saved just now",
    };

    if (existingIndex >= 0) {
      const updated = [...savedPrompts];
      updated[existingIndex] = newItem;
      setSavedPrompts(updated);
    } else {
      setSavedPrompts((prev) => [newItem, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Curator Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSavedPrompts={() => setIsSavedModalOpen(true)}
        savedCount={savedPrompts.length}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === "spatial" && (
          <SpatialViewer
            onSavePrompt={handleSavePrompt}
          />
        )}

        {activeTab === "concept-art" && (
          <ConceptArtStudio
            onSavePrompt={(name, cat, txt) => handleSavePrompt(name, cat, txt)}
            onSendToSpatial={() => setActiveTab("spatial")}
          />
        )}

        {activeTab === "video" && (
          <VideoAnalyzer
            onSavePrompt={(name, cat, txt) => handleSavePrompt(name, cat, txt)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800 bg-stone-950 text-stone-400 text-xs py-5 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-medium text-stone-300">
              Robotics Spatial Understanding & Dinosaur Exhibit Curator Studio
            </span>
          </div>
          <div className="flex items-center gap-4 text-stone-500 text-[11px]">
            <span>Task 1: Concept Art (Glowing Crystal T-Rex)</span>
            <span>•</span>
            <span>Task 2: AMNH Tour (184K Tokens)</span>
            <span>•</span>
            <span className="text-red-400">Task 4: Red 2D Bounding Boxes</span>
          </div>
        </div>
      </footer>

      {/* Saved Prompts Modal */}
      <SavedPromptsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedPrompts={savedPrompts}
      />
    </div>
  );
}

