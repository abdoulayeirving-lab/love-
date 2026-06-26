import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Sparkles, Trash2 } from "lucide-react";
import { EXAMPLE_PHRASES } from "../constants";

interface ManualInputProps {
  text: string;
  onChange: (val: string) => void;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  angleX: string;
  angleY: string;
}

export default function ManualInput({ text, onChange }: ManualInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Typewriter effect phrases for placeholder
  const phrases = [
    "Salut ! J'ai passé un super moment hier soir, on se revoit quand ? ☕",
    "Dis, tu fais quoi ce soir ? J'ai repéré un endroit secret... 🗺️",
    "Coucou ! J'ai adoré ton dernier message, tu as toujours de la répartie !",
    "Tu penses à moi parfois ? Ou c'est juste mon imagination ? 💫"
  ];

  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentFullText = phrases[phraseIdx];

    if (!isDeleting) {
      if (charIdx < currentFullText.length) {
        timer = setTimeout(() => {
          setPlaceholder((prev) => prev + currentFullText[charIdx]);
          setCharIdx((prev) => prev + 1);
        }, 65); // Speed of typing
      } else {
        // Pause at the end before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 3000);
      }
    } else {
      if (charIdx > 0) {
        timer = setTimeout(() => {
          setPlaceholder((prev) => prev.slice(0, -1));
          setCharIdx((prev) => prev - 1);
        }, 35); // Speed of deleting
      } else {
        setIsDeleting(false);
        setPhraseIdx((prev) => (prev + 1) % phrases.length);
      }
    }

    return () => clearTimeout(timer);
  }, [charIdx, isDeleting, phraseIdx]);

  // Handle particle burst on keypress
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Avoid spawning on shift/ctrl/alt key presses only
    if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") {
      return;
    }

    // Determine random colors
    const colors = ["#be3a8a", "#6025d4", "#ec4899", "#8b5cf6", "#f43f5e"];
    
    // Spawn 3-4 particles at approximate caret/focused area
    const newParticles: Particle[] = Array.from({ length: 4 }).map(() => {
      // Pick a random angle and distance for key particle translation
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 50;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      // Random starting point within the text input (near cursor or centered)
      const rx = 30 + Math.random() * 80;
      const ry = 40 + Math.random() * 60;

      return {
        id: Math.random().toString(36).substring(2, 9),
        x: rx,
        y: ry,
        color: colors[Math.floor(Math.random() * colors.length)],
        angleX: `${tx}px`,
        angleY: `${ty}px`,
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);

    // Clean up particles after animation completes (600ms)
    setTimeout(() => {
      setParticles((prev) => prev.slice(newParticles.length));
    }, 600);
  };

  const selectPhrase = (phrase: string) => {
    onChange(phrase);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text/plain") || "";
    // Clean and keep only plain text
    const cleanText = pastedText.replace(/\r/g, "");
    
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const newVal = currentVal.substring(0, start) + cleanText + currentVal.substring(end);
    onChange(newVal.slice(0, 2000));
  };

  return (
    <div id="manual-text-input-container" className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="conversation-textarea" className="text-sm font-semibold tracking-wide text-rose-300 flex items-center gap-1.5 cursor-pointer">
          <MessageSquare size={16} className="text-rose-400" aria-hidden="true" />
          Ou saisis/colle le message reçu
        </label>
        {text && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Effacer le message texte saisi"
            className="text-xs text-text-muted hover:text-text-main transition-colors flex items-center gap-1 py-1 px-2.5 rounded-full bg-bg-btn-sec border border-border-main"
          >
            <Trash2 size={12} aria-hidden="true" />
            Effacer
          </button>
        )}
      </div>

      {/* GRADIENT TEXTAREA CONTAINER WRAPPER */}
      <div 
        ref={containerRef}
        className="relative transition-all duration-300 rounded-[20px] p-[1.5px] overflow-hidden"
        style={{
          background: "conic-gradient(from var(--angle), #be3a8a, #6025d4, #be3a8a)",
          animation: isFocused 
            ? "rotate-gradient 1.2s infinite linear" 
            : "rotate-gradient 4.5s infinite linear",
          transform: isFocused ? "scale(1.015)" : "scale(1)",
          boxShadow: isFocused ? "0 0 25px rgba(190, 58, 138, 0.25)" : "none",
        }}
      >
        <div className="relative rounded-[19px] bg-bg-app/90 backdrop-blur-[20px] overflow-hidden">
          {/* Keypress Particles Overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {particles.map((p) => (
              <span
                key={p.id}
                className="absolute w-2 h-2 rounded-full animate-key-particle pointer-events-none"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  backgroundColor: p.color,
                  boxShadow: `0 0 6px ${p.color}`,
                  // Pass custom variables to keyframe
                  ["--x" as any]: p.angleX,
                  ["--y" as any]: p.angleY,
                }}
              />
            ))}
          </div>

          {/* Decorative Sparkle Icon ✦ inside textarea */}
          <span 
            className="absolute top-3.5 right-3.5 text-rose-400 text-lg font-bold select-none pointer-events-none animate-pulse z-10"
            style={{ textShadow: "0 0 8px rgba(190, 58, 138, 0.6)" }}
            aria-hidden="true"
          >
            ✦
          </span>

          <textarea
            ref={textareaRef}
            id="conversation-textarea"
            value={text}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder ? `Ex: "${placeholder}"` : "Saisis un message..."}
            maxLength={2000}
            aria-label="Saisir ou coller le message à analyser"
            className="w-full rounded-[19px] bg-transparent px-4 py-3.5 text-base md:text-sm text-text-main placeholder-gray-500 focus:outline-none transition-all resize-y min-h-[130px] md:min-h-[130px] custom-scrollbar focus:shadow-[inset_0_0_12px_rgba(190,58,138,0.25)]"
            style={{
              fontFamily: '"Outfit", "DM Sans", sans-serif',
              caretColor: "#be3a8a", // Blinking pink caret
            }}
          />

          <div className="absolute bottom-3 right-3 text-[10px] font-mono text-gray-500 pointer-events-none z-10 bg-bg-app/80 px-1.5 py-0.5 rounded-md">
            {text.length}/2000
          </div>
        </div>
      </div>

      {/* Suggestion phrases */}
      <div id="quick-presets" className="space-y-1.5">
        <div className="flex items-center gap-1 text-[11px] font-medium text-text-muted">
          <Sparkles size={11} className="text-rose-400/50" />
          <span>Phrases de test rapides :</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_PHRASES.map((phrase, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectPhrase(phrase)}
              className="py-1 px-2.5 text-[11px] font-medium text-text-muted bg-bg-btn-sec hover:bg-bg-btn-sec/80 border border-border-main rounded-full transition-all text-left truncate max-w-full"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
