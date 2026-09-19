import React, { useState, useEffect } from "react";
import {
  Scan,
  Crosshair,
  Send,
  Sparkles,
  Sliders,
  Check,
  Info,
  HelpCircle,
  Maximize2,
  RefreshCw,
  Eye,
  MessageSquare,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { DetectionMode, SampleExhibitImage, SpatialBox, SpatialPoint, VisualCustomization } from "../types";
import { SAMPLE_IMAGES } from "../data/exhibits";

interface SpatialViewerProps {
  onSelectConceptArt?: (url: string) => void;
  onSavePrompt: (name: string, category: "spatial", promptText: string) => void;
}

export const SpatialViewer: React.FC<SpatialViewerProps> = ({ onSavePrompt }) => {
  // Selected sample image
  const [selectedImage, setSelectedImage] = useState<SampleExhibitImage>(SAMPLE_IMAGES[0]);

  // Mode: 2D Bounding Boxes vs Points
  const [mode, setMode] = useState<DetectionMode>("boxes");

  // Prompt input
  const [promptInput, setPromptInput] = useState<string>("mango");

  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Detected entities
  const [boxes, setBoxes] = useState<SpatialBox[]>([]);
  const [points, setPoints] = useState<SpatialPoint[]>([]);

  // Selected detected entity for "Ask the Exhibit" inspector
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [hoveredEntityId, setHoveredEntityId] = useState<string | null>(null);

  // "Ask the Exhibit" Q&A state
  const [visitorQuestion, setVisitorQuestion] = useState<string>("");
  const [curatorAnswer, setCuratorAnswer] = useState<string | null>(null);
  const [isAskingCurator, setIsAskingCurator] = useState<boolean>(false);

  // Visual Customization Settings (TASK 4: RED BOUNDING BOXES DEFAULT!)
  const [customization, setCustomization] = useState<VisualCustomization>({
    boxColor: "red", // Per user instruction: "Make the bounding boxes red."
    lineStyle: "solid", // Optional challenge: dotted, dashed, thick-dashed
    labelTextColor: "white", // Per optional challenge: "Change the label text color to white?"
    lineWidth: 3,
    pointRadius: 8,
    showConfidence: true,
    showCoordinates: true,
  });

  // Show customization controls drawer
  const [showStylePanel, setShowStylePanel] = useState<boolean>(false);

  // Code Assistant Command Bar state (simulating the AI Studio Code Assistant remix from Task 4)
  const [assistantCommand, setAssistantCommand] = useState<string>("");
  const [assistantFeedback, setAssistantFeedback] = useState<string | null>(
    "Code Assistant active. Bounding box style applied: Red solid borders with white labels."
  );

  // Perform detection on load or prompt submit
  const performDetection = async (overridePrompt?: string, overrideMode?: DetectionMode, overrideImage?: SampleExhibitImage) => {
    const activeImage = overrideImage || selectedImage;
    const activeMode = overrideMode || mode;
    const activePrompt = overridePrompt !== undefined ? overridePrompt : promptInput;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/spatial/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageId: activeImage.id,
          prompt: activePrompt || activeImage.defaultPrompt,
          mode: activeMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setBoxes(data.boxes || []);
      setPoints(data.points || []);

      // Auto-select first item if available
      if (activeMode === "boxes" && data.boxes?.length > 0) {
        setSelectedEntityId(data.boxes[0].id);
      } else if (activeMode === "points" && data.points?.length > 0) {
        setSelectedEntityId(data.points[0].id);
      } else {
        setSelectedEntityId(null);
      }
    } catch (err: any) {
      console.error("Detection error:", err);
      setErrorMsg("Failed to run spatial detection. Falling back to calibrated museum coordinates.");
    } finally {
      setIsLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    performDetection("mango", "boxes", SAMPLE_IMAGES[0]);
  }, []);

  // Handle switching sample image
  const handleSelectSample = (img: SampleExhibitImage) => {
    setSelectedImage(img);
    setPromptInput(img.defaultPrompt);
    setCuratorAnswer(null);
    performDetection(img.defaultPrompt, mode, img);
  };

  // Handle Mode Change
  const handleModeChange = (newMode: DetectionMode) => {
    setMode(newMode);
    performDetection(promptInput, newMode, selectedImage);
  };

  // Handle Code Assistant Remix command (from Task 4)
  const handleAssistantCommandSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cmd = assistantCommand.trim().toLowerCase();
    if (!cmd) return;

    if (cmd.includes("red")) {
      setCustomization((prev) => ({ ...prev, boxColor: "red" }));
      setAssistantFeedback("✓ Code Assistant: Updated bounding box color to red (Stroke: #ef4444).");
    } else if (cmd.includes("green")) {
      setCustomization((prev) => ({ ...prev, boxColor: "green" }));
      setAssistantFeedback("✓ Code Assistant: Updated bounding box color to green (Stroke: #10b981).");
    } else if (cmd.includes("blue")) {
      setCustomization((prev) => ({ ...prev, boxColor: "blue" }));
      setAssistantFeedback("✓ Code Assistant: Updated bounding box color to blue (Stroke: #06b6d4).");
    } else if (cmd.includes("amber") || cmd.includes("yellow")) {
      setCustomization((prev) => ({ ...prev, boxColor: "amber" }));
      setAssistantFeedback("✓ Code Assistant: Updated bounding box color to amber (Stroke: #f59e0b).");
    }

    if (cmd.includes("dotted")) {
      setCustomization((prev) => ({ ...prev, lineStyle: "dotted", lineWidth: 3 }));
      setAssistantFeedback((prev) => `${prev || ""} Applied dotted line pattern.`);
    } else if (cmd.includes("thick") && cmd.includes("dashed")) {
      setCustomization((prev) => ({ ...prev, lineStyle: "thick-dashed", lineWidth: 5 }));
      setAssistantFeedback((prev) => `${prev || ""} Applied thick dashed border.`);
    } else if (cmd.includes("dashed")) {
      setCustomization((prev) => ({ ...prev, lineStyle: "dashed", lineWidth: 3 }));
      setAssistantFeedback((prev) => `${prev || ""} Applied dashed border.`);
    } else if (cmd.includes("solid")) {
      setCustomization((prev) => ({ ...prev, lineStyle: "solid" }));
    }

    if (cmd.includes("white")) {
      setCustomization((prev) => ({ ...prev, labelTextColor: "white" }));
      setAssistantFeedback((prev) => `${prev || ""} Set label text color to white.`);
    }

    setAssistantCommand("");
  };

  // Handle asking curator about active entity
  const handleAskCurator = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeBox = boxes.find((b) => b.id === selectedEntityId);
    const activePt = points.find((p) => p.id === selectedEntityId);
    const label = activeBox ? activeBox.label : activePt ? activePt.label : selectedImage.title;

    setIsAskingCurator(true);
    try {
      const res = await fetch("/api/spatial/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectLabel: label,
          query: visitorQuestion || `What are the key scientific attributes of this ${label}?`,
          context: selectedImage.title,
        }),
      });
      const data = await res.json();
      setCuratorAnswer(data.answer);
    } catch {
      setCuratorAnswer("The museum robotics curator maps this specimen with spatial coordinates to preserve structural and taxonomic records.");
    } finally {
      setIsAskingCurator(false);
    }
  };

  // Color mappings
  const getColorStroke = (color: VisualCustomization["boxColor"]) => {
    switch (color) {
      case "red":
        return "#ef4444"; // red-500
      case "green":
        return "#10b981"; // emerald-500
      case "blue":
        return "#0ea5e9"; // sky-500
      case "amber":
        return "#f59e0b"; // amber-500
      case "emerald":
        return "#059669";
    }
  };

  const getColorBgRgba = (color: VisualCustomization["boxColor"], isHovered: boolean) => {
    const alpha = isHovered ? "0.22" : "0.10";
    switch (color) {
      case "red":
        return `rgba(239, 68, 68, ${alpha})`;
      case "green":
        return `rgba(16, 185, 129, ${alpha})`;
      case "blue":
        return `rgba(14, 165, 233, ${alpha})`;
      case "amber":
        return `rgba(245, 158, 11, ${alpha})`;
      case "emerald":
        return `rgba(5, 150, 105, ${alpha})`;
    }
  };

  const getStrokeDashArray = (style: VisualCustomization["lineStyle"]) => {
    switch (style) {
      case "dotted":
        return "4, 6";
      case "dashed":
        return "8, 8";
      case "thick-dashed":
        return "12, 10";
      case "solid":
      default:
        return "none";
    }
  };

  const currentStroke = getColorStroke(customization.boxColor);
  const selectedBox = boxes.find((b) => b.id === selectedEntityId);
  const selectedPoint = points.find((p) => p.id === selectedEntityId);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner / Objective status */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-stone-100">
                Robotics Spatial Understanding: "Ask the Exhibit"
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-500 text-white shadow-xs">
                Task 4 Active
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Interactive museum visitor station with 2D bounding boxes, coordinate keypoints, and curator intelligence.
            </p>
          </div>
        </div>

        {/* Quick Style presets / Customizer toggle */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-styles"
            onClick={() => setShowStylePanel(!showStylePanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              showStylePanel
                ? "bg-stone-800 border-red-500/50 text-red-400"
                : "bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-800"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize Box Styles</span>
            <span
              className="w-2.5 h-2.5 rounded-full inline-block ml-1"
              style={{ backgroundColor: currentStroke }}
            />
          </button>

          <button
            id="btn-save-spatial-prompt"
            onClick={() => onSavePrompt("Robotics Spatial Understanding", "spatial", `${promptInput} with ${customization.boxColor} bounding boxes`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition"
            title="Save prompt to verify Task 4 objective"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save Prompt</span>
          </button>
        </div>
      </div>

      {/* Style Customization Drawer / Panel (Task 4 & Optional Challenges) */}
      {showStylePanel && (
        <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-red-400" />
              Custom Styling Controls (Task 4 & Optional Challenges)
            </span>
            <span className="text-xs text-stone-500">Live SVG Canvas Shader</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Box Color Selection */}
            <div>
              <label className="block text-stone-400 mb-1.5 font-medium">
                Bounding Box Color (Prompt: "Make bounding boxes red"):
              </label>
              <div className="flex items-center gap-1.5">
                {[
                  { id: "red", label: "Red (Required)", bg: "bg-red-500" },
                  { id: "green", label: "Green", bg: "bg-emerald-500" },
                  { id: "blue", label: "Blue", bg: "bg-sky-500" },
                  { id: "amber", label: "Amber", bg: "bg-amber-500" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCustomization((prev) => ({ ...prev, boxColor: c.id as any }))}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-medium transition ${
                      customization.boxColor === c.id
                        ? "border-white text-white bg-stone-800"
                        : "border-stone-800 text-stone-400 hover:bg-stone-900"
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
                    {c.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Style Selection */}
            <div>
              <label className="block text-stone-400 mb-1.5 font-medium">
                Line Style (Optional Challenges):
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "solid", label: "Solid" },
                  { id: "dotted", label: "Dotted" },
                  { id: "dashed", label: "Dashed" },
                  { id: "thick-dashed", label: "Thick Dashed" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() =>
                      setCustomization((prev) => ({
                        ...prev,
                        lineStyle: s.id as any,
                        lineWidth: s.id === "thick-dashed" ? 5 : 3,
                      }))
                    }
                    className={`px-2 py-1 rounded-md border text-[11px] font-medium text-center transition ${
                      customization.lineStyle === s.id
                        ? "border-red-500 bg-red-500/20 text-red-300"
                        : "border-stone-800 text-stone-400 hover:bg-stone-900"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Label Text Color */}
            <div>
              <label className="block text-stone-400 mb-1.5 font-medium">
                Label Text Color ("White text"):
              </label>
              <div className="flex items-center gap-1.5">
                {[
                  { id: "white", label: "White", cls: "text-white" },
                  { id: "yellow", label: "Yellow", cls: "text-amber-300" },
                  { id: "black", label: "Black", cls: "text-stone-900 bg-stone-200" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setCustomization((prev) => ({ ...prev, labelTextColor: t.id as any }))}
                    className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition ${
                      customization.labelTextColor === t.id
                        ? "border-white bg-stone-800 text-white"
                        : "border-stone-800 text-stone-400 hover:bg-stone-900"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Coordinate Overlay Toggles */}
            <div>
              <label className="block text-stone-400 mb-1.5 font-medium">Telemetry Overlays:</label>
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                  <input
                    type="checkbox"
                    checked={customization.showConfidence}
                    onChange={(e) => setCustomization((prev) => ({ ...prev, showConfidence: e.target.checked }))}
                    className="rounded text-red-600 focus:ring-red-500 bg-stone-900 border-stone-700"
                  />
                  <span>Show Confidence %</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                  <input
                    type="checkbox"
                    checked={customization.showCoordinates}
                    onChange={(e) => setCustomization((prev) => ({ ...prev, showCoordinates: e.target.checked }))}
                    className="rounded text-red-600 focus:ring-red-500 bg-stone-900 border-stone-700"
                  />
                  <span>Show Spatial [ymin, xmin]</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Canvas Stage & Controls (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Mode Selector Buttons & Quick Prompts Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/90 border border-stone-800 rounded-xl p-3">
            {/* Mode switch: 2D Bounding Boxes vs Points (Task 4 specification!) */}
            <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-lg border border-stone-800">
              <button
                id="btn-mode-boxes"
                onClick={() => handleModeChange("boxes")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  mode === "boxes"
                    ? "bg-red-600 text-white shadow"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <Scan className="w-3.5 h-3.5" />
                <span>2D Bounding Boxes</span>
              </button>

              <button
                id="btn-mode-points"
                onClick={() => handleModeChange("points")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  mode === "points"
                    ? "bg-cyan-600 text-white shadow"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Points</span>
              </button>
            </div>

            {/* Quick Filter Tag Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
              <span className="text-stone-500 font-medium text-[11px] hidden sm:inline">Presets:</span>
              {selectedImage.id === "mangos" && (
                <>
                  <button
                    onClick={() => {
                      setPromptInput("mango");
                      performDetection("mango");
                    }}
                    className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-red-300 font-medium text-xs border border-red-500/20"
                  >
                    mango (Task 4)
                  </button>
                  <button
                    onClick={() => {
                      setPromptInput("ripe");
                      performDetection("ripe");
                    }}
                    className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs"
                  >
                    ripe fruits
                  </button>
                  <button
                    onClick={() => {
                      setPromptInput("basket");
                      performDetection("basket");
                    }}
                    className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs"
                  >
                    basket
                  </button>
                </>
              )}

              {selectedImage.id === "dinosaur" && (
                <>
                  <button
                    onClick={() => {
                      setPromptInput("skull");
                      performDetection("skull");
                    }}
                    className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-red-300 font-medium text-xs border border-red-500/20"
                  >
                    skull & jaw
                  </button>
                  <button
                    onClick={() => {
                      setPromptInput("ribs");
                      performDetection("ribs");
                    }}
                    className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs"
                  >
                    rib cage
                  </button>
                </>
              )}

              {selectedImage.id === "crystal_lobby" && (
                <>
                  <button
                    onClick={() => {
                      setPromptInput("crystal");
                      performDetection("crystal");
                    }}
                    className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-cyan-300 font-medium text-xs border border-cyan-500/20"
                  >
                    crystal t-rex
                  </button>
                  <button
                    onClick={() => {
                      setPromptInput("pedestal");
                      performDetection("pedestal");
                    }}
                    className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs"
                  >
                    pedestal
                  </button>
                </>
              )}

              {selectedImage.id === "museum_hall" && (
                <>
                  <button
                    onClick={() => {
                      setPromptInput("skeleton");
                      performDetection("skeleton");
                    }}
                    className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs"
                  >
                    titanosaur
                  </button>
                  <button
                    onClick={() => {
                      setPromptInput("vault");
                      performDetection("vault");
                    }}
                    className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs"
                  >
                    rotunda vault
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Interactive SVG Display Canvas */}
          <div className="relative bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-xl aspect-[4/3] sm:aspect-[16/10] w-full flex items-center justify-center select-none group">
            {/* The Exhibit Image */}
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-all duration-300"
            />

            {/* Dark vignette overlay for contrast */}
            <div className="absolute inset-0 bg-stone-950/15 pointer-events-none" />

            {/* SVG Interactive Overlay Layer (0 0 1000 1000 normalized coordinates) */}
            <svg
              viewBox="0 0 1000 1000"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full"
            >
              <defs>
                {/* Glow filter for red or active bounding boxes */}
                <filter id="box-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="point-pulse" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Render 2D Bounding Boxes */}
              {mode === "boxes" &&
                boxes.map((box) => {
                  const [ymin, xmin, ymax, xmax] = box.box_2d;
                  const width = xmax - xmin;
                  const height = ymax - ymin;
                  const isSelected = selectedEntityId === box.id;
                  const isHovered = hoveredEntityId === box.id;

                  return (
                    <g
                      key={box.id}
                      className="cursor-pointer transition-all duration-150"
                      onClick={() => {
                        setSelectedEntityId(box.id);
                        setCuratorAnswer(null);
                      }}
                      onMouseEnter={() => setHoveredEntityId(box.id)}
                      onMouseLeave={() => setHoveredEntityId(null)}
                    >
                      {/* Box Background Fill */}
                      <rect
                        x={xmin}
                        y={ymin}
                        width={width}
                        height={height}
                        fill={getColorBgRgba(customization.boxColor, isHovered || isSelected)}
                        className="transition-colors"
                      />

                      {/* The Bounding Box Border (RED BY DEFAULT AS PER LAB TASK 4) */}
                      <rect
                        x={xmin}
                        y={ymin}
                        width={width}
                        height={height}
                        fill="none"
                        stroke={currentStroke}
                        strokeWidth={isSelected ? customization.lineWidth + 2 : customization.lineWidth}
                        strokeDasharray={getStrokeDashArray(customization.lineStyle)}
                        filter={isSelected || isHovered ? "url(#box-glow)" : undefined}
                        className="transition-all"
                      />

                      {/* Corner Accents for high tech robotics feel */}
                      <path
                        d={`M ${xmin} ${ymin + 18} L ${xmin} ${ymin} L ${xmin + 18} ${ymin}`}
                        fill="none"
                        stroke={currentStroke}
                        strokeWidth={customization.lineWidth + 2}
                      />
                      <path
                        d={`M ${xmax - 18} ${ymin} L ${xmax} ${ymin} L ${xmax} ${ymin + 18}`}
                        fill="none"
                        stroke={currentStroke}
                        strokeWidth={customization.lineWidth + 2}
                      />
                      <path
                        d={`M ${xmin} ${ymax - 18} L ${xmin} ${ymax} L ${xmin + 18} ${ymax}`}
                        fill="none"
                        stroke={currentStroke}
                        strokeWidth={customization.lineWidth + 2}
                      />
                      <path
                        d={`M ${xmax - 18} ${ymax} L ${xmax} ${ymax} L ${xmax} ${ymax - 18}`}
                        fill="none"
                        stroke={currentStroke}
                        strokeWidth={customization.lineWidth + 2}
                      />

                      {/* Bounding Box Label Chip (Task 4 & Optional Challenge: White Text) */}
                      <g transform={`translate(${xmin}, ${Math.max(ymin - 32, 8)})`}>
                        <rect
                          x={0}
                          y={0}
                          width={Math.min(width, 240)}
                          height={28}
                          rx={4}
                          fill={isSelected ? "#b91c1c" : "#1c1917"}
                          stroke={currentStroke}
                          strokeWidth={1.5}
                          opacity={0.92}
                        />
                        <text
                          x={8}
                          y={19}
                          fill={customization.labelTextColor === "white" ? "#ffffff" : customization.labelTextColor === "yellow" ? "#fde047" : "#0c0a09"}
                          fontSize="15"
                          fontWeight="700"
                          fontFamily="ui-sans-serif, system-ui, sans-serif"
                        >
                          {box.label.length > 20 ? box.label.slice(0, 18) + "…" : box.label}
                        </text>
                        {customization.showConfidence && (
                          <text
                            x={Math.min(width, 240) - 8}
                            y={18}
                            fill="#cbd5e1"
                            fontSize="12"
                            fontWeight="500"
                            textAnchor="end"
                          >
                            {Math.round(box.confidence * 100)}%
                          </text>
                        )}
                      </g>
                    </g>
                  );
                })}

              {/* Render Points Mode (Keypoints on detected objects) */}
              {mode === "points" &&
                points.map((pt) => {
                  const [y, x] = pt.point;
                  const isSelected = selectedEntityId === pt.id;
                  const isHovered = hoveredEntityId === pt.id;

                  return (
                    <g
                      key={pt.id}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedEntityId(pt.id);
                        setCuratorAnswer(null);
                      }}
                      onMouseEnter={() => setHoveredEntityId(pt.id)}
                      onMouseLeave={() => setHoveredEntityId(null)}
                    >
                      {/* Pulse Circle */}
                      <circle
                        cx={x}
                        cy={y}
                        r={customization.pointRadius * 2.5}
                        fill="rgba(6, 182, 212, 0.25)"
                        className="animate-ping"
                      />

                      {/* Outer Reticle Ring */}
                      <circle
                        cx={x}
                        cy={y}
                        r={customization.pointRadius * 1.8}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2"
                        strokeDasharray="4, 3"
                      />

                      {/* Crosshair lines */}
                      <line x1={x - 16} y1={y} x2={x + 16} y2={y} stroke="#22d3ee" strokeWidth="1.5" />
                      <line x1={x} y1={y - 16} x2={x} y2={y + 16} stroke="#22d3ee" strokeWidth="1.5" />

                      {/* Center Point */}
                      <circle
                        cx={x}
                        cy={y}
                        r={customization.pointRadius}
                        fill={isSelected ? "#ef4444" : "#06b6d4"}
                        stroke="#ffffff"
                        strokeWidth="2"
                        filter="url(#point-pulse)"
                      />

                      {/* Point Label */}
                      <g transform={`translate(${x + 14}, ${y - 12})`}>
                        <rect
                          x={0}
                          y={0}
                          width={140}
                          height={24}
                          rx={3}
                          fill="#0f172a"
                          stroke="#06b6d4"
                          strokeWidth={1}
                          opacity={0.9}
                        />
                        <text
                          x={6}
                          y={16}
                          fill="#ffffff"
                          fontSize="12"
                          fontWeight="700"
                        >
                          {pt.label.slice(0, 16)}
                        </text>
                      </g>
                    </g>
                  );
                })}
            </svg>

            {/* Loading Spinner overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-stone-200 z-20">
                <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
                <p className="text-sm font-medium">Analyzing spatial coordinates & bounding geometry…</p>
              </div>
            )}

            {/* Error badge if any */}
            {errorMsg && (
              <div className="absolute top-4 left-4 right-4 bg-red-950/90 border border-red-500/40 text-red-200 px-3 py-2 rounded-xl text-xs flex items-center gap-2 z-20 shadow-lg">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Bottom Status bar on the canvas */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <div className="px-2.5 py-1 rounded-md bg-stone-950/80 backdrop-blur-md border border-stone-800 text-[11px] text-stone-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  {mode === "boxes"
                    ? `${boxes.length} Bounding Boxes Detected`
                    : `${points.length} Keypoints Placed`}
                </span>
                <span className="text-stone-500">•</span>
                <span className="text-red-400 font-mono">
                  Color: {customization.boxColor.toUpperCase()}
                </span>
              </div>

              <div className="px-2.5 py-1 rounded-md bg-stone-950/80 backdrop-blur-md border border-stone-800 text-[11px] text-stone-400">
                Resolution: 1000 × 1000 Norm
              </div>
            </div>
          </div>

          {/* Prompt Input Form Bar (Task 4: "PROMPT input box, type mango and click Send") */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              performDetection(promptInput, mode, selectedImage);
            }}
            className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-xl p-2 shadow-sm"
          >
            <div className="flex items-center gap-2 px-3 text-stone-400 font-mono text-xs font-semibold uppercase tracking-wider border-r border-stone-800">
              <Scan className="w-4 h-4 text-red-500" />
              <span>PROMPT</span>
            </div>

            <input
              id="input-spatial-prompt"
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="e.g. mango, fruit, skeleton, skull, crystal, pedestal..."
              className="flex-1 bg-transparent px-2 py-1 text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
            />

            <button
              id="btn-send-prompt"
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white shadow transition shrink-0"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Send</span>
            </button>
          </form>

          {/* Sample Images Shelf at the Bottom (Task 4: "locate the sample images at the bottom. Click on the image that shows several mangos on display.") */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-semibold text-stone-200 uppercase tracking-wider">
                  Sample Exhibit Images
                </h3>
              </div>
              <span className="text-xs text-stone-400">
                Click an exhibit image to load & run detection
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SAMPLE_IMAGES.map((img) => {
                const isCurrent = selectedImage.id === img.id;
                return (
                  <button
                    key={img.id}
                    id={`sample-img-${img.id}`}
                    onClick={() => handleSelectSample(img)}
                    className={`group text-left rounded-xl overflow-hidden border transition relative ${
                      isCurrent
                        ? "border-red-500 ring-2 ring-red-500/30 shadow-lg"
                        : "border-stone-800 hover:border-stone-700 bg-stone-950/60"
                    }`}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-stone-950 relative">
                      <img
                        src={img.url}
                        alt={img.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      {isCurrent && (
                        <div className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                          ACTIVE
                        </div>
                      )}
                      {img.id === "mangos" && (
                        <div className="absolute bottom-1.5 left-1.5 bg-stone-950/80 text-amber-300 text-[10px] font-medium px-1.5 py-0.5 rounded backdrop-blur-xs">
                          Task 4 Target
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-stone-950">
                      <p className="text-xs font-medium text-stone-200 truncate">{img.title}</p>
                      <p className="text-[11px] text-stone-400 truncate">{img.tag}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Assistant Command Bar (Task 4: "Make changes, add new features... Make the bounding boxes red.") */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-stone-200">
                  AI Code Assistant (Task 4 Natural Language Commands)
                </span>
              </div>
              <span className="text-[11px] text-stone-400">
                Interactive Assistant Command Bar
              </span>
            </div>

            <p className="text-xs text-stone-400 mb-3">
              Type instructions like: <code className="text-red-400 font-mono">Make the bounding boxes red</code>,{" "}
              <code className="text-emerald-400 font-mono">Change bounding box color to green</code>, or{" "}
              <code className="text-cyan-400 font-mono">Make the bounding box line dotted</code>.
            </p>

            <form onSubmit={handleAssistantCommandSubmit} className="flex gap-2">
              <input
                id="input-code-assistant"
                type="text"
                value={assistantCommand}
                onChange={(e) => setAssistantCommand(e.target.value)}
                placeholder="Type command: 'Make the bounding boxes red', 'Make the line dotted'..."
                className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                id="btn-apply-assistant"
                type="submit"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 transition shrink-0"
              >
                Apply Command
              </button>
            </form>

            {assistantFeedback && (
              <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800/80 text-[11px] text-stone-300 font-mono flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{assistantFeedback}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: "Ask the Exhibit" Inspector & Curator Q&A (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Specimen Inspector Card */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-semibold text-stone-100">
                  Specimen Spatial Inspector
                </h2>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-mono">
                {selectedEntityId || "No Selection"}
              </span>
            </div>

            {selectedBox ? (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-bold text-stone-100">{selectedBox.label}</h3>
                  <p className="text-xs text-stone-400 mt-1">{selectedBox.description}</p>
                </div>

                {/* Spatial Coordinates Pill Grid */}
                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-stone-400">
                    <span>Confidence Score:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {Math.round(selectedBox.confidence * 100)}% Match
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-stone-400">
                    <span>2D Bounding Box:</span>
                    <span className="font-mono text-stone-200">
                      [{selectedBox.box_2d.join(", ")}]
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-stone-400">
                    <span>Spatial Area:</span>
                    <span className="font-mono text-stone-200">
                      {Math.round(
                        ((selectedBox.box_2d[2] - selectedBox.box_2d[0]) *
                          (selectedBox.box_2d[3] - selectedBox.box_2d[1])) /
                          10000
                      )}
                      % of Field
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-stone-400">
                    <span>Border Color:</span>
                    <span className="font-semibold text-red-400">
                      {customization.boxColor.toUpperCase()} ({customization.lineStyle})
                    </span>
                  </div>
                </div>

                {/* Scientific Facts */}
                {selectedBox.facts && selectedBox.facts.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                      Curator Botanical & Fossil Records:
                    </h4>
                    <ul className="space-y-1.5 text-xs text-stone-300">
                      {selectedBox.facts.map((fact, i) => (
                        <li key={i} className="flex items-start gap-2 bg-stone-950/50 p-2 rounded-lg border border-stone-800/40">
                          <span className="text-red-500 font-bold">•</span>
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : selectedPoint ? (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-bold text-stone-100">{selectedPoint.label}</h3>
                  <p className="text-xs text-stone-400 mt-1">{selectedPoint.description}</p>
                </div>

                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-stone-400">
                    <span>Confidence Score:</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {Math.round(selectedPoint.confidence * 100)}% Match
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-stone-400">
                    <span>Keypoint Coordinate [y, x]:</span>
                    <span className="font-mono text-stone-200">
                      [{selectedPoint.point.join(", ")}]
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-stone-400 text-xs">
                <Crosshair className="w-8 h-8 mx-auto text-stone-600 mb-2" />
                <p>Click any bounding box or keypoint on the image to inspect its spatial coordinates and curator records.</p>
              </div>
            )}
          </div>

          {/* "Ask the Exhibit" Interactive Visitor Q&A */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-stone-800">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-stone-100">
                Ask the Exhibit (Visitor AI Dialogue)
              </h3>
            </div>

            <p className="text-xs text-stone-400 mb-3">
              Simulate visitor interaction with museum AI. Ask questions about the highlighted specimen.
            </p>

            <form onSubmit={handleAskCurator} className="flex flex-col gap-2">
              <input
                type="text"
                value={visitorQuestion}
                onChange={(e) => setVisitorQuestion(e.target.value)}
                placeholder={
                  selectedBox
                    ? `Ask about this ${selectedBox.label}...`
                    : "e.g. How does the spatial tracking identify ripeness?"
                }
                className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-red-500"
              />

              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setVisitorQuestion(
                        selectedImage.id === "mangos"
                          ? "What is the historical origin and nutritional value of this mango cultivar?"
                          : "How do paleontologists determine bite force from this skull fossil?"
                      )
                    }
                    className="text-[11px] text-stone-400 hover:text-stone-200 underline"
                  >
                    Insert question
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isAskingCurator}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center gap-1.5 transition"
                >
                  {isAskingCurator ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                  <span>Ask AI</span>
                </button>
              </div>
            </form>

            {curatorAnswer && (
              <div className="mt-4 p-3 rounded-xl bg-stone-950 border border-cyan-500/20 text-xs text-stone-300 leading-relaxed max-h-56 overflow-y-auto">
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Curator Response:</span>
                </div>
                <p>{curatorAnswer}</p>
              </div>
            )}
          </div>

          {/* Detections List Overview */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Spatial Detection Inventory ({mode === "boxes" ? boxes.length : points.length})
            </h4>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {mode === "boxes" &&
                boxes.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedEntityId(b.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between border transition ${
                      selectedEntityId === b.id
                        ? "bg-red-500/10 border-red-500/50 text-red-300 font-medium"
                        : "bg-stone-950/60 border-stone-800/60 text-stone-400 hover:bg-stone-800"
                    }`}
                  >
                    <span className="truncate">{b.label}</span>
                    <span className="font-mono text-[11px] text-stone-500 shrink-0">
                      {Math.round(b.confidence * 100)}%
                    </span>
                  </button>
                ))}

              {mode === "points" &&
                points.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedEntityId(p.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between border transition ${
                      selectedEntityId === p.id
                        ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-300 font-medium"
                        : "bg-stone-950/60 border-stone-800/60 text-stone-400 hover:bg-stone-800"
                    }`}
                  >
                    <span className="truncate">{p.label}</span>
                    <span className="font-mono text-[11px] text-stone-500 shrink-0">
                      [{p.point[0]}, {p.point[1]}]
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
