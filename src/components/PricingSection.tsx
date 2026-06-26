import React, { useState, useEffect } from "react";
import { Check, ShieldCheck, Zap, Sparkles, Award, Lock, ArrowRight, X, CreditCard, Star, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PricingSectionProps {
  onSubscribeSuccess: (tier: "free" | "starter" | "premium") => void;
  currentTier: "free" | "starter" | "premium";
}

export default function PricingSection({ onSubscribeSuccess, currentTier }: PricingSectionProps) {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ id: "free" | "starter" | "premium"; name: string; price: string; period: string } | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Real Stripe Integration States
  const [isStripeConfigured, setIsStripeConfigured] = useState(false);
  const [isCreatingStripeSession, setIsCreatingStripeSession] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch if Stripe is configured on the backend
    fetch("/api/stripe/config")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.isConfigured === "boolean") {
          setIsStripeConfigured(data.isConfigured);
        }
      })
      .catch((err) => {
        console.error("Erreur de récupération de la configuration Stripe:", err);
      });
  }, []);

  const plans = [
    {
      id: "free" as const,
      name: "Gratuit",
      price: "0 €",
      period: "toujours",
      description: "Pour tester l'efficacité de LoveReply AI au quotidien",
      badge: "Actuel",
      features: [
        "5 générations de réponses par jour",
        "Tous les modes (drague, mignon, funny, ice cold)",
        "Résultats de qualité en 3 secondes",
        "Analyse du contexte basique",
      ],
      popular: false,
    },
    {
      id: "starter" as const,
      name: "Starter",
      price: "2,99 €",
      period: "mois",
      description: "Le choix parfait pour doper vos opportunités quotidiennes",
      badge: "⭐ Populaire",
      features: [
        "50 générations de réponses par jour",
        "Tous les modes & boosters de charme",
        "Historique complet de vos discussions (30 jours)",
        "Priorité serveur pour une vitesse optimale",
        "Sans engagement, résiliation en 1 clic",
      ],
      popular: true,
    },
    {
      id: "premium" as const,
      name: "Premium",
      price: "6,99 €",
      period: "mois",
      description: "L'artillerie lourde pour séduire sans aucune limite de crédit",
      badge: "Elite ♾️",
      features: [
        "Générations illimitées ♾️ (zéro crédit requis)",
        "Upload de captures d'écran illimités (OCR)",
        "Analyse complète du contexte de conversation",
        "Algorithme IA ultra-avancé de pointe",
        "Support client prioritaire 24/7",
      ],
      popular: false,
    },
  ];

  const handleOpenCheckout = (plan: typeof plans[0]) => {
    if (plan.id === "free") {
      onSubscribeSuccess("free");
      return;
    }
    setSelectedPlan({ id: plan.id, name: plan.name, price: plan.price, period: plan.period });
    setShowCheckoutModal(true);
    setPaymentSuccess(false);
    setStripeError(null);
  };

  const handleStripeCheckout = async () => {
    if (!selectedPlan) return;
    setIsCreatingStripeSession(true);
    setStripeError(null);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId: selectedPlan.id }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Impossible de démarrer la session de paiement.");
      }

      if (data.url) {
        // Redirect user to Stripe's secure hosted checkout page
        window.location.href = data.url;
      } else {
        throw new Error("L'URL de paiement Stripe n'a pas été fournie.");
      }
    } catch (err: any) {
      console.error("Erreur Checkout Stripe:", err);
      setStripeError(err.message || "Une erreur est survenue lors de l'initialisation du paiement.");
    } finally {
      setIsCreatingStripeSession(false);
    }
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      
      setTimeout(() => {
        if (selectedPlan) {
          onSubscribeSuccess(selectedPlan.id);
        }
        setShowCheckoutModal(false);
        setCardNumber("");
        setCardExpiry("");
        setCardCvc("");
      }, 1500);
    }, 2000);
  };

  return (
    <section id="pricing-section" className="w-full max-w-6xl mx-auto mt-20 scroll-mt-24 space-y-12">
      
      {/* Intro */}
      <div className="text-center space-y-4 max-w-2xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-gradient-to-r from-rose-500/10 to-purple-500/10 border border-rose-500/20 text-rose-300 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Award size={13} className="animate-bounce" />
          Tarifs LoveReply AI
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-300">
          Un Charisme Illimité, <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-purple-500">Sans Limite</span>
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Rejoignez des milliers d'utilisateurs qui ont transformé leur manière de draguer et de converser en ligne. Choisissez la formule qui convient le mieux à votre vie sentimentale.
        </p>
      </div>

      {/* Pricing Cards Grid with shimmer effects and Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {plans.map((plan) => {
          const isActive = currentTier === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative rounded-[2.2rem] p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                plan.popular
                  ? "border-2 border-rose-500 bg-gradient-to-b from-[#180a24]/80 to-[#0e0618]/90 shadow-[0_20px_50px_rgba(244,63,94,0.18)] scale-[1.03] z-10"
                  : "border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              {/* Shimmer overlay for Recommended "Starter" plan */}
              {plan.popular && (
                <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />
              )}

              {/* Pop badge */}
              <div className="absolute top-4 right-4">
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                  plan.popular ? "bg-rose-500 text-white shadow-md shadow-rose-500/30" : "bg-white/10 text-gray-300"
                }`}>
                  {plan.badge}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-xs text-gray-400 min-h-[32px]">{plan.description}</p>
                </div>

                {/* Price Tag */}
                <div className="flex items-baseline gap-1.5 py-4 border-y border-white/5">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">{plan.price}</span>
                  {plan.id !== "free" && <span className="text-sm text-gray-400">/ {plan.period}</span>}
                </div>

                {/* Feature list */}
                <ul className="space-y-3.5">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-300 leading-relaxed">
                      <Check size={14} className="text-rose-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Subscribe button */}
              <div className="pt-8">
                {isActive ? (
                  <div className="w-full text-center py-3.5 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.1)]">
                    <ShieldCheck size={16} />
                    Plan actuel actif
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenCheckout(plan)}
                    className={`w-full py-3.5 px-6 rounded-2xl text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
                      plan.popular
                        ? "bg-gradient-to-r from-rose-500 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-rose-500/20"
                        : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                    }`}
                  >
                    <span>{plan.id === "free" ? "Commencer gratuitement" : `Choisir ${plan.name}`}</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security assurances & Competitor benchmark info */}
      <div className="text-center space-y-3 max-w-2xl mx-auto pt-4 px-4">
        <p className="text-xs text-gray-400 font-medium flex items-center justify-center gap-2 flex-wrap">
          <span>🔒 Paiement 100% sécurisé</span>
          <span className="text-white/20">•</span>
          <span>CB, PayPal</span>
          <span className="text-white/20">•</span>
          <span>Sans engagement</span>
          <span className="text-white/20">•</span>
          <span>Annulation en 1 clic</span>
        </p>
        <p className="text-xs text-rose-300/90 font-bold flex items-center justify-center gap-1">
          <span>💸 Jusqu'à 4× moins cher que nos concurrents américains (Rizz AI, etc.)</span>
        </p>
      </div>

      {/* Interactive Payment Checkout Simulator Modal */}
      <AnimatePresence>
        {showCheckoutModal && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-[#0f0a14] border border-white/10 rounded-[2.5rem] p-6 sm:p-8 relative shadow-2xl overflow-hidden"
            >
              <div className="absolute -right-20 -top-20 w-44 h-44 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Close */}
              <button
                type="button"
                onClick={() => !isProcessingPayment && setShowCheckoutModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="space-y-6">
                
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-2">
                    <CreditCard size={22} className="animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Paiement Sécurisé</h3>
                  <p className="text-xs text-gray-400 font-medium">Formule {selectedPlan.name}</p>
                </div>

                {/* Plan Info */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-semibold text-gray-400">Abonnement :</p>
                    <p className="text-sm font-bold text-white mt-0.5">{selectedPlan.name} LoveReply</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-400">Tarif :</p>
                    <p className="text-sm font-extrabold text-rose-300 mt-0.5">{selectedPlan.price} <span className="text-[10px] font-normal text-gray-400">/{selectedPlan.period}</span></p>
                  </div>
                </div>

                {/* Notice / Stripe Integration Check */}
                {isStripeConfigured ? (
                  <div className="space-y-4">
                    <p className="text-xs text-center text-gray-400">
                      Utilisez le système officiel Stripe pour débloquer votre accès en toute sécurité. Tous les moyens de paiement sont gérés (CB, Apple Pay, Google Pay, etc.).
                    </p>

                    <button
                      type="button"
                      onClick={handleStripeCheckout}
                      disabled={isCreatingStripeSession}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_4px_20px_rgba(16,185,129,0.2)]"
                    >
                      {isCreatingStripeSession ? (
                        <>
                          <RefreshCw size={14} className="animate-spin text-white" />
                          <span>Redirection vers Stripe...</span>
                        </>
                      ) : (
                        <>
                          <span>💳 Payer par Stripe sécurisé</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>

                    {stripeError && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 text-center">
                        {stripeError}
                      </div>
                    )}

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-white/5"></div>
                      <span className="flex-shrink mx-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">OU SIMULATION DE TEST</span>
                      <div className="flex-grow border-t border-white/5"></div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed space-y-2">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Star size={13} className="text-amber-400" />
                      <span>Configuration des Vrais Paiements :</span>
                    </div>
                    <p>
                      Pour activer les vrais paiements sécurisés (Carte Bleue, PayPal, Apple Pay, SEPA...), renseignez votre clé <strong>STRIPE_SECRET_KEY</strong> dans les paramètres de l'application. En attendant, utilisez le simulateur ci-dessous pour tester.
                    </p>
                  </div>
                )}

                {/* Secure Form */}
                {paymentSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6 space-y-3 flex flex-col items-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <ShieldCheck size={28} className="animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-white text-base">Paiement Réussi !</p>
                      <p className="text-xs text-emerald-400/90 font-medium">Activation du statut {selectedPlan.name}...</p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSimulatePayment} className="space-y-4">
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Numéro de carte</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "").substring(0, 16);
                            const matches = val.match(/\d{4,16}/g);
                            const match = matches && matches[0] || "";
                            const parts = [];
                            for (let i = 0, len = match.length; i < len; i += 4) {
                              parts.push(match.substring(i, i + 4));
                            }
                            setCardNumber(parts.length > 0 ? parts.join(" ") : val);
                          }}
                          placeholder="4242 4242 4242 4242"
                          className="w-full rounded-xl bg-black/50 border border-white/10 py-3 pl-4 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose-500 transition-colors"
                        />
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                          <CreditCard size={16} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Expiration</label>
                        <input
                          type="text"
                          required
                          placeholder="12/28"
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "").substring(0, 4);
                            if (val.length >= 2) {
                              setCardExpiry(val.substring(0, 2) + "/" + val.substring(2));
                            } else {
                              setCardExpiry(val);
                            }
                          }}
                          className="w-full rounded-xl bg-black/50 border border-white/10 py-3 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose-500 transition-colors text-center"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Code CVC</label>
                        <input
                          type="password"
                          required
                          maxLength={3}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))}
                          placeholder="•••"
                          className="w-full rounded-xl bg-black/50 border border-white/10 py-3 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose-500 transition-colors text-center"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessingPayment}
                      className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessingPayment ? (
                        <>
                          <RefreshCw size={14} className="animate-spin text-white" />
                          <span>Validation en cours...</span>
                        </>
                      ) : (
                        <>
                          <span>Débloquer mon accès {selectedPlan.name}</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-center text-gray-500 leading-snug flex items-center justify-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-500" />
                      SSL sécurisé 256-bits. Sans engagement.
                    </p>

                  </form>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
