export type ImageResolution = "1K" | "2K" | "4K";
export type VideoAspectRatio = "16:9" | "9:16";
export type VideoResolution = "720p" | "1080p";

export interface LogoRequest {
  companyName: string;
  industry: string;
  description: string;
  style: string;
  colorPalette: string;
  imageSize: ImageResolution;
  aspectRatio: string;
}

export interface GeneratedLogo {
  id: string;
  imageUrl: string;
  companyName: string;
  industry?: string;
  promptUsed: string;
  imageSize: ImageResolution;
  aspectRatio: string;
  timestamp: number;
}

export interface VideoRequest {
  prompt: string;
  imageBase64?: string;
  mimeType?: string;
  aspectRatio: VideoAspectRatio;
  resolution: VideoResolution;
}

export interface GeneratedVideo {
  id: string;
  operationName: string;
  streamUrl: string;
  prompt: string;
  sourceImage?: string;
  aspectRatio: VideoAspectRatio;
  resolution: VideoResolution;
  timestamp: number;
  title: string;
}

export type ActiveTab = "logo-designer" | "logo-animator" | "picture-to-video" | "gallery";

export type AnimationMode =
  | "ambient-glow"
  | "3d-tilt"
  | "orbit-spin"
  | "shimmer-pulse"
  | "mockup-showcase";
