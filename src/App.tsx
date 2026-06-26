import React, { useState, useEffect, useRef } from "react";
import { 
  Heart, 
  Sparkles, 
  Send, 
  RefreshCw, 
  HelpCircle, 
  AlertCircle, 
  Flame, 
  ArrowRight,
  Zap,
  Info,
  Lock,
  Unlock,
  Coins,
  ShieldCheck,
  Star,
  Users,
  Award,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { BOOSTER_MODES } from "./constants";
import { BoosterMode, GenerationResult, GoogleUser } from "./types";

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("JWT Decode failed", e);
    return null;
  }
}
declare global {
  interface Window {
    google?: any;
  }
}

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      try {
        return sessionStorage.getItem(key);
      } catch {
        return null;
      }
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      try {
        sessionStorage.setItem(key, value);
      } catch {}
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      try {
        sessionStorage.removeItem(key);
      } catch {}
    }
  }
};

import UploadZone from "./components/UploadZone";
import ManualInput from "./components/ManualInput";
import ResponseCards from "./components/ResponseCards";
import HistorySidebar from "./components/HistorySidebar";
import PricingSection from "./components/PricingSection";

// Cinematic Animations imports
import ParticlesBackground from "./components/ParticlesBackground";
import Hover3DTilt from "./components/Hover3DTilt";
import SplitTextReveal from "./components/SplitTextReveal";
import IntroLoader from "./components/IntroLoader";
import PaywallModal from "./components/PaywallModal";

const LOADING_STATUSES = [
  "📥 Lecture de la conversation...",
  "👁️ Analyse visuelle de la capture d'écran...",
  "🧠 Décryptage du contexte émotionnel...",
  "⚡ Détection des intentions & sous-entendus...",
  "🧪 Application du filtre Booster de séduction...",
  "✍️ Peaufinage de répliques 100% naturelles...",
  "✨ Prêt à briller !"
];

export default function App() {
  // Page intro loading state
  const [introComplete, setIntroComplete] = useState(false);

  // Theme State: automatically detects system preference or uses manual override
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      const stored = safeStorage.getItem("lr_theme") as "dark" | "light" | null;
      if (stored === "dark" || stored === "light") return stored;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {
      return "dark";
    }
  });

  // Apply theme class to documentElement
  useEffect(() => {
    try {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.style.colorScheme = "dark";
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.style.colorScheme = "light";
      }
      safeStorage.setItem("lr_theme", theme);
    } catch (e) {
      console.error("Erreur d'application du thème:", e);
    }
  }, [theme]);

  // Sync theme with system changes if no manual override exists in storage
  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        const stored = safeStorage.getItem("lr_theme");
        if (!stored) {
          setTheme(e.matches ? "dark" : "light");
        }
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } catch {
      return;
    }
  }, []);

  // Google Sign-In & Profile Dropdown State
  const [user, setUser] = useState<GoogleUser | null>(() => {
    try {
      const stored = safeStorage.getItem("lr_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [booster, setBooster] = useState<BoosterMode>("none");
  const [hoveredModeId, setHoveredModeId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStatusIndex, setLoadingStatusIndex] = useState(0);
  const [currentResult, setCurrentResult] = useState<GenerationResult | null>(null);
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ripples, setRipples] = useState<{ id: string; x: number; y: number }[]>([]);

  // Daily Credits & Tier System
  const [currentTier, setCurrentTier] = useState<"free" | "starter" | "premium">("free");
  const [credits, setCredits] = useState<number>(5);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  // Time remaining until midnight
  const [timeUntilMidnight, setTimeUntilMidnight] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);

  const TODAY = new Date().toISOString().split("T")[0];
  const CREDIT_KEY = user ? `lr_credits_${user.sub}_${TODAY}` : `lr_credits_${TODAY}`;

  // Real-time midnight countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeUntilMidnight(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const timerId = setInterval(updateCountdown, 1000);
    return () => clearInterval(timerId);
  }, []);

  // Sync historical session entries, user tiers & credits on startup
  useEffect(() => {
    try {
      const userKey = user ? user.sub : "guest";
      const storedHistory = safeStorage.getItem(`lovereply_history_${userKey}`) || safeStorage.getItem("lovereply_history");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      } else {
        setHistory([]);
      }

      const storedTier = safeStorage.getItem(`lr_tier_${userKey}`) || safeStorage.getItem("lr_tier") as "free" | "starter" | "premium" | null;
      const initialTier = (storedTier as any) || "free";
      setCurrentTier(initialTier);

      const maxCredits = initialTier === "premium" ? 99999 : initialTier === "starter" ? 50 : 5;
      const storedCredits = safeStorage.getItem(CREDIT_KEY);
      if (storedCredits === null) {
        safeStorage.setItem(CREDIT_KEY, maxCredits.toString());
        setCredits(maxCredits);
      } else {
        setCredits(parseInt(storedCredits, 10));
      }
    } catch (e) {
      console.error("Échec de chargement des données initiales", e);
    }
  }, [user, CREDIT_KEY]);

  // Handle Stripe callback redirection and upgrade tiers dynamically
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const status = params.get("status");
      const plan = params.get("plan");

      if (status === "success" && (plan === "starter" || plan === "premium")) {
        // Clear query parameters from URL without reloading the page
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: newUrl }, "", newUrl);

        // Success notification
        setError(`Félicitations ! Votre abonnement ${plan === "premium" ? "Premium" : "Starter"} a été activé avec succès via Stripe ! 🎉 Vous avez maintenant accès à toutes les fonctionnalités.`);
        
        // Upgrade locally
        handleUpgrade(plan);
      } else if (status === "cancel") {
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: newUrl }, "", newUrl);
        setError("Le paiement Stripe a été annulé. Vous pouvez réessayer à tout moment !");
      }
    } catch (e) {
      console.error("Erreur d'analyse des paramètres Stripe", e);
    }
  }, [user, CREDIT_KEY]);

  // Initialize Google Sign-In Programmatically (handling load timing gracefully)
  useEffect(() => {
    if (user) return;

    let attempts = 0;
    const initializeGSI = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: "192281415580-example.apps.googleusercontent.com",
          callback: (response: any) => {
            const payload = parseJwt(response.credential);
            if (payload) {
              const googleUser: GoogleUser = {
                name: payload.name || "Utilisateur Google",
                email: payload.email || "",
                picture: payload.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
                sub: payload.sub
              };
              safeStorage.setItem("lr_user", JSON.stringify(googleUser));
              setUser(googleUser);
            }
          }
        });

        const container = document.getElementById("gsi-button-container");
        if (container) {
          window.google.accounts.id.renderButton(container, {
            theme: "filled_blue",
            size: "large",
            width: "320",
            shape: "pill"
          });
        }
      } else {
        attempts++;
        if (attempts < 10) {
          setTimeout(initializeGSI, 500);
        }
      }
    };

    initializeGSI();
  }, [user]);

  // Logout handler calling GSI revoke and clearing session data
  const handleLogout = () => {
    try {
      if (window.google?.accounts?.id && user && user.email && !user.sub.startsWith("demo_")) {
        window.google.accounts.id.revoke(user.email, () => {
          safeStorage.removeItem("lr_user");
          setUser(null);
          window.location.reload();
        });
      } else {
        safeStorage.removeItem("lr_user");
        setUser(null);
        window.location.reload();
      }
    } catch (e) {
      safeStorage.removeItem("lr_user");
      setUser(null);
      window.location.reload();
    }
  };

  // Simulated Demo login for robust local preview fallback
  const handleDemoLogin = () => {
    const demoUser: GoogleUser = {
      name: "Sophie Martin",
      email: "sophie.martin@gmail.com",
      picture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      sub: "demo_123456789"
    };
    safeStorage.setItem("lr_user", JSON.stringify(demoUser));
    setUser(demoUser);
  };

  // Sync history with safeStorage
  const saveHistoryToLocalStorage = (newHistory: GenerationResult[]) => {
    try {
      if (user) {
        safeStorage.setItem(`lovereply_history_${user.sub}`, JSON.stringify(newHistory));
      } else {
        safeStorage.setItem("lovereply_history", JSON.stringify(newHistory));
      }
    } catch (e) {
      console.error("Impossible de stocker l'historique localement", e);
    }
  };

  // Status transitions timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setLoadingStatusIndex(0);
      interval = setInterval(() => {
        setLoadingStatusIndex((prev) => (prev + 1) % LOADING_STATUSES.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Cleanly abort on component unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle generation action
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submissions (debounce)
    if (isGenerating) return;

    // 1. Inputs validation
    if (!inputText.trim() && !selectedImage) {
      setError("Collez d'abord un message reçu ✨");
      return;
    }
    if (inputText.trim() && inputText.trim().length < 10 && !selectedImage) {
      setError("Ajoutez un peu plus de contexte pour de meilleures réponses");
      return;
    }

    // 2. Credits check
    if (currentTier !== "premium" && credits <= 0) {
      setIsPaywallOpen(true);
      setError("Vos crédits gratuits journaliers sont épuisés. Passez Premium pour continuer sans limite !");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCurrentResult(null);

    // Create the AbortController for cancel on page exit & timeout after 60 seconds
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 60000);

    // Limit length to 2000 chars and clean emojis or characters
    const trimmedText = inputText ? inputText.slice(0, 2000) : "";

    // Decrement credits before generating
    let nextCredits = credits;
    if (currentTier !== "premium") {
      nextCredits = Math.max(0, credits - 1);
      setCredits(nextCredits);
      safeStorage.setItem(CREDIT_KEY, nextCredits.toString());
    }

    try {
      const response = await fetch("/api/love-reply/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: trimmedText,
          image: selectedImage,
          booster: booster,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        // Handle precise HTTP status codes
        if (response.status === 401) {
          setError("Erreur de configuration, contactez le support. 🔒");
        } else if (response.status === 429) {
          setError("Trop de requêtes, patientez quelques secondes. ⏳");
        } else if (response.status === 503 || response.status === 502 || response.status === 504) {
          setError("Service temporairement indisponible, réessayez dans 30 secondes. 🔄");
        } else {
          try {
            const errData = await response.json();
            setError(errData.error || "Une petite erreur s'est glissée. On réessaie ? ✨");
          } catch {
            setError("Une petite erreur s'est glissée. On réessaie ? ✨");
          }
        }

        // Refund credits on failure
        if (currentTier !== "premium") {
          const refundedCredits = nextCredits + 1;
          setCredits(refundedCredits);
          safeStorage.setItem(CREDIT_KEY, refundedCredits.toString());
        }
        return;
      }

      let data;
      try {
        data = await response.json();
      } catch {
        setError("Une petite erreur s'est glissée. On réessaie ? ✨");
        if (currentTier !== "premium") {
          const refundedCredits = nextCredits + 1;
          setCredits(refundedCredits);
          safeStorage.setItem(CREDIT_KEY, refundedCredits.toString());
        }
        return;
      }

      if (!data || !data.replies || !Array.isArray(data.replies) || data.replies.length === 0) {
        setError("Génération incomplète, réessayez ✨");
        if (currentTier !== "premium") {
          const refundedCredits = nextCredits + 1;
          setCredits(refundedCredits);
          safeStorage.setItem(CREDIT_KEY, refundedCredits.toString());
        }
        return;
      }

      const newResult: GenerationResult = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        inputMessage: trimmedText || (selectedImage ? "Capture d'écran de conversation" : "Message inconnu"),
        hasImage: !!selectedImage,
        detectedSender: data.detectedSender || "Inconnu",
        detectedTone: data.detectedTone || "Non identifié",
        contextAnalysis: data.contextAnalysis || "Analyse indisponible",
        replies: data.replies,
        boosterUsed: booster,
      };

      setCurrentResult(newResult);

      // Save to history list
      const updatedHistory = [newResult, ...history].slice(0, 30);
      setHistory(updatedHistory);
      saveHistoryToLocalStorage(updatedHistory);

    } catch (err: any) {
      clearTimeout(timeout);
      console.error("Erreur générale de connexion API:", err);

      if (err.name === "AbortError") {
        setError("La génération prend trop longtemps, réessayez ⏳");
      } else if (!navigator.onLine) {
        setError("Vérifiez votre connexion internet 📶");
      } else {
        setError("Oups, la connexion a été interrompue. Réessayez dans quelques secondes 🔄");
      }

      // Refund credits on catch error
      if (currentTier !== "premium") {
        setCredits((prevCredits) => {
          const refunded = prevCredits + 1;
          safeStorage.setItem(CREDIT_KEY, refunded.toString());
          return refunded;
        });
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleSelectHistoryItem = (item: GenerationResult) => {
    setCurrentResult(item);
    setBooster(item.boosterUsed as BoosterMode);
    const elem = document.getElementById("results-anchor");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const clearHistory = () => {
    if (confirm("Voulez-vous vraiment effacer tout votre historique ?")) {
      setHistory([]);
      if (user) {
        safeStorage.removeItem(`lovereply_history_${user.sub}`);
      } else {
        safeStorage.removeItem("lovereply_history");
      }
      if (currentResult) {
        setCurrentResult(null);
      }
    }
  };

  const handleResetForm = () => {
    setSelectedImage(null);
    setInputText("");
    setBooster("none");
    setError(null);
    setCurrentResult(null);
  };

  const handleUpgrade = (tier: "free" | "starter" | "premium") => {
    setCurrentTier(tier);
    const tierKey = user ? `lr_tier_${user.sub}` : "lr_tier";
    safeStorage.setItem(tierKey, tier);

    const maxCredits = tier === "premium" ? 99999 : tier === "starter" ? 50 : 5;
    safeStorage.setItem(CREDIT_KEY, maxCredits.toString());
    setCredits(maxCredits);
    setError(null);
    setIsPaywallOpen(false);
  };

  const activeBoosterConfig = BOOSTER_MODES.find(m => m.id === booster);

  const renderCreditsIndicator = () => {
    if (currentTier === "premium") {
      return (
        <span className="flex items-center gap-1.5 text-rose-300 font-bold">
          <Sparkles size={12} className="animate-pulse" /> ♾️ Premium Illimité
        </span>
      );
    }

    const max = currentTier === "starter" ? 50 : 5;
    if (currentTier === "starter") {
      return (
        <span className="text-rose-300 font-extrabold tracking-wider">
          ● {credits} / 50 restants
        </span>
      );
    }

    // Free tier dots
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, idx) => {
          const isActive = idx < credits;
          return (
            <motion.span
              key={idx}
              animate={{ scale: isActive ? [1, 1.2, 1] : 1 }}
              className={`text-sm ${isActive ? "text-rose-500 font-black" : "text-white/20"}`}
            >
              ●
            </motion.span>
          );
        })}
        <span className="text-[11px] text-gray-400 ml-1.5 font-bold">{credits}/5 restants</span>
      </div>
    );
  };

  const isLocked = currentTier !== "premium" && credits <= 0;

  // Render cinematic page loading overlay
  if (!introComplete) {
    return <IntroLoader onComplete={() => setIntroComplete(true)} />;
  }

  // If user is not authenticated, show full-screen blocking premium Auth Modal
  if (!user) {
    return (
      <div className="min-h-screen w-screen bg-bg-app text-text-main flex items-center justify-center relative overflow-hidden antialiased font-sans select-none pb-12 transition-colors duration-300">
        {/* Particles background */}
        <ParticlesBackground />

        {/* Auth modal card wrapper with entry animations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, duration: 0.5 }}
          className="relative max-w-[420px] w-full mx-4 rounded-[28px] border border-border-main bg-bg-card backdrop-blur-2xl p-8 md:p-10 shadow-2xl overflow-hidden space-y-6 flex flex-col items-center text-center transition-colors duration-300"
        >
          {/* Animated conic gradient border for extreme premium finish */}
          <div 
            className="absolute inset-0 -z-10 animate-[rotate-gradient_6s_linear_infinite] rounded-[28px] p-[1.5px] pointer-events-none"
            style={{ background: "conic-gradient(from var(--angle), #be3a8a, #6025d4, #be3a8a)" }}
          >
            <div className="w-full h-full bg-bg-app rounded-[27px] transition-colors duration-300" />
          </div>

          {/* Logo with pulse glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-rose-500/30 rounded-2xl blur-xl animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/20 active:scale-95 transition-transform">
              <Heart size={26} className="text-white fill-white/20 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-400 font-sans block">✦ LoveReply AI ✦</span>
            <h2 className="text-2xl font-black tracking-tight text-text-main font-sans">
              Bienvenue ✨
            </h2>
            <p className="text-xs text-text-muted leading-relaxed max-w-xs mx-auto">
              Répondez parfaitement à chaque message. Connectez-vous pour commencer à séduire.
            </p>
          </div>

          {/* Native Google Sign-In Button Container */}
          <div className="w-full flex justify-center py-2 relative z-10">
            <div id="gsi-button-container" className="min-h-[44px] flex items-center justify-center" />
          </div>

          {/* Separation indicator */}
          <div className="flex items-center text-white/5 text-xs py-1 w-full">
            <div className="flex-1 h-px bg-white/10" />
            <span className="px-3 font-mono text-[9px] uppercase font-bold tracking-wider text-gray-500">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* High fidelity Demo selector */}
          <button
            onClick={handleDemoLogin}
            type="button"
            className="w-full h-12 rounded-xl bg-white text-gray-900 font-bold text-xs uppercase tracking-wider hover:bg-rose-50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5 relative overflow-hidden group"
          >
            {/* Shimmer reflection */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
            <span>🚀 Tester en Mode Démo</span>
          </button>

          <div className="space-y-1 pt-2">
            <p className="text-[10px] text-gray-500 font-semibold">
              5 générations gratuites par jour • Sans CB • Annulation facile
            </p>
            <p className="text-[9px] text-gray-600 font-mono">
              🔒 Connexion sécurisée Google • Vos données ne sont jamais partagées
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-app text-text-main flex flex-col items-center antialiased relative overflow-x-hidden selection:bg-rose-500/40 selection:text-rose-100 font-sans pb-12 transition-colors duration-300">
      
      {/* 1. CINEMATIC CANVAS BACKGROUND PARTICLES */}
      <ParticlesBackground booster={booster} />

      {/* FIXED GLASS NAVIGATION */}
      <nav className="w-full fixed top-0 z-50 bg-bg-nav backdrop-blur-xl border-b border-border-main px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div 
            onClick={handleResetForm}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/35 cursor-pointer active:scale-95 transition-transform"
          >
            <Heart size={18} className="text-white fill-white/20 animate-pulse" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight bg-gradient-to-r from-rose-400 via-rose-300 to-violet-400 bg-clip-text text-transparent uppercase font-sans">
              LoveReply AI
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-text-muted">
          <a href="#try" className="hover:text-rose-400 transition-colors">Générateur</a>
          <a href="#pricing-section" className="hover:text-rose-400 transition-colors">Tarifs</a>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-btn-sec border border-border-main hover:opacity-90 transition-all cursor-pointer text-xs font-semibold text-text-main"
              >
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-6 h-6 rounded-full border border-rose-500/30 object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="text-gray-200 hidden sm:inline">{user.name.split(" ")[0]}</span>
                <span className="text-gray-400 text-[10px]">▼</span>
              </button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    {/* Backdrop click to close */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-bg-nav backdrop-blur-xl border border-border-main p-3 shadow-2xl z-50 space-y-2 text-xs text-text-muted transition-all duration-300"
                    >
                      <div className="px-2 py-1.5 border-b border-border-main pb-2">
                        <p className="font-bold text-text-main truncate">{user.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                      </div>

                      <div className="space-y-1 py-1">
                        <div className="flex justify-between items-center px-2 py-1 bg-white/5 dark:bg-white/5 border border-border-main rounded-lg text-[10px]">
                          <span>Plan actuel :</span>
                          <span className="font-bold uppercase tracking-wider text-rose-400 text-[9px]">
                            {currentTier === "premium" ? "👑 Premium" : currentTier === "starter" ? "🚀 Starter" : "🌱 Gratuit"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center px-2 py-1 bg-white/5 dark:bg-white/5 border border-border-main rounded-lg text-[10px]">
                          <span>Crédits restants :</span>
                          <span className="font-mono font-bold text-text-main">
                            {currentTier === "premium" ? "♾️" : `${credits}/${currentTier === "starter" ? 50 : 5}`}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-border-main my-1" />

                      {/* Manual Theme Toggle segment */}
                      <div className="flex items-center justify-between px-2 py-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Thème</span>
                        <div className="flex items-center gap-0.5 bg-black/5 dark:bg-white/5 p-0.5 rounded-lg border border-border-main">
                          <button
                            type="button"
                            onClick={() => setTheme("light")}
                            className={`px-2 py-1 rounded-md transition-all text-[10px] font-bold flex items-center gap-1 ${
                              theme === "light"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-400 hover:text-text-main"
                            }`}
                          >
                            ☀️ Clair
                          </button>
                          <button
                            type="button"
                            onClick={() => setTheme("dark")}
                            className={`px-2 py-1 rounded-md transition-all text-[10px] font-bold flex items-center gap-1 ${
                              theme === "dark"
                                ? "bg-white/10 text-white shadow-sm"
                                : "text-gray-400 hover:text-text-main"
                            }`}
                          >
                            🌙 Sombre
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-border-main my-1" />

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsPaywallOpen(true);
                        }}
                        className="w-full text-left px-2 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                      >
                        👑 Passer à Premium
                      </button>

                      <div className="border-t border-border-main my-1" />

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-2 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                      >
                        🚪 Se déconnecter
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              type="button" 
              onClick={() => document.getElementById("try")?.scrollIntoView({ behavior: "smooth" })}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-lg shadow-rose-500/10 active:scale-[0.97] transition-all cursor-pointer"
            >
              Essayer
            </button>
          )}
        </div>
      </nav>

      {/* 2. FIXED CREDITS BAR RIGHT UNDER THE HEADER NAVIGATION */}
      <div className="w-full fixed top-[58px] z-40 bg-bg-nav backdrop-blur-md border-b border-border-main py-2 px-4 flex items-center justify-center gap-3 text-[11px] font-semibold text-text-muted transition-colors duration-300">
        <div className="flex items-center gap-2.5 flex-wrap justify-center text-center">
          <span className="text-rose-300 font-extrabold uppercase tracking-wider font-sans">✦ Crédits aujourd'hui :</span>
          {renderCreditsIndicator()}
          <span className="opacity-25">•</span>
          {isLocked ? (
            <span className="text-rose-400 font-extrabold animate-pulse tracking-wide uppercase">0 crédits — Passez Premium ✨</span>
          ) : (
            <span className="text-text-muted">Se recharge dans {timeUntilMidnight}</span>
          )}
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto pt-28 px-4 flex flex-col items-center">
        
        {/* HERO SECTION WITH CINEMATIC REVEALS AND ANIMATIONS */}
        <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-10 relative z-10">
          <div className="col-span-12 lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-full text-[10px] font-extrabold uppercase tracking-widest font-sans">
              ✦ Intelligence Artificielle · Séduction
            </div>

            {/* Typewriter and split-text animation heading */}
            <SplitTextReveal 
              text="Réponds toujours parfaitement à" 
              italicText="chaque message."
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-main leading-[1.1] tracking-tight font-sans"
            />

            <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-lg mx-auto lg:mx-0">
              LoveReply AI analyse en profondeur vos conversations (WhatsApp, Instagram, SMS, captures d'écran) et génère des répliques magnétiques, intelligentes ou pleines d'humour en 3 secondes.
            </p>

            <div className="flex items-center justify-center lg:justify-start gap-4 flex-wrap text-xs text-text-muted">
              <span className="star-icons text-amber-400 font-bold">★★★★★</span>
              <span>4.9/5 · Plus de 47 000 réponses générées</span>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-4 flex-wrap pt-2">
              <button 
                type="button"
                onClick={() => document.getElementById("try")?.scrollIntoView({ behavior: "smooth" })}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer animate-[pulse_2s_infinite]"
              >
                ✨ Générer une réponse
              </button>
              <button 
                type="button"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                className="px-6 py-3.5 rounded-2xl bg-bg-btn-sec border border-border-main text-text-muted hover:text-text-main font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer"
              >
                Découvrir →
              </button>
            </div>
          </div>

          {/* Phone mockup visualization */}
          <div className="col-span-12 lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-xs relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-purple-600/20 rounded-[2.5rem] blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />
              
              {/* Phone border */}
              <div className="relative bg-[#0a0812] border-4 border-white/10 rounded-[2.5rem] p-5 shadow-[0_30px_70px_rgba(0,0,0,0.8)] overflow-hidden">
                <div className="flex items-center gap-3 pb-3 border-b border-white/5 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-purple-500 flex items-center justify-center text-sm font-bold">😏</div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-none">Karim 😏</h4>
                    <span className="text-[10px] text-gray-500">en ligne il y a 2 min</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="bg-white/5 text-gray-300 p-3 rounded-2xl rounded-tl-sm max-w-[85%] leading-relaxed">
                    « Tu fais quoi ce soir ? J'ai deux places pour un concert 🎶 »
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-rose-400 block font-sans">✦ LoveReply AI génère :</span>
                    
                    <div className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-300">
                      <span className="font-extrabold text-[9px] uppercase block mb-0.5">💕 Mignonne</span>
                      Ça tombe bien, j'avais justement envie de bonne musique… et de bonne compagnie 🎵
                    </div>

                    <div className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/10 text-purple-300">
                      <span className="font-extrabold text-[9px] uppercase block mb-0.5">😏 Drague</span>
                      Avec toi ? Je pense que la soirée sera meilleure que le concert 😉
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BAR GRADIENT */}
        <section className="w-full max-w-6xl mx-auto py-5 px-6 rounded-3xl bg-gradient-to-r from-rose-500 to-purple-600 text-white flex flex-wrap items-center justify-around gap-6 text-xs font-bold shadow-xl shadow-rose-500/5 mt-8 relative z-10">
          <div className="flex items-center gap-1.5"><Sparkles size={14} /> IA Intégrée</div>
          <div className="flex items-center gap-1.5"><Heart size={14} /> 5 Styles de réponse</div>
          <div className="flex items-center gap-1.5"><Zap size={14} /> Résultats en 3 sec</div>
          <div className="flex items-center gap-1.5"><Lock size={14} /> 100% privé</div>
        </section>

        {/* 3. CORE GENERATOR SECTION (THE ACTUAL INTERACTIVE APP) */}
        <section id="try" className="w-full py-16 space-y-8 relative z-10 scroll-mt-24">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-extrabold text-rose-400 tracking-widest uppercase block font-sans">Essayez maintenant</span>
            <h2 className="text-3xl font-extrabold text-text-main">Testez LoveReply AI</h2>
            <p className="text-sm text-text-muted max-w-lg mx-auto">
              Glissez une image ou tapez le message reçu ci-dessous pour générer instantanément vos options.
            </p>
          </div>

          {/* Responsive Dashboard Grid */}
          <main className="w-full flex flex-col lg:grid lg:grid-cols-12 gap-8 relative px-1 sm:px-2">
            
            {/* Left column: Input Form & History */}
            <div className="col-span-12 lg:col-span-5 space-y-6 flex flex-col">
              
              {/* Main Input Form Container */}
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 md:p-6 shadow-[0_15px_35px_rgba(0,0,0,0.5)] relative overflow-hidden">
                
                {/* Absolute Glass Lock Overlay when credits <= 0 */}
                {isLocked && (
                  <div className="absolute inset-0 bg-[#0c0812]/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/10">
                      <Lock size={24} className="animate-pulse" />
                    </div>
                    <div className="space-y-1.5 max-w-xs">
                      <h3 className="text-base font-bold text-white">Essai Gratuit Terminé (5/5)</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Votre charme ne devrait pas avoir de limite. Abonnez-vous pour débloquer l'intégralité de l'application et de nos modèles IA.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const pricingElem = document.getElementById("pricing-section");
                        if (pricingElem) {
                          pricingElem.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-[0.97] shadow-lg shadow-rose-500/25"
                    >
                      S'abonner & Débloquer l'accès ✨
                    </button>
                  </div>
                )}

                <form onSubmit={handleGenerate} className="space-y-6">
                  
                  {/* Step 1: Input source */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-white/10">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shadow-md shadow-rose-500/50"></span>
                      <span className="text-sm font-semibold text-rose-300/90">Analyse de la conversation</span>
                    </div>

                    {/* Upload screenshot section */}
                    <UploadZone 
                      onImageSelected={setSelectedImage} 
                      selectedImage={selectedImage} 
                    />

                    {/* Divider spacer */}
                    <div className="flex items-center text-white/5 text-xs py-1">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="px-3 font-mono text-[10px] uppercase font-bold tracking-widest text-gray-500">ou</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Copied/Manual Text area */}
                    <ManualInput 
                      text={inputText} 
                      onChange={setInputText} 
                    />
                  </div>

                  {/* Step 2: Booster selector with sliding pill layout and masking */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest font-sans">Choisir le Tone / Booster</p>
                      {booster !== "none" && (
                        <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5 animate-pulse">
                          <Flame size={12} /> Booster actif
                        </span>
                      )}
                    </div>

                    <div className="relative w-full overflow-hidden md:overflow-visible">
                      {/* Left and Right sliding fade overlays for indicating scroll boundaries on mobile */}
                      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0d0916] to-transparent pointer-events-none z-15 block md:hidden" />
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0d0916] to-transparent pointer-events-none z-15 block md:hidden" />
                      
                      <div className="flex gap-2.5 overflow-x-auto whitespace-nowrap scrollbar-none pb-2 pt-1.5 md:grid md:grid-cols-5 md:whitespace-normal md:overflow-visible">
                        {BOOSTER_MODES.map((mode) => {
                          const isSelected = mode.id === booster;

                          return (
                            <motion.button
                              key={mode.id}
                              type="button"
                              onClick={() => setBooster(mode.id)}
                              onMouseEnter={() => setHoveredModeId(mode.id)}
                              onMouseLeave={() => setHoveredModeId(null)}
                              onFocus={() => setHoveredModeId(mode.id)}
                              onBlur={() => setHoveredModeId(null)}
                              whileTap={{ scale: 0.94 }}
                              className={`relative shrink-0 md:shrink px-4 md:px-1.5 py-2.5 rounded-full border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
                                isSelected
                                  ? "bg-gradient-to-r from-rose-500 to-purple-600 border-transparent text-white -translate-y-0.5 shadow-[0_4px_15px_rgba(190,58,138,0.45)]"
                                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-rose-400/50 hover:shadow-[0_0_10px_rgba(190,58,138,0.15)]"
                              }`}
                              style={{
                                transitionDuration: "0.2s",
                                transitionTimingFunction: "cubic-bezier(.22,.68,0,1.2)",
                              }}
                            >
                              {/* Glowing background dot for active style */}
                              {isSelected && (
                                <span className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-purple-500 rounded-full blur opacity-30 animate-pulse pointer-events-none" />
                              )}
                              
                              <span className="text-sm scale-100 group-hover:scale-110 transition-transform">
                                {mode.emoji}
                              </span>
                              <span className="tracking-wide text-[10px] uppercase font-bold">
                                {mode.name}
                              </span>

                              {/* Custom Tooltip with animation */}
                              <AnimatePresence>
                                {hoveredModeId === mode.id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.9, x: "-50%" }}
                                    animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                                    exit={{ opacity: 0, y: 10, scale: 0.9, x: "-50%" }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute bottom-full mb-3.5 left-1/2 transform px-3 py-2 bg-[#120c24] border border-rose-500/30 text-gray-200 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 whitespace-normal text-center w-48 leading-relaxed font-semibold tracking-wide pointer-events-none"
                                  >
                                    {/* Tooltip arrow elements */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#120c24]" />
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-rose-500/30 -z-10 translate-y-[1px]" />
                                    
                                    <p className="text-rose-400 text-[10px] font-extrabold uppercase tracking-widest mb-1">{mode.name}</p>
                                    <p className="text-gray-300 font-medium text-[10px] leading-relaxed">{mode.description}</p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-gray-400 flex items-start gap-2 backdrop-blur-md">
                      <Info size={14} className="text-gray-500 shrink-0 mt-0.5" />
                      <p className="leading-snug">
                        {activeBoosterConfig?.id === "none" 
                          ? "Le filtre équilibré génère un éventail complet de tonalités sans accentuation asymétrique : mignon, dragueur, drôle et posé." 
                          : `Le mode booster de conversation va ajouter une proposition supplémentaire ultra caractérisée : ${activeBoosterConfig?.description}.`}
                      </p>
                    </div>
                  </div>

                  {/* Error notifications */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-start gap-2.5 overflow-hidden"
                      >
                        <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
                        <div className="space-y-1">
                          <p className="font-bold">Erreur de traitement</p>
                          <p className="text-rose-200/80 leading-relaxed">{error}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit button "Générer des réponses" */}
                  <button
                    type="submit"
                    disabled={isGenerating || (!inputText && !selectedImage)}
                    onMouseDown={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const id = Math.random().toString(36).substring(2, 9);
                      setRipples((prev) => [...prev, { id, x, y }]);
                      setTimeout(() => {
                        setRipples((prev) => prev.filter((r) => r.id !== id));
                      }, 600);
                    }}
                    className={`relative w-full rounded-2xl select-none text-base md:text-sm font-extrabold text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer overflow-hidden ${
                      isGenerating
                        ? "h-[52px] bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed"
                        : (!inputText && !selectedImage)
                        ? "h-[56px] bg-white/5 border border-white/10 text-gray-500 opacity-50 cursor-not-allowed"
                        : "h-[56px] md:h-[56px] bg-gradient-to-r from-rose-500 via-[#bc2c7a] to-purple-600 animate-pulse-glow-rose hover:scale-[1.01] active:scale-[0.98]"
                    }`}
                  >
                    {/* Ripple effects containers */}
                    {ripples.map((r) => (
                      <span
                        key={r.id}
                        className="absolute rounded-full bg-white/35 pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-ping z-10"
                        style={{
                          left: r.x,
                          top: r.y,
                          width: "120px",
                          height: "120px",
                        }}
                      />
                    ))}

                    {/* Shimmer loading overlay */}
                    {isGenerating && (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-fast pointer-events-none z-0" />
                    )}

                    <AnimatePresence mode="wait">
                      {isGenerating ? (
                        <motion.div
                          key="generating"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2 relative z-10"
                        >
                          <RefreshCw size={18} className="animate-spin text-rose-400" />
                          <span className="tracking-wide text-[#f0e8ff]">Analyse en cours<span className="inline-block animate-pulse">...</span></span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="idle"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="flex items-center gap-2 relative z-10"
                        >
                          <span className="animate-[spin_7s_linear_infinite] text-lg select-none">✨</span>
                          <span className="tracking-wider uppercase font-extrabold text-base">Générer des réponses</span>
                          <ArrowRight size={18} className="text-rose-300 group-hover:translate-x-1 transition-transform" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>

                </form>

                {/* Quick reset button */}
                {(inputText || selectedImage) && !isGenerating && (
                  <div className="flex justify-center mt-3">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="text-[10px] text-gray-500 hover:text-gray-400 hover:underline transition-colors py-1 px-3 cursor-pointer"
                    >
                      Tout réinitialiser
                    </button>
                  </div>
                )}
              </div>

              {/* Connected History Session Section */}
              <div className="rounded-[2rem] border border-white/5 bg-white/[0.01] p-5 md:p-6 shadow-md mt-auto">
                <HistorySidebar
                  history={history}
                  onSelect={handleSelectHistoryItem}
                  onClear={clearHistory}
                  activeId={currentResult?.id}
                />
              </div>
            </div>

            {/* Right column: Interactive Results Showcase or Empty State */}
            <div id="results-anchor" className="col-span-12 lg:col-span-7 flex flex-col justify-start scroll-mt-6">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="generating-panel"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-[2.5rem] border border-white/10 bg-[#0c0814]/80 p-8 backdrop-blur-xl text-center space-y-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]"
                  >
                    {/* Pulsing center rose circle with 3 orbital points rotating around */}
                    <div className="relative w-32 h-32 flex items-center justify-center select-none pointer-events-none">
                      {/* Center pulsing indicator */}
                      <div className="absolute w-12 h-12 rounded-full bg-rose-500 shadow-[0_0_30px_#be3a8a] animate-ping opacity-35" />
                      <div className="absolute w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 shadow-[0_0_20px_rgba(190,58,138,0.6)] flex items-center justify-center z-10">
                        <Heart size={18} className="text-white fill-white/20 animate-pulse" />
                      </div>

                      {/* Concentric helper orbit tracks */}
                      <div className="absolute w-16 h-16 rounded-full border border-white/5" />
                      <div className="absolute w-24 h-24 rounded-full border border-white/5" />
                      <div className="absolute w-32 h-32 rounded-full border border-white/5" />

                      {/* 3 Orbital points with custom physics rotations */}
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e] animate-orbit-1" />
                      <div className="absolute w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7] animate-orbit-2" />
                      <div className="absolute w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8] animate-orbit-3" />
                    </div>

                    <div className="space-y-3 relative z-10 max-w-sm">
                      {/* Fade-in/out text block */}
                      <h3 className="text-lg font-bold tracking-wide text-rose-300 animate-[pulse_1.5s_infinite]">
                        L'IA analyse votre message…
                      </h3>
                      
                      <div className="py-2.5 px-4 rounded-xl bg-black/40 border border-white/5 shadow-lg min-w-[260px] max-w-xs mt-1">
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={loadingStatusIndex}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="text-xs font-semibold text-gray-300"
                          >
                            {LOADING_STATUSES[loadingStatusIndex]}
                          </motion.p>
                        </AnimatePresence>
                      </div>

                      <p className="text-[11px] font-mono text-gray-500 uppercase tracking-widest pt-2">
                        ⏱️ Durée estimée : ~3 secondes
                      </p>
                    </div>
                  </motion.div>
                ) : currentResult ? (
                  <motion.div
                    key={currentResult.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ResponseCards result={currentResult} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 w-full"
                  >
                    {/* Centered italic placeholder text */}
                    <div className="text-center py-2 space-y-1 select-none">
                      <p className="text-base italic text-gray-400 font-medium">
                        Vos réponses apparaîtront ici…
                      </p>
                      <p className="text-xs text-gray-600">Saisissez un message ou déposez une capture d'écran pour lancer la magie ✨</p>
                    </div>

                    {/* 3 Ghost cards in skeleton loader style */}
                    <div className="space-y-3.5 w-full">
                      {[0, 1, 2].map((idx) => (
                        <div 
                          key={idx}
                          className="relative overflow-hidden rounded-[20px] bg-white/[0.02] border border-white/[0.05] p-5 space-y-4 min-h-[140px]"
                        >
                          {/* Animated gray shimmer overlay */}
                          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer-fast pointer-events-none" style={{ animationDelay: `${idx * 0.2}s` }} />

                          {/* Skeleton header */}
                          <div className="flex items-center justify-between">
                            <div className="w-24 h-4 bg-white/10 rounded-full" />
                            <div className="w-16 h-6 bg-white/5 rounded-lg" />
                          </div>

                          {/* Skeleton body text lines */}
                          <div className="space-y-2">
                            <div className="w-[90%] h-3 bg-white/5 rounded-md" />
                            <div className="w-[75%] h-3 bg-white/5 rounded-md" />
                          </div>

                          {/* Skeleton footer */}
                          <div className="pt-2.5 border-t border-white/[0.03] flex items-center justify-between">
                            <div className="w-1/2 h-3 bg-white/[0.03] rounded-md" />
                            <div className="w-12 h-3 bg-white/[0.03] rounded-md" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </main>
        </section>



        {/* 4. CHRONICLED TARIFS SECTION */}
        <PricingSection onSubscribeSuccess={handleUpgrade} currentTier={currentTier} />



      </div>

      {/* FOOTER BAR */}
      <footer className="text-center py-8 text-[11px] text-gray-600 font-mono space-y-1 relative z-20 w-full max-w-6xl border-t border-white/[0.03] mt-12 px-4">
        <p>© 2026 LoveReply AI • L'antidote parfait aux blancs de conversation.</p>
        <p className="flex items-center justify-center gap-1">
          <span>Créé par des experts en charme & communication</span>
          <Heart size={10} className="text-rose-600/60 fill-rose-600/30" />
        </p>
      </footer>

      {/* PAYWALL TRIGGER POPUP MODAL */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onSubscribe={handleUpgrade}
        currentTier={currentTier}
      />

    </div>
  );
}
