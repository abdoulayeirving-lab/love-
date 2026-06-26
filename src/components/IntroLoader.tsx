import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface IntroLoaderProps {
  onComplete: () => void;
}

export default function IntroLoader({ onComplete }: IntroLoaderProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      // Wait for exit animation to finish
      setTimeout(() => {
        onComplete();
      }, 300);
    }, 600);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-[#060307] flex flex-col items-center justify-center text-white"
        >
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Animated blur rings */}
          <div className="absolute w-[400px] h-[400px] rounded-full bg-rose-500/10 blur-[100px] animate-pulse" />
          <div className="absolute w-[300px] h-[300px] rounded-full bg-purple-600/10 blur-[90px] animate-pulse delay-75" />

          <div className="flex flex-col items-center space-y-6 relative z-10">
            {/* Spinning & pulsing heart logo wrapper */}
            <motion.div
              initial={{ scale: 0.4, rotate: -45, opacity: 0 }}
              animate={{ scale: [1, 1.15, 1], rotate: 0, opacity: 1 }}
              transition={{
                duration: 1.2,
                ease: "easeOut",
              }}
              className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-rose-500 to-purple-600 p-[1.5px] shadow-[0_15px_40px_rgba(190,58,138,0.35)]"
            >
              <div className="w-full h-full rounded-[22px] bg-[#0a0812] flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <Heart size={36} className="text-rose-500 fill-rose-500/20" />
                </motion.div>
              </div>
              
              {/* Outer rotating orbit glow */}
              <div className="absolute inset-[-4px] rounded-3xl border border-rose-500/40 animate-[spin_4s_linear_infinite] pointer-events-none" />
            </motion.div>

            {/* Application Branding */}
            <div className="text-center space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-rose-400 via-rose-300 to-purple-400 bg-clip-text text-transparent font-sans uppercase"
              >
                LoveReply AI
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.5 }}
                className="text-[10px] sm:text-xs font-mono text-purple-300 tracking-widest uppercase font-semibold"
              >
                Analyseur de flirt & décryptage émotionnel
              </motion.p>
            </div>

            {/* Elegant loading indicator */}
            <div className="w-40 h-1 bg-white/5 rounded-full overflow-hidden relative mt-2">
              <motion.div
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                className="absolute w-1/2 h-full bg-gradient-to-r from-rose-500 to-purple-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
