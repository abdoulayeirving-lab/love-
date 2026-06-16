import React, { useState } from "react";
import { Check, Copy, MessageSquare, Info, Heart, Zap, User } from "lucide-react";
import { motion } from "motion/react";
import { GenerationResult, GeneratedReply } from "../types";

interface ResponseCardsProps {
  result: GenerationResult;
}

export default function ResponseCards({ result }: ResponseCardsProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(index);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Erreur de copie au presse-papiers:", err);
    }
  };

  const getCategoryStyles = (category: string) => {
    // Return custom color settings for each reply category
    const cleanCat = category.toLowerCase();
    if (cleanCat.includes("mignonne") || cleanCat.includes("mignon")) {
      return {
        border: "border-rose-500/15 bg-rose-500/5 hover:border-rose-500/30",
        badge: "bg-rose-500/10 text-rose-300 border border-rose-500/20",
        textGlow: "shadow-[inset_0_1px_15px_rgba(244,63,94,0.02)]",
        iconColor: "text-rose-400",
      };
    }
    if (cleanCat.includes("drague") || cleanCat.includes("flirt")) {
      return {
        border: "border-pink-500/15 bg-pink-500/5 hover:border-pink-500/30",
        badge: "bg-pink-500/10 text-pink-300 border border-pink-500/20",
        textGlow: "shadow-[inset_0_1px_15px_rgba(236,72,153,0.02)]",
        iconColor: "text-pink-400",
      };
    }
    if (cleanCat.includes("drole") || cleanCat.includes("humour") || cleanCat.includes("funny")) {
      return {
        border: "border-amber-500/15 bg-amber-500/5 hover:border-amber-500/30",
        badge: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
        textGlow: "shadow-[inset_0_1px_15px_rgba(245,158,11,0.02)]",
        iconColor: "text-amber-400",
      };
    }
    if (cleanCat.includes("intelligent") || cleanCat.includes("neutre") || cleanCat.includes("smart")) {
      return {
        border: "border-cyan-500/15 bg-cyan-500/5 hover:border-cyan-500/30",
        badge: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20",
        textGlow: "shadow-[inset_0_1px_15px_rgba(6,182,212,0.02)]",
        iconColor: "text-cyan-400",
      };
    }
    // Booster mode styles matching booster ids
    if (cleanCat.includes("booster") || cleanCat.includes("ice") || cleanCat.includes("cold")) {
      return {
        border: "border-purple-500/25 bg-purple-500/5 hover:border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.05)]",
        badge: "bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold border border-purple-400/20",
        textGlow: "shadow-[inset_0_1px_15px_rgba(168,85,247,0.05)]",
        iconColor: "text-purple-400 animate-pulse",
      };
    }
    return {
      border: "border-white/10 bg-white/5 hover:border-white/20",
      badge: "bg-white/5 text-gray-300 border border-white/10",
      textGlow: "",
      iconColor: "text-rose-400",
    };
  };

  return (
    <div id="love-reply-results-view" className="space-y-6">
      {/* Context Analysis Bento Panel */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-md relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-3">
          <Heart size={16} className="text-rose-400" />
          <h3 className="text-sm font-semibold tracking-wide text-gray-200">
            Diagnostics de l'IA
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-gray-500 flex items-center gap-1">
              <User size={12} /> Expéditeur du message :
            </span>
            <div className="font-semibold text-gray-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {result.detectedSender || "Inconnu"}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-gray-500 flex items-center gap-1">
              <Zap size={12} /> Ambiance / Ton :
            </span>
            <div className="font-semibold text-rose-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              {result.detectedTone || "Non identifié"}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-white/10 font-medium text-gray-300 text-xs leading-relaxed flex gap-2">
          <Info size={14} className="text-rose-400 shrink-0 mt-0.5" />
          <p>
            <span className="text-gray-400 font-semibold">Analyse de situation :</span>{" "}
            {result.contextAnalysis}
          </p>
        </div>
      </motion.div>

      {/* Suggested replies lists */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase flex items-center gap-1.5">
          <MessageSquare size={13} className="text-rose-400/80" />
          Suggestions de Réponses
        </h3>

        <div className="grid gap-3">
          {result.replies.map((reply, index) => {
            const isBoosterReply = reply.category === "booster";
            const styles = getCategoryStyles(isBoosterReply ? "booster" : reply.category);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                className={`group relative rounded-[2rem] border ${styles.border} ${styles.textGlow} p-5 transition-all duration-300 flex flex-col justify-between`}
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase ${styles.badge}`}>
                    {reply.label}
                  </span>
                  
                  {isBoosterReply && (
                    <span className="text-[10px] text-purple-400 font-bold flex items-center gap-1 animate-pulse">
                      <Zap size={10} /> Booster Actif
                    </span>
                  )}
                </div>

                {/* Reply Phrase Bubble */}
                <p className="text-[15px] font-medium text-gray-100 leading-relaxed mb-4 select-all group-hover:text-white transition-colors">
                  {reply.content}
                </p>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                  <span className="text-[11px] text-gray-500 italic flex items-center gap-1 line-clamp-1 max-w-[70%]">
                    💡 {reply.explanation}
                  </span>

                  <button
                    onClick={() => copyToClipboard(reply.content, index)}
                    className={`shrink-0 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      copiedId === index
                        ? "bg-green-500/10 text-green-400 border border-green-500/30"
                        : "bg-white/5 text-gray-300 hover:text-white active:scale-95 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    {copiedId === index ? (
                      <>
                        <Check size={12} />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        Copier
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
