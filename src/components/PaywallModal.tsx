import React from "react";
import { X, Lock, Check, ShieldCheck, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (tier: "free" | "starter" | "premium") => void;
  currentTier: "free" | "starter" | "premium";
}

export default function PaywallModal({ isOpen, onClose, onSubscribe, currentTier }: PaywallModalProps) {
  
  const options = [
    {
      id: "free" as const,
      name: "Gratuit",
      price: "0 €",
      credits: "5 / jour",
      features: ["Tous les styles de réponse", "3 sec d'attente"],
      cta: "Actuel",
      active: currentTier === "free",
      highlight: false,
    },
    {
      id: "starter" as const,
      name: "Starter",
      price: "2,99 €/m",
      credits: "50 / jour",
      features: ["Filtres boosters", "Historique 30j"],
      cta: "Choisir",
      active: currentTier === "starter",
      highlight: false,
    },
    {
      id: "premium" as const,
      name: "Premium",
      price: "6,99 €/m",
      credits: "Illimité ♾️",
      features: ["Upload captures", "IA ultra-rapide"],
      cta: "Choisir ⭐",
      active: currentTier === "premium",
      highlight: true,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          {/* Backdrop click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 15 }}
            className="w-full max-w-lg bg-[#0e0a15] border border-white/10 rounded-[2.5rem] p-6 sm:p-8 relative shadow-2xl overflow-hidden z-10"
          >
            {/* Ambient visual background glow */}
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Discrete Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>

            {/* Header */}
            <div className="text-center space-y-2 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-2 animate-bounce">
                <Lock size={20} />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Vos crédits gratuits sont épuisés ✨
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
                Ne laissez pas un blanc gâcher votre conversation. Rejoignez Premium pour des générations illimitées.
              </p>
              
              {/* Badge */}
              <div className="inline-block mt-2">
                <span className="text-[10px] font-extrabold px-3 py-1 bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/20 text-amber-300 rounded-full uppercase tracking-wider">
                  🇺🇸 4× moins cher que Rizz AI
                </span>
              </div>
            </div>

            {/* Grid options */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              {options.map((opt) => (
                <div
                  key={opt.id}
                  className={`relative p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    opt.active
                      ? "border-emerald-500 bg-emerald-500/5 shadow-md"
                      : opt.highlight
                      ? "border-rose-500 bg-gradient-to-r from-[#1d0a27] to-[#0f0717] shadow-lg shadow-rose-500/10"
                      : "border-white/5 bg-white/[0.02] hover:border-white/10"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{opt.name}</h4>
                      {opt.highlight && (
                        <span className="text-[9px] font-extrabold bg-rose-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Best-Seller
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 leading-none">
                      Crédits : <span className="text-rose-300 font-bold">{opt.credits}</span>
                    </p>
                    <div className="flex gap-2.5 text-[10px] text-gray-400 pt-1 flex-wrap">
                      {opt.features.map((f, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <Check size={10} className="text-emerald-400" /> {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                    <span className="text-base font-extrabold text-white">{opt.price}</span>
                    
                    {opt.active ? (
                      <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                        Actuel
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSubscribe(opt.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                          opt.highlight
                            ? "bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md shadow-rose-500/10"
                            : "bg-white/10 hover:bg-white/15 text-white"
                        }`}
                      >
                        {opt.cta}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer trust lines */}
            <div className="text-center text-[10px] text-gray-500 space-y-1 border-t border-white/5 pt-4">
              <p>🔒 Paiements SSL cryptés. Annulation immédiate en un clic.</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
