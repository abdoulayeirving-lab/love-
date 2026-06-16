import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, X, Image as ImageIcon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UploadZoneProps {
  onImageSelected: (base64: string | null) => void;
  selectedImage: string | null;
}

export default function UploadZone({ onImageSelected, selectedImage }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Veuillez importer exclusivement un fichier image (PNG, JPG, JPEG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onImageSelected(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Preset conversations in simulated images in case users just want to try it out
  const loadPresetScreenshot = (presetType: "romantic" | "tense" | "flirty") => {
    // We'll create small canvas-based drawings of mock messaging chats to act as base64 images so they don't have to capture their real screen to test it! This is a legendary UX bonus!
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background gradient similar to modern messengers
    const grad = ctx.createLinearGradient(0, 0, 400, 300);
    grad.addColorStop(0, "#1e1b4b"); // deeply dark indigo
    grad.addColorStop(1, "#311042"); // dark plum
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 300);

    // Draw chat header
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(0, 0, 400, 45);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px system-ui";
    
    let contactName = "Camille ✨";
    let msg1 = "Salut ! Tu fais quoi de beau ?";
    let msg2 = "Dis, on se capte quand finalement ? Ça fait un bail.";

    if (presetType === "tense") {
      contactName = "Alex 🤨";
      msg1 = "Pourquoi tu réponds pas ?";
      msg2 = "Tu m'avais dit qu'on se voyait, j'ai attendu 1h...";
    } else if (presetType === "romantic") {
      contactName = "Mon Cœur ❤️";
      msg1 = "J'ai passé une tellement bonne soirée hier.";
      msg2 = "Tu me manques déjà un peu pour être honnête...";
    }

    ctx.fillText(contactName, 20, 26);
    ctx.fillStyle = "#86efac"; // green dot for active
    ctx.beginPath();
    ctx.arc(380, 23, 4, 0, Math.PI * 2);
    ctx.fill();

    // Message 1 (received - grey glass bubble)
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.beginPath();
    ctx.roundRect(15, 65, 280, 50, 12);
    ctx.fill();
    ctx.fillStyle = "#f3f4f6";
    ctx.font = "13px system-ui";
    ctx.fillText(msg1, 25, 95);
    
    // Message 2 (received - grey glass bubble)
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.beginPath();
    ctx.roundRect(15, 130, 340, 50, 12);
    ctx.fill();
    ctx.fillStyle = "#f3f4f6";
    ctx.fillText(msg2, 25, 160);

    // Send visual indicator
    ctx.fillStyle = "rgba(236, 72, 153, 0.3)";
    ctx.fillRect(0, 255, 400, 45);
    ctx.fillStyle = "#ec4899";
    ctx.font = "bold 11px system-ui";
    ctx.fillText("CAPTURE D'ÉCRAN DÉMO - LoveReply AI", 20, 280);

    const base64Img = canvas.toDataURL("image/png");
    onImageSelected(base64Img);
  };

  return (
    <div id="screenshot-upload-container" className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold tracking-wide text-rose-300 flex items-center gap-1.5">
          <ImageIcon size={16} className="text-rose-400" />
          Capture d'écran (WhatsApp, Insta, iMessage...)
        </label>
        {selectedImage && (
          <button
            type="button"
            onClick={removeImage}
            className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 py-1 px-2.5 rounded-full bg-rose-500/10 border border-rose-500/20"
          >
            <X size={12} />
            Effacer la capture
          </button>
        )}
      </div>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed h-40 transition-all flex flex-col items-center justify-center p-4 text-center ${
          selectedImage
            ? "border-rose-500/50 bg-black/60"
            : isDragActive
            ? "border-rose-400 bg-rose-500/10 scale-[0.99] shadow-inner shadow-rose-500/15"
            : "border-white/10 bg-black/20 hover:border-rose-500/50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/*"
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {selectedImage ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 w-full h-full flex items-center justify-center p-2 bg-black/90"
            >
              <img
                src={selectedImage}
                alt="Capture d'écran téléversée"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <div className="absolute bottom-2 right-2 px-2.5 py-1 text-[10px] uppercase tracking-widest font-mono text-rose-400 bg-black/90 border border-rose-500/30 rounded-md backdrop-blur-md">
                Prêt à analyser
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center pointer-events-none"
            >
              <span className="text-3xl mb-2">📸</span>
              <p className="text-sm text-gray-400">
                Dépose ta capture ici, ou <span className="text-rose-400 font-semibold underline decoration-rose-400/40">parcours ton fichier</span>
              </p>
              <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest">
                WhatsApp, Instagram, iMessage
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!selectedImage && (
        <div id="presets-demo-container" className="pt-1.5">
          <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-500">
            <Sparkles size={12} className="text-rose-400/70" />
            <span>Pas de capture sous la main ? Teste un exemple :</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => loadPresetScreenshot("flirty")}
              className="py-1.5 px-2 text-xs font-medium text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 rounded-xl transition-all"
            >
              ✨ Chill / Flirt
            </button>
            <button
              type="button"
              onClick={() => loadPresetScreenshot("romantic")}
              className="py-1.5 px-2 text-xs font-medium text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 rounded-xl transition-all"
            >
              ❤️ Romantique
            </button>
            <button
              type="button"
              onClick={() => loadPresetScreenshot("tense")}
              className="py-1.5 px-2 text-xs font-medium text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 rounded-xl transition-all"
            >
              🤨 Tendu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
