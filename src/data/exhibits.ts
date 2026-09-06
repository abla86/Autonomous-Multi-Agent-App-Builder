import { SampleExhibitImage, SavedPromptItem } from "../types";

export const SAMPLE_IMAGES: SampleExhibitImage[] = [
  {
    id: "mangos",
    title: "Harvest Festival: Mangos Display",
    tag: "Task 4 Featured Media",
    url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1200&q=80",
    defaultPrompt: "mango",
    description: "Multi-cultivar botanical display showing ripened Alphonso, Haden, and Ataulfo specimens on artisan woven tiers.",
  },
  {
    id: "dinosaur",
    title: "Hall of Saurischians: T-Rex Skeleton",
    tag: "Paleontology Research",
    url: "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=1200&q=80",
    defaultPrompt: "skull",
    description: "Massive articulated Late Cretaceous theropod mount highlighting the skull, dentary teeth, and ribcage.",
  },
  {
    id: "crystal_lobby",
    title: "Concept Art: Glowing Crystal T-Rex",
    tag: "Task 1 Cornerstone Art",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    defaultPrompt: "crystal",
    description: "Futuristic museum atrium centerpiece composed of luminous sapphire crystal facets and magnetic suspension pedestal.",
  },
  {
    id: "museum_hall",
    title: "Theodore Roosevelt Rotunda: Titanosaur",
    tag: "AMNH Grand Gallery",
    url: "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80",
    defaultPrompt: "skeleton",
    description: "Majestic Beaux-Arts museum hall showcasing the 122-foot long Patagotitan sauropod cast under historic arched skylights.",
  },
];

export const INITIAL_SAVED_PROMPTS: SavedPromptItem[] = [
  {
    id: "saved-1",
    name: "Futuristic Museum Lobby",
    category: "concept-art",
    prompt: "A photorealistic image of a futuristic natural history museum lobby, with a giant T-Rex skeleton made of glowing blue crystals.",
    timestamp: "Saved in Task 1",
  },
  {
    id: "saved-2",
    name: "Museum Exhibit Highlights",
    category: "video",
    prompt: "Please provide a summary of the main exhibits shown in this video tour. List each distinct hall or section and give a one-sentence description of each.",
    timestamp: "Saved in Task 2",
  },
  {
    id: "saved-3",
    name: "Robotics Spatial Understanding",
    category: "spatial",
    prompt: "mango (Red bounding boxes & keypoints detection for harvest festival exhibit)",
    timestamp: "Saved in Task 4",
  },
];

export const AMNH_HALLS = [
  {
    name: "Theodore Roosevelt Rotunda",
    desc: "Iconic Beaux-Arts entry pavilion featuring the dramatic confrontation mount between Barosaurus and Allosaurus.",
    tokens: 22800,
    timestamp: "0:00 - 1:15",
  },
  {
    name: "Milstein Hall of Ocean Life",
    desc: "Renowned exhibition hall featuring the suspended 94-foot blue whale model and 750+ marine life specimens.",
    tokens: 28400,
    timestamp: "1:16 - 2:45",
  },
  {
    name: "Hall of Saurischian Dinosaurs",
    desc: "Home to the world's most famous Tyrannosaurus rex skeleton specimen (AMNH 5027) and massive Apatosaurus mount.",
    tokens: 34100,
    timestamp: "2:46 - 4:20",
  },
  {
    name: "Hall of Ornithischian Dinosaurs",
    desc: "Displays herbivorous armored and horned dinosaurs including pristine Stegosaurus, Triceratops, and duck-billed fossils.",
    tokens: 26500,
    timestamp: "4:21 - 5:40",
  },
  {
    name: "Mignone Halls of Gems and Minerals",
    desc: "Celebrated gallery containing 5,000+ mineral specimens including giant amethyst geodes, rubies, and the Star of India.",
    tokens: 29200,
    timestamp: "5:41 - 7:15",
  },
  {
    name: "Arthur Ross Hall of Meteorites",
    desc: "Cosmic gallery housing fragments from planetary origins, featuring the 34-ton Cape York Ahnighito iron meteorite.",
    tokens: 21300,
    timestamp: "7:16 - 8:30",
  },
  {
    name: "Rose Center for Earth and Space",
    desc: "Architectural glass cube encompassing the 87-foot Hayden Sphere charting cosmic evolution from the Big Bang.",
    tokens: 22020,
    timestamp: "8:31 - 10:00",
  },
];
