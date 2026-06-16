import { BoosterConfig } from "./types";

export const BOOSTER_MODES: BoosterConfig[] = [
  {
    id: "none",
    name: "Standard",
    emoji: "💖",
    description: "Réponses naturelles équilibrées",
    colorClass: "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60",
    bgGlow: "from-pink-500/0 to-violet-500/0",
  },
  {
    id: "ultra_drague",
    name: "Ultra Drague",
    emoji: "😏",
    description: "Flirt assumé, charmant & piquant",
    colorClass: "border-pink-500/40 bg-pink-950/20 text-pink-200 hover:border-pink-500 hover:bg-pink-950/35",
    bgGlow: "from-pink-500/20 to-purple-500/10",
  },
  {
    id: "ultra_mignon",
    name: "Ultra Mignon",
    emoji: "💕",
    description: "Adorable, doux & ultra affectueux",
    colorClass: "border-rose-500/40 bg-rose-950/20 text-rose-200 hover:border-rose-500 hover:bg-rose-950/35",
    bgGlow: "from-rose-500/20 to-pink-500/10",
  },
  {
    id: "funny",
    name: "Funny",
    emoji: "😂",
    description: "Humour taquin, vannes & second degré",
    colorClass: "border-amber-500/40 bg-amber-950/20 text-amber-200 hover:border-amber-500 hover:bg-amber-950/35",
    bgGlow: "from-amber-500/20 to-yellow-500/10",
  },
  {
    id: "ice_cold",
    name: "Ice Cold",
    emoji: "😎",
    description: "Détaché, mystérieux & intrigant",
    colorClass: "border-cyan-500/40 bg-cyan-950/20 text-cyan-200 hover:border-cyan-500 hover:bg-cyan-950/35",
    bgGlow: "from-cyan-500/20 to-neutral-500/10",
  },
];

export const EXAMPLE_PHRASES = [
  "Tu fais quoi ce soir ?",
  "Je viens de voir un truc qui m'a fait penser à toi...",
  "On se voit quand ?",
  "Désolé j'avais pas mon tél 😂 Vous faisiez quoi ?",
  "C'était trop cool de te voir hier !",
  "T'es fâché(e) ?",
];
