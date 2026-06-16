import React, { useState, useEffect } from "react";
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
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { BOOSTER_MODES } from "./constants";
import { BoosterMode, GenerationResult } from "./types";
import UploadZone from "./components/UploadZone";
import ManualInput from "./components/ManualInput";
import ResponseCards from "./components/ResponseCards";
import HistorySidebar from "./components/HistorySidebar";

// Cycling statuses to make the loading sequence feel playful and incredibly premium
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [booster, setBooster] = useState<BoosterMode>("none");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStatusIndex, setLoadingStatusIndex] = useState(0);
  const [currentResult, setCurrentResult] = useState<GenerationResult | null>(null);
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load history from localStorage on initialization
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("lovereply_history");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Impossible de récupérer l'historique depuis localStorage", e);
    }
  }, []);

  // Sync history changes with localStorage
  const saveHistoryToLocalStorage = (newHistory: GenerationResult[]) => {
    try {
      localStorage.setItem("lovereply_history", JSON.stringify(newHistory));
    } catch (e) {
      console.error("Échec d'écriture de l'historique dans localStorage", e);
    }
  };

  // Cycling text intervals during request loadings
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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText && !selectedImage) {
      setError("Veuillez sélectionner une capture d'écran OU saisir un message texte pour lancer l'analyse.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCurrentResult(null);

    try {
      const response = await fetch("/api/love-reply/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          image: selectedImage,
          booster: booster,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur inconnue est survenue avec l'API Génération.");
      }

      // Format clean output with identifier
      const newResult: GenerationResult = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        inputMessage: inputText || (selectedImage ? "Capture d'écran de conversation" : "Message inconnu"),
        hasImage: !!selectedImage,
        detectedSender: data.detectedSender,
        detectedTone: data.detectedTone,
        contextAnalysis: data.contextAnalysis,
        replies: data.replies,
        boosterUsed: booster,
      };

      setCurrentResult(newResult);

      // Save to history list
      const updatedHistory = [newResult, ...history].slice(0, 30); // limit history count to 30 items
      setHistory(updatedHistory);
      saveHistoryToLocalStorage(updatedHistory);

    } catch (err: any) {
      console.error("Erreur générale de connexion API:", err);
      setError(
        err.message || 
        "Connexion interrompue. Assure-toi que la clé API Gemini est configurée et réessaie."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectHistoryItem = (item: GenerationResult) => {
    setCurrentResult(item);
    // Auto-restore booster selection
    setBooster(item.boosterUsed as BoosterMode);
    // Scroll smoothly to results
    const elem = document.getElementById("results-anchor");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const clearHistory = () => {
    if (confirm("Voulez-vous vraiment effacer tout votre historique ?")) {
      setHistory([]);
      localStorage.removeItem("lovereply_history");
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

  const activeBoosterConfig = BOOSTER_MODES.find(m => m.id === booster);

  return (
    <div className="min-h-screen bg-[#0A050A] text-white flex flex-col items-center py-6 px-4 md:py-10 antialiased relative overflow-x-hidden selection:bg-rose-500/30 selection:text-rose-200">
      
      {/* Visual background atmospheric elements */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-rose-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Main core layout centered deck - type application mobile/comprimée */}
      <div className="w-full max-w-lg flex flex-col gap-6 relative z-10">
        
        {/* Header Section */}
        <header className="flex flex-col items-center text-center space-y-1.5 py-2">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-14 h-14 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/20 cursor-pointer"
            onClick={handleResetForm}
          >
            <Heart size={28} className="text-white fill-white/20 animate-pulse" />
          </motion.div>

          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-violet-400">
            LoveReply AI
          </h1>
          <p className="text-xs text-gray-400 max-w-sm font-medium">
            L'arme secrète pour trouver la répartie parfaite, flirter avec humour ou répondre avec tendresse.
          </p>
        </header>

        {/* Form panel container */}
        <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-5 md:p-6 shadow-[0_15px_35px_rgba(0,0,0,0.4)] relative">
          
          <form onSubmit={handleGenerate} className="space-y-6">
            
            {/* Step 1: Inputs */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1.5 border-b border-white/10">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="text-sm font-semibold text-rose-300/90">Analyse de la conversation</span>
              </div>

              {/* Upload screenshot section */}
              <UploadZone 
                onImageSelected={setSelectedImage} 
                selectedImage={selectedImage} 
              />

              {/* Divider spacer */}
              <div className="flex items-center text-white/10 text-xs py-1">
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

            {/* Step 2: Booster selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Choisir le Tone / Booster</p>
                {booster !== "none" && (
                  <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5 animate-pulse">
                    <Flame size={12} /> Booster actif
                  </span>
                )}
              </div>

              <div id="booster-mode-grid" className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-1">
                {BOOSTER_MODES.map((mode) => {
                  const isSelected = mode.id === booster;

                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setBooster(mode.id)}
                      className={`relative overflow-hidden text-center py-2 px-1.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all group ${
                        isSelected
                          ? `border-rose-500 bg-rose-500/10 text-rose-300 shadow-lg shadow-rose-500/10`
                          : `border-white/10 bg-white/5 text-gray-400 hover:bg-white/10`
                      }`}
                    >
                      {/* Active indicator circle */}
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-400" />
                      )}
                      
                      <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                        {mode.emoji}
                      </span>
                      <span className="font-bold tracking-wide text-[10px] whitespace-nowrap">
                        {mode.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-[11px] text-gray-400 flex items-start gap-2">
                <Info size={14} className="text-gray-500 shrink-0 mt-0.5" />
                <p>
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

            {/* Submit button */}
            <button
              type="submit"
              disabled={isGenerating || (!inputText && !selectedImage)}
              className="relative w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-violet-600 hover:opacity-90 disabled:from-white/0 disabled:to-white/0 disabled:bg-white/5 disabled:border-white/10 disabled:text-gray-600 text-lg font-bold text-white transition-all duration-300 shadow-xl shadow-rose-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw size={16} className="animate-spin text-white" />
                    <span>Calcul secret en cours...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span>Générer des Réponses</span>
                    <ArrowRight size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

          </form>

          {/* Form Quick reset button when filled */}
          {(inputText || selectedImage) && !isGenerating && (
            <div className="flex justify-center mt-3">
              <button
                type="button"
                onClick={handleResetForm}
                className="text-[10px] text-gray-500 hover:text-gray-400 transition-colors py-1 px-3"
              >
                Tout réinitialiser
              </button>
            </div>
          )}

        </div>

        {/* Loading details screen */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl text-center space-y-4 shadow-[0_0_50px_rgba(244,63,94,0.1)] relative overflow-hidden"
            >
              {/* Vibrant grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(244,63,94,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(244,63,94,0.02)_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

              <div className="flex flex-col items-center justify-center space-y-3 relative z-10">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-rose-500/20 border-t-rose-500 animate-spin" />
                  <Heart size={22} className="text-rose-500 fill-rose-500/20 animate-pulse" />
                </div>
                
                <h3 className="text-sm font-bold tracking-widest uppercase text-rose-300">
                  L'IA s'active...
                </h3>

                {/* Animated status loop */}
                <motion.p
                  key={loadingStatusIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-xs font-medium text-gray-300 italic min-h-[30px]"
                >
                  {LOADING_STATUSES[loadingStatusIndex]}
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Output section container */}
        <div id="results-anchor" className="scroll-mt-6">
          <AnimatePresence mode="wait">
            {currentResult && !isGenerating && (
              <motion.div
                key={currentResult.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ResponseCards result={currentResult} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* History logger section */}
        <section className="pt-2">
          <HistorySidebar
            history={history}
            onSelect={handleSelectHistoryItem}
            onClear={clearHistory}
            activeId={currentResult?.id}
          />
        </section>

        {/* Footers */}
        <footer className="text-center py-6 text-[11px] text-gray-600 font-mono space-y-1">
          <p>© 2026 LoveReply AI • Tous droits réservés.</p>
          <p className="flex items-center justify-center gap-1">
            <span>Fait avec amour & intelligence artificielle</span>
            <Heart size={10} className="text-rose-600/60 fill-rose-600/30" />
          </p>
        </footer>

      </div>
    </div>
  );
}
