export type DetectionMode = "boxes" | "points";

export interface SpatialBox {
  id: string;
  label: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  confidence: number;
  description?: string;
  facts?: string[];
}

export interface SpatialPoint {
  id: string;
  label: string;
  point: [number, number]; // [y, x] 0-1000
  confidence: number;
  description?: string;
}

export interface SampleExhibitImage {
  id: string;
  title: string;
  tag: string;
  url: string;
  defaultPrompt: string;
  description: string;
}

export interface VisualCustomization {
  boxColor: "red" | "green" | "blue" | "amber" | "emerald";
  lineStyle: "solid" | "dotted" | "dashed" | "thick-dashed";
  labelTextColor: "white" | "yellow" | "black";
  lineWidth: number;
  pointRadius: number;
  showConfidence: boolean;
  showCoordinates: boolean;
}

export interface SavedPromptItem {
  id: string;
  name: string;
  category: "spatial" | "concept-art" | "video";
  prompt: string;
  timestamp: string;
}
