import React from "react";
import { History, Calendar, Heart, Zap, ChevronRight, Trash2, FileText, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";
import { GenerationResult } from "../types";

interface HistorySidebarProps {
  history: GenerationResult[];
  onSelect: (item: GenerationResult) => void;
  onClear: () => void;
  activeId?: string;
}

export default function HistorySidebar({ history, onSelect, onClear, activeId }: HistorySidebarProps) {
  if (history.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-black/20 p-5 text-center">
        <History size={24} className="text-gray-600 mx-auto mb-2.5 opacity-55" />
        <p className="text-xs font-semibold text-gray-400">Aucun historique pour le moment.</p>
        <p className="text-[10px] text-gray-500 mt-1">Vos réponses générées apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div id="love-reply-history-panel" className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
          <History size={13} className="text-rose-400" />
          Mon Historique ({history.length})
        </label>
        <button
          type="button"
          onClick={onClear}
          className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 py-1 px-2.5 rounded-lg bg-rose-500/10 border border-rose-500/10 cursor-pointer"
        >
          <Trash2 size={10} />
          Tout effacer
        </button>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-none">
        {history.map((item) => {
          const isActive = item.id === activeId;
          const displayDate = new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(item)}
              className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                isActive
                  ? "border-rose-500 bg-rose-500/10"
                  : "border-white/10 bg-black/20 hover:bg-white/5 hover:border-white/15"
              }`}
            >
              <div className="space-y-1 overflow-hidden flex-1">
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500">
                  <Calendar size={10} />
                  <span>{displayDate}</span>
                  <span>•</span>
                  {item.hasImage ? (
                    <span className="flex items-center gap-0.5 text-rose-400 font-mono">
                      <ImageIcon size={9} /> Capture
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-cyan-400 font-mono">
                      <FileText size={9} /> Saisie
                    </span>
                  )}
                </div>

                <p className="text-xs font-medium text-gray-200 truncate pr-1">
                  {item.inputMessage || "Analyse de capture d'écran"}
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-rose-300 font-semibold flex items-center gap-0.5 bg-rose-500/10 py-0.5 px-1.5 rounded-md border border-rose-500/10">
                    <Heart size={8} /> {item.detectedTone || "Romantique"}
                  </span>
                  {item.boosterUsed && item.boosterUsed !== "none" && (
                    <span className="text-[9px] text-purple-300 font-semibold flex items-center gap-0.5 bg-purple-500/10 py-0.5 px-1.5 rounded-md border border-purple-500/10 uppercase">
                      <Zap size={8} /> {item.boosterUsed.replace("_", " ")}
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight size={14} className={isActive ? "text-rose-400" : "text-gray-500"} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
