import React from "react";
import { MessageSquare, Sparkles, Trash2 } from "lucide-react";
import { EXAMPLE_PHRASES } from "../constants";

interface ManualInputProps {
  text: string;
  onChange: (val: string) => void;
}

export default function ManualInput({ text, onChange }: ManualInputProps) {
  const selectPhrase = (phrase: string) => {
    onChange(phrase);
  };

  return (
    <div id="manual-text-input-container" className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold tracking-wide text-rose-300 flex items-center gap-1.5">
          <MessageSquare size={16} className="text-rose-400" />
          Ou saisis/colle le message reçu
        </label>
        {text && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1 py-1 px-2.5 rounded-full bg-white/5 border border-white/10"
          >
            <Trash2 size={12} />
            Effacer
          </button>
        )}
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ex: 'Salut ! J'ai passé un super moment hier soir, on se revoit quand ?'..."
          rows={3}
          maxLength={1000}
          className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all resize-none"
        />
        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-gray-500">
          {text.length}/1000
        </div>
      </div>

      {/* Suggestion phrases */}
      <div id="quick-presets" className="space-y-1.5">
        <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
          <Sparkles size={11} className="text-rose-400/50" />
          <span>Phrases de test :</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_PHRASES.map((phrase, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectPhrase(phrase)}
              className="py-1 px-2.5 text-[11px] font-medium text-gray-400 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-left truncate max-w-full"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
