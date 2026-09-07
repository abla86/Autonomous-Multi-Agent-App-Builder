export interface StyleOption {
  id: string;
  name: string;
  description: string;
  tag: string;
}

export interface ColorPaletteOption {
  id: string;
  name: string;
  colors: string[];
  description: string;
}

export const INDUSTRIES = [
  "Technology & AI",
  "Coffee & Roastery",
  "Eco & Sustainability",
  "Fashion & Apparel",
  "Fitness & Athletics",
  "Food & Restaurant",
  "Finance & Fintech",
  "Creative Agency & Media",
  "Health & Wellness",
  "Real Estate & Architecture",
  "Gaming & Esports",
  "Automotive & Aerospace",
];

export const LOGO_STYLES: StyleOption[] = [
  {
    id: "modern-minimalist",
    name: "Modern Minimalist",
    description: "Sleek geometric lines, clean negative space, timeless simplicity",
    tag: "Clean & Modern",
  },
  {
    id: "abstract-emblem",
    name: "Abstract Emblem",
    description: "Dynamic fluid symbols, conceptual icon, modern tech branding",
    tag: "High Concept",
  },
  {
    id: "monogram-mark",
    name: "Letterform Monogram",
    description: "Interlocking typemark initials with architectural symmetry",
    tag: "Signature",
  },
  {
    id: "cyber-neon",
    name: "Cyber & Holographic",
    description: "Luminescent vector contours, neon glow accents, dark backdrop",
    tag: "Futuristic",
  },
  {
    id: "vintage-crest",
    name: "Heritage Crest & Badge",
    description: "Artisan engraving, balanced filigree, timeless craft seal",
    tag: "Artisanal",
  },
  {
    id: "mascot-character",
    name: "Friendly Mascot",
    description: "Expressive illustrated character emblem, bold outlines",
    tag: "Playful",
  },
  {
    id: "luxury-gold",
    name: "Luxury Minimal",
    description: "Refined gold foil accents, high-fashion serif balance, ultra-premium",
    tag: "Editorial",
  },
];

export const COLOR_PALETTES: ColorPaletteOption[] = [
  {
    id: "tech-cyan",
    name: "Electric Cyan & Deep Navy",
    colors: ["#06b6d4", "#0284c7", "#0f172a"],
    description: "High-tech, trustworthy, and modern",
  },
  {
    id: "warm-ember",
    name: "Sunset Ember & Warm Coral",
    colors: ["#f97316", "#ef4444", "#fbbf24"],
    description: "Energetic, bold, and welcoming",
  },
  {
    id: "forest-sage",
    name: "Sage Green & Earth Copper",
    colors: ["#10b981", "#059669", "#78350f"],
    description: "Natural, organic, and grounded",
  },
  {
    id: "royal-gold",
    name: "Obsidian Black & Imperial Gold",
    colors: ["#eab308", "#ca8a04", "#18181b"],
    description: "Prestigious, luxurious, and refined",
  },
  {
    id: "monochrome",
    name: "High-Contrast Monochrome",
    colors: ["#09090b", "#71717a", "#fafafa"],
    description: "Timeless, universal, and bold",
  },
  {
    id: "violet-dream",
    name: "Ultraviolet & Magenta",
    colors: ["#8b5cf6", "#ec4899", "#3b82f6"],
    description: "Vibrant, creative, and imaginative",
  },
];

export const LOGO_ANIMATION_PROMPTS = [
  {
    title: "Cinematic Light Sweep",
    prompt:
      "A cinematic studio light sweep across the metallic emblem, soft volumetric ray illumination, elegant particle glint, 4k ultra-crisp motion",
  },
  {
    title: "3D Floating Hologram",
    prompt:
      "The logo emblem levitates gently with subtle 3D rotational perspective, glowing luminous edges, atmospheric dark studio backdrop",
  },
  {
    title: "Liquid Neon Form",
    prompt:
      "Smooth liquid neon energy streams together into the solid emblem, bursting into a sharp vibrant glow with glowing reflections",
  },
  {
    title: "Gentle Breathing Pulse",
    prompt:
      "Subtle breathing pulse motion of the central logo icon, soft radiant aura expanding and contracting smoothly, studio lighting",
  },
];

export const PHOTO_VIDEO_PRESETS = [
  {
    title: "Cinematic Slow Push-in",
    prompt:
      "Cinematic slow zoom dolly forward towards the subject, dramatic cinematic lighting, gentle natural motion, shallow depth of field",
  },
  {
    title: "Atmospheric Ambient Motion",
    prompt:
      "Subtle atmospheric environmental drift, soft breeze movement, changing golden sunlight rays, cinematic realism",
  },
  {
    title: "Dynamic Orbit Camera",
    prompt:
      "Smooth camera orbit around the focal subject, revealing depth and environmental lighting changes, professional cinematography",
  },
  {
    title: "Vibrant Energy Awakening",
    prompt:
      "Subtle time-lapse lighting shift, soft floating particles, radiant glow enhancement, filmic camera motion",
  },
];
