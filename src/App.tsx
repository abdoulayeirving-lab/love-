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
    <div className="min-h-screen bg-[#060307] text-white flex flex-col items-center py-4 px-3 sm:px-6 md:py-8 antialiased relative overflow-x-hidden selection:bg-rose-500/40 selection:text-rose-100 font-sans">
      
      {/* Immersive radial glows */}
      <div className="absolute top-[-150px] left-1/4 w-[600px] h-[600px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[-100px] w-[400px] h-[400px] bg-rose-500/5 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-200px] w-[500px] h-[500px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Modern sticky glass header navigation */}
      <header className="w-full max-w-6xl mx-auto border border-white/5 backdrop-blur-md bg-white/[0.02] py-4 px-6 rounded-3xl flex items-center justify-between mb-8 z-20">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/20 cursor-pointer active:scale-95 transition-transform"
            onClick={handleResetForm}
          >
            <Heart size={20} className="text-white fill-white/20 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-rose-300 to-violet-400">
              LoveReply AI
            </h1>
            <p className="text-[10px] text-gray-500 tracking-wider uppercase font-semibold">Analyseur de flirt intelligent</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/[0.08] rounded-full text-[11px] text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Moteurs IA Actifs
          </span>
          <button 
            type="button" 
            onClick={handleResetForm}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            Nouveau scan
          </button>
        </div>
      </header>

      {/* Responsive Dashboard Grid */}
      <main className="w-full max-w-6xl flex flex-col lg:grid lg:grid-cols-12 gap-8 relative z-10 px-1 sm:px-2 flex-1">
        
        {/* Left column: Input Form & History */}
        <div className="col-span-12 lg:col-span-5 space-y-6 flex flex-col">
          
          {/* Main Input Form Container */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 md:p-6 shadow-[0_15px_35px_rgba(0,0,0,0.5)] relative">
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

                <div id="booster-mode-grid" className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {BOOSTER_MODES.map((mode) => {
                    const isSelected = mode.id === booster;

                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setBooster(mode.id)}
                        className={`relative overflow-hidden text-center py-2 px-1 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer ${
                          isSelected
                            ? `border-rose-500 bg-rose-500/10 text-rose-300 shadow-lg shadow-rose-500/10`
                            : `border-white/10 bg-white/5 text-gray-400 hover:bg-white/10`
                        }`}
                      >
                        {/* Active indicator dot */}
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

                <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-[11px] text-gray-400 flex items-start gap-2">
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

              {/* Submit button */}
              <button
                type="submit"
                disabled={isGenerating || (!inputText && !selectedImage)}
                className="relative w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-violet-600 hover:opacity-90 disabled:from-white/0 disabled:to-white/0 disabled:bg-white/5 disabled:border-white/15 disabled:text-gray-600 text-base font-bold text-white transition-all duration-300 shadow-xl shadow-rose-500/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
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
                      <RefreshCw size={16} className="animate-spin text-white-400" />
                      <span>Extraction du charme en cours...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <span>Obtenir mes Réponses IA</span>
                      <ArrowRight size={16} className="text-rose-300 group-hover:translate-x-1 transition-transform" />
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

        {/* Right column: Interactive Results Showcase or Gorgeous Empty State */}
        <div id="results-anchor" className="col-span-12 lg:col-span-7 flex flex-col justify-start scroll-mt-6">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="generating-panel"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl text-center space-y-6 shadow-[0_0_50px_rgba(244,63,94,0.12)] relative overflow-hidden flex flex-col items-center justify-center min-h-[480px]"
              >
                {/* Visual patterns */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(244,63,94,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(244,63,94,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-rose-500/10 to-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="flex flex-col items-center justify-center space-y-4 relative z-10 max-w-sm">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-rose-500/20 border-t-rose-500 animate-spin" />
                    <Heart size={26} className="text-rose-500 fill-rose-500/25 animate-pulse" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold tracking-widest uppercase text-rose-300">
                      Ambiandeur Actif
                    </h3>
                    <p className="text-xs text-gray-400">Génération de répliques magnétiques de haut niveau</p>
                  </div>

                  {/* High Quality cycling details box */}
                  <div className="py-3 px-6 rounded-2xl bg-black/40 border border-white/5 shadow-lg min-w-[280px] max-w-sm mt-2">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={loadingStatusIndex}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="text-xs font-semibold text-gray-200"
                      >
                        {LOADING_STATUSES[loadingStatusIndex]}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                  
                  {/* Subtle bar indicator */}
                  <div className="w-40 h-1 bg-white/5 rounded-full overflow-hidden mt-3">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-rose-500 to-purple-600 rounded-full"
                      animate={{ 
                        width: ["0%", "100%"]
                      }}
                      transition={{ 
                        duration: 12,
                        ease: "easeOut",
                        repeat: Infinity 
                      }}
                    />
                  </div>
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
                className="rounded-[2.5rem] border border-white/5 bg-white/[0.015] p-8 backdrop-blur-xl text-center space-y-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />
                
                {/* Simulated interactive icons floating */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500/10 to-purple-600/10 border border-white/10 flex items-center justify-center text-rose-400 mb-2 shadow-lg shadow-rose-500/5">
                  <Sparkles size={28} className="animate-pulse" />
                </div>
                
                <div className="space-y-2 max-w-md">
                  <h3 className="text-xl font-bold text-white tracking-tight">Prêt à transformer vos conversations ?</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Ajoutez une capture d'écran de vos messages (WhatsApp, iMessage, Instagram, Tinder...) ou saisissez le texte sur la gauche pour obtenir instantanément des répliques charismatiques et sur-mesure.
                  </p>
                </div>
                
                {/* Explanation items block */}
                <div className="grid grid-cols-1 gap-3.5 w-full max-w-sm pt-4">
                  <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.05] text-left transition-colors">
                    <span className="text-rose-400 font-bold bg-rose-500/10 w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs">01</span>
                    <div>
                      <p className="font-semibold text-xs text-gray-200">Diagnostics de Situation</p>
                      <p className="text-gray-500 text-[10px]">Analyse fine de l'humeur, du déséquilibre de pouvoir et du niveau d'intérêt.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.05] text-left transition-colors">
                    <span className="text-purple-400 font-bold bg-purple-500/10 w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs">02</span>
                    <div>
                      <p className="font-semibold text-xs text-gray-200">Alternatives par Tempérament</p>
                      <p className="text-gray-500 text-[10px]">De la répartie piquante intelligente au mot doux sincère et chaleureux.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.05] text-left transition-colors">
                    <span className="text-indigo-400 font-bold bg-indigo-500/10 w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs">03</span>
                    <div>
                      <p className="font-semibold text-xs text-gray-200">Booster de Personnalité</p>
                      <p className="text-gray-500 text-[10px]">Activez un filtre pour orienter l'attitude (Démon, Romantique, Brutalement Drôle...).</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* Footer bar */}
      <footer className="text-center py-8 text-[11px] text-gray-600 font-mono space-y-1 relative z-20 w-full max-w-6xl border-t border-white/[0.03] mt-12">
        <p>© 2026 LoveReply AI • L'antidote parfait aux blancs de conversation.</p>
        <p className="flex items-center justify-center gap-1">
          <span>Fait de façon artisanale & intelligente</span>
          <Heart size={10} className="text-rose-600/60 fill-rose-600/30" />
        </p>
      </footer>

    </div>
  );
}
