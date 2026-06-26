export interface GeneratedReply {
  category: string; // mignonne, drague, drole, intelligente, booster
  label: string; // e.g. "😍 Mignonne / Douce"
  content: string; // e.g. "Coucou toi, tu as passé une bonne journée ?"
  explanation: string; // Justification ou conseil de ton
  sentiment?: "positive" | "neutral" | "negative";
  sentimentScore?: number;
}

export interface GenerationResult {
  id: string;
  timestamp: string;
  inputMessage: string;
  hasImage: boolean;
  detectedSender: string; // Him, Her, Unknown
  detectedTone: string; // flirty, romantic, cold, tense, etc.
  contextAnalysis: string; // brief explanation of emotional status
  replies: GeneratedReply[];
  boosterUsed: string; // none, ultra_drague, ultra_mignon, funny, ice_cold
}

export type BoosterMode = 'none' | 'ultra_drague' | 'ultra_mignon' | 'funny' | 'ice_cold';

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

export interface BoosterConfig {
  id: BoosterMode;
  name: string;
  emoji: string;
  description: string;
  colorClass: string;
  bgGlow: string;
}
