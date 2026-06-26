import React, { useState } from "react";
import { Check, Copy, MessageSquare, Info, Heart, Zap, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GenerationResult, GeneratedReply } from "../types";

interface ResponseCardsProps {
  result: GenerationResult;
}

interface ConfettiParticle {
  id: string;
  cx: string;
  cy: string;
  crot: string;
  color: string;
}

export default function ResponseCards({ result }: ResponseCardsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [confettis, setConfettis] = useState<Record<number, ConfettiParticle[]>>({});

  const copyToClipboard = async (text: string, index: number) => {
    let success = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        success = true;
      } else {
        // Fallback using document.execCommand
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        success = document.execCommand("copy");
        document.body.removeChild(textarea);
      }
    } catch (err) {
      console.warn("Clipboard API failed, attempting selection fallback...", err);
    }

    if (success) {
      setCopiedIndex(index);

      // Spawn 5 micro-confetti particles
      const colors = ["#be3a8a", "#6025d4", "#ec4899", "#a855f7", "#22c55e"];
      const newParticles: ConfettiParticle[] = Array.from({ length: 5 }).map(() => {
        // Random angle and distance
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 50;
        const cx = `${Math.cos(angle) * distance}px`;
        const cy = `${Math.sin(angle) * distance}px`;
        const crot = `${Math.random() * 180}deg`;

        return {
          id: Math.random().toString(36).substring(2, 9),
          cx,
          cy,
          crot,
          color: colors[Math.floor(Math.random() * colors.length)]
        };
      });

      setConfettis((prev) => ({
        ...prev,
        [index]: newParticles
      }));

      // Reset copystate
      setTimeout(() => setCopiedIndex(null), 2000);

      // Cleanup particles
      setTimeout(() => {
        setConfettis((prev) => {
          const updated = { ...prev };
          delete updated[index];
          return updated;
        });
      }, 800);

    } else {
      // Selection fallback for absolute certainty
      try {
        const bubble = document.getElementById(`reply-bubble-${index}`);
        if (bubble) {
          const range = document.createRange();
          range.selectNodeContents(bubble);
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 3000);
      } catch (selErr) {
        console.error("Selection fallback failed:", selErr);
      }
    }
  };

  const getCategoryStyles = (category: string) => {
    const cleanCat = category.toLowerCase();
    
    // Mignonne / Mignon
    if (cleanCat.includes("mignonne") || cleanCat.includes("mignon")) {
      return {
        badge: "bg-rose-500/10 text-rose-300 border border-rose-500/20",
        hoverBorder: "hover:border-rose-500/60 hover:shadow-[0_10px_25px_rgba(244,63,94,0.15)]",
        glow: "shadow-[inset_0_1px_20px_rgba(244,63,94,0.03)]",
        iconColor: "text-rose-400"
      };
    }
    // Drague / Flirt
    if (cleanCat.includes("drague") || cleanCat.includes("flirt")) {
      return {
        badge: "bg-pink-500/10 text-pink-300 border border-pink-500/20",
        hoverBorder: "hover:border-pink-400/60 hover:shadow-[0_10px_25px_rgba(236,72,153,0.15)]",
        glow: "shadow-[inset_0_1px_20px_rgba(236,72,153,0.03)]",
        iconColor: "text-pink-400"
      };
    }
    // Humour / Funny
    if (cleanCat.includes("drole") || cleanCat.includes("humour") || cleanCat.includes("funny")) {
      return {
        badge: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
        hoverBorder: "hover:border-amber-400/60 hover:shadow-[0_10px_25px_rgba(245,158,11,0.15)]",
        glow: "shadow-[inset_0_1px_20px_rgba(245,158,11,0.03)]",
        iconColor: "text-amber-400"
      };
    }
    // Smart / Intelligent
    if (cleanCat.includes("intelligent") || cleanCat.includes("neutre") || cleanCat.includes("smart")) {
      return {
        badge: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20",
        hoverBorder: "hover:border-cyan-400/60 hover:shadow-[0_10px_25px_rgba(6,182,212,0.15)]",
        glow: "shadow-[inset_0_1px_20px_rgba(6,182,212,0.03)]",
        iconColor: "text-cyan-400"
      };
    }
    // Booster mode / Ice Cold
    if (cleanCat.includes("booster") || cleanCat.includes("ice") || cleanCat.includes("cold")) {
      return {
        badge: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border border-purple-400/20 font-bold",
        hoverBorder: "hover:border-purple-400/70 hover:shadow-[0_10px_25px_rgba(168,85,247,0.2)]",
        glow: "shadow-[inset_0_1px_20px_rgba(168,85,247,0.05)]",
        iconColor: "text-purple-400"
      };
    }

    return {
      badge: "bg-white/5 text-gray-300 border border-white/10",
      hoverBorder: "hover:border-rose-500/30 hover:shadow-[0_10px_25px_rgba(244,63,94,0.08)]",
      glow: "",
      iconColor: "text-rose-400"
    };
  };

  return (
    <div id="love-reply-results-view" className="space-y-6">
      {/* Context Analysis Bento Panel */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-md relative overflow-hidden"
      >
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
      <div className="space-y-4">
        <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase flex items-center gap-1.5">
          <MessageSquare size={13} className="text-rose-400/80" />
          Suggestions de Réponses
        </h3>

        <div className="grid gap-4">
          {result.replies.map((reply, index) => {
            const isBoosterReply = reply.category === "booster";
            const styles = getCategoryStyles(isBoosterReply ? "booster" : reply.category);
            const isCopied = copiedIndex === index;

            // Determine sentiment and score for this reply (with fallback for backward compatibility)
            const sentimentValue = reply.sentiment || (
              reply.category.toLowerCase().includes("mignonne") || 
              reply.category.toLowerCase().includes("mignon") || 
              reply.category.toLowerCase().includes("drague") || 
              reply.category.toLowerCase().includes("flirt")
                ? "positive"
                : reply.category.toLowerCase().includes("intelligent") || 
                  reply.category.toLowerCase().includes("neutre") || 
                  reply.category.toLowerCase().includes("smart")
                ? "neutral"
                : "positive"
            );

            const sentimentScoreValue = typeof reply.sentimentScore === "number" 
              ? reply.sentimentScore 
              : (sentimentValue === "positive" ? 85 : 50);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 90, 
                  damping: 14, 
                  delay: index * 0.08 // Stagger delays: 0ms, 80ms, 160ms, 240ms...
                }}
                className={`group relative rounded-[20px] bg-white/[0.04] backdrop-blur-md border border-white/[0.08] p-5 md:p-6 transition-all duration-300 transform hover:-translate-y-1 ${styles.hoverBorder} ${styles.glow} flex flex-col justify-between`}
              >
                {/* Header card: badge colored + button "📋 Copier" */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5 relative">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full tracking-wider uppercase ${styles.badge}`}>
                      {reply.label}
                    </span>
                    {isBoosterReply && (
                      <span className="text-[10px] text-purple-400 font-bold flex items-center gap-0.5 animate-pulse">
                        <Zap size={11} className="text-purple-400" /> Booster Actif
                      </span>
                    )}
                  </div>

                  {/* Absolute micro-confetti container right inside the click zone */}
                  <div className="relative">
                    {confettis[index]?.map((p) => (
                      <span
                        key={p.id}
                        className="absolute w-1.5 h-1.5 rounded-full animate-confetti-particle pointer-events-none z-30"
                        style={{
                          backgroundColor: p.color,
                          top: "50%",
                          left: "50%",
                          ["--cx" as any]: p.cx,
                          ["--cy" as any]: p.cy,
                          ["--crot" as any]: p.crot,
                        }}
                      />
                    ))}

                    <button
                      type="button"
                      onClick={() => copyToClipboard(reply.content, index)}
                      className={`py-1 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                        isCopied
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : "bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <span className="text-green-400 font-bold">✓</span>
                          <span>Copié !</span>
                        </>
                      ) : (
                        <>
                          <span>📋</span>
                          <span>Copier</span>
                        </>
                      )/* Semicolon is missing or inside bracket in older, keeping correct balance */}
                    </button>
                  </div>
                </div>

                {/* Reply Phrase Bubble (Text response) */}
                <p 
                  id={`reply-bubble-${index}`}
                  className="text-[#f0e8ff] font-medium leading-[1.7] text-base mb-4 select-all group-hover:text-white transition-colors"
                  style={{ fontFamily: '"Outfit", "DM Sans", sans-serif' }}
                >
                  {reply.content}
                </p>

                {/* Sentiment Score Indicator bar */}
                <div className="mb-4 bg-white/[0.02] border border-white/5 rounded-[15px] p-3 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      {sentimentValue === "positive" && (
                        <>
                          <span>😊</span>
                          <span className="text-emerald-400">Sentiment Positif</span>
                        </>
                      )}
                      {sentimentValue === "neutral" && (
                        <>
                          <span>😐</span>
                          <span className="text-amber-400">Sentiment Neutre</span>
                        </>
                      )}
                      {sentimentValue === "negative" && (
                        <>
                          <span>😏</span>
                          <span className="text-rose-400 font-semibold">Sentiment Piquant / Distant</span>
                        </>
                      )}
                    </span>
                    <span className={`text-[10px] font-extrabold ${
                      sentimentValue === "positive" ? "text-emerald-400" :
                      sentimentValue === "neutral" ? "text-amber-400" : "text-rose-400"
                    }`}>
                      {sentimentScoreValue}% d'intensité
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${sentimentScoreValue}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className={`h-full rounded-full ${
                        sentimentValue === "positive" ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
                        sentimentValue === "neutral" ? "bg-gradient-to-r from-amber-500 to-orange-400" :
                        "bg-gradient-to-r from-rose-500 to-red-400"
                      }`}
                    />
                  </div>
                </div>

                {/* Card Explanation footer */}
                <div className="pt-3 border-t border-white/5 flex items-start gap-1.5">
                  <span className="text-xs text-gray-400 italic font-medium leading-normal flex items-start gap-1">
                    <span className="text-rose-400 shrink-0 select-none">💡</span>
                    <span>{reply.explanation}</span>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
