import React, { useEffect, useRef, useState } from "react";
import { BoosterMode } from "../types";

interface ParticlesBackgroundProps {
  booster?: BoosterMode;
}

interface ThemeColors {
  bgColor: string;
  glow1: string;
  glow2: string;
  glow3: string;
}

const COLORS_CONFIG: Record<BoosterMode, { dark: ThemeColors; light: ThemeColors }> = {
  none: {
    dark: {
      bgColor: "bg-[#060307]",
      glow1: "bg-purple-900/15",
      glow2: "bg-rose-500/8",
      glow3: "bg-purple-600/10",
    },
    light: {
      bgColor: "bg-[#faf8fd]",
      glow1: "bg-purple-300/25",
      glow2: "bg-rose-300/15",
      glow3: "bg-purple-400/15",
    }
  },
  ultra_drague: {
    dark: {
      bgColor: "bg-[#0e0205]",
      glow1: "bg-red-950/25",
      glow2: "bg-rose-600/15",
      glow3: "bg-amber-600/10",
    },
    light: {
      bgColor: "bg-[#fef4f6]",
      glow1: "bg-red-200/35",
      glow2: "bg-rose-200/30",
      glow3: "bg-amber-200/20",
    }
  },
  ultra_mignon: {
    dark: {
      bgColor: "bg-[#08020a]",
      glow1: "bg-pink-900/20",
      glow2: "bg-rose-500/15",
      glow3: "bg-purple-600/15",
    },
    light: {
      bgColor: "bg-[#fcf7ff]",
      glow1: "bg-pink-200/40",
      glow2: "bg-rose-200/30",
      glow3: "bg-purple-200/30",
    }
  },
  funny: {
    dark: {
      bgColor: "bg-[#02050e]",
      glow1: "bg-purple-900/20",
      glow2: "bg-amber-500/12",
      glow3: "bg-pink-600/15",
    },
    light: {
      bgColor: "bg-[#fffef2]",
      glow1: "bg-amber-200/40",
      glow2: "bg-purple-200/30",
      glow3: "bg-pink-200/25",
    }
  },
  ice_cold: {
    dark: {
      bgColor: "bg-[#020712]",
      glow1: "bg-cyan-900/25",
      glow2: "bg-indigo-900/20",
      glow3: "bg-blue-600/12",
    },
    light: {
      bgColor: "bg-[#f2fafe]",
      glow1: "bg-cyan-200/40",
      glow2: "bg-indigo-200/30",
      glow3: "bg-blue-200/25",
    }
  }
};

export default function ParticlesBackground({ booster = "none" }: ParticlesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDark, setIsDark] = useState(true);

  // Sync with theme changes automatically via MutationObserver
  useEffect(() => {
    if (typeof document === "undefined") return;
    setIsDark(document.documentElement.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
      angle: number;
      spinSpeed: number;
      type: "heart" | "confetti" | "sparkle" | "diamond" | "circle";

      constructor(isInit = false) {
        this.x = Math.random() * width;
        // Distribute vertically on init, otherwise start at edges
        this.y = isInit ? Math.random() * height : (Math.random() > 0.5 ? -10 : height + 10);
        this.angle = Math.random() * Math.PI * 2;
        this.spinSpeed = (Math.random() - 0.5) * 0.04;

        if (booster === "ultra_drague") {
          // Crimson passion hearts & fiery sparkles
          this.type = Math.random() > 0.4 ? "heart" : "sparkle";
          this.size = this.type === "heart" ? Math.random() * 8 + 6 : Math.random() * 3 + 1.5;
          this.speedX = (Math.random() - 0.5) * 0.8;
          this.speedY = -Math.random() * 1.2 - 0.4; // rising
          const colors = [
            "rgba(244, 63, 94,",  // Rose
            "rgba(225, 29, 72,",  // Red 600
            "rgba(159, 18, 57,",  // Rose 900
            "rgba(249, 115, 22,"  // Orange
          ];
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.alpha = Math.random() * 0.55 + 0.35;
        } else if (booster === "ultra_mignon") {
          // Adorable soft pink hearts and cute floating bubbles
          this.type = Math.random() > 0.35 ? "heart" : "circle";
          this.size = this.type === "heart" ? Math.random() * 10 + 7 : Math.random() * 5 + 3;
          this.speedX = (Math.random() - 0.5) * 0.4;
          this.speedY = Math.random() * 0.4 + 0.15; // falling gently
          const colors = [
            "rgba(255, 182, 193,", // Light Pink
            "rgba(255, 105, 180,", // Hot Pink
            "rgba(244, 63, 94,",   // Rose
            "rgba(232, 121, 249,"  // Fuchsia
          ];
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.alpha = Math.random() * 0.5 + 0.25;
        } else if (booster === "funny") {
          // Playful yellow, orange, and purple confetti & hearts
          this.type = Math.random() > 0.5 ? "confetti" : "heart";
          this.size = Math.random() * 7 + 4.5;
          this.speedX = (Math.random() - 0.5) * 1.4;
          this.speedY = -Math.random() * 0.9 - 0.35; // rising
          const colors = [
            "rgba(253, 224, 71,",  // Yellow
            "rgba(244, 63, 94,",   // Rose
            "rgba(249, 115, 22,",  // Orange
            "rgba(168, 85, 247,"   // Purple
          ];
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.alpha = Math.random() * 0.6 + 0.3;
        } else if (booster === "ice_cold") {
          // Falling cool diamonds & starry sparkles
          this.type = Math.random() > 0.5 ? "diamond" : "sparkle";
          this.size = Math.random() * 5 + 2.5;
          this.speedX = (Math.random() - 0.5) * 0.3;
          this.speedY = Math.random() * 0.6 + 0.15; // falling
          const colors = [
            "rgba(103, 232, 249,", // Cyan
            "rgba(147, 197, 253,", // Ice Blue
            "rgba(191, 219, 254,", // Soft Blue
            "rgba(255, 255, 255,"  // White
          ];
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.alpha = Math.random() * 0.45 + 0.25;
        } else {
          // Default Standard: Romantic violet/rose floating hearts & bubbles
          this.type = Math.random() > 0.5 ? "heart" : "circle";
          this.size = this.type === "heart" ? Math.random() * 8 + 5 : Math.random() * 4 + 1.5;
          this.speedX = (Math.random() - 0.5) * 0.3;
          this.speedY = -Math.random() * 0.45 - 0.1; // rising
          const colors = [
            "rgba(190, 58, 138,", // #be3a8a
            "rgba(96, 37, 212,",  // #6025d4
            "rgba(244, 63, 94,",  // Rose
            "rgba(147, 51, 234,"  // Purple
          ];
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.alpha = Math.random() * 0.45 + 0.2;
        }
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.angle += this.spinSpeed;

        // Apply dynamic wave sways
        if (booster === "funny") {
          this.x += Math.sin(this.y / 22) * 0.5;
        } else if (booster === "ultra_drague") {
          this.x += Math.cos(this.y / 12) * 0.25;
        } else if (booster === "ultra_mignon") {
          this.x += Math.sin(this.y / 35) * 0.3;
        } else if (booster === "ice_cold") {
          this.x += Math.sin(this.y / 50) * 0.15;
        }

        // Horizontal wrap around with safety boundaries
        if (this.x < -20) this.x = width + 20;
        if (this.x > width + 20) this.x = -20;

        // Vertical reset depending on flow direction
        if (this.speedY < 0) {
          // Rising up
          if (this.y < -20) {
            this.y = height + 20;
            this.x = Math.random() * width;
          }
        } else {
          // Falling down
          if (this.y > height + 20) {
            this.y = -20;
            this.x = Math.random() * width;
          }
        }
      }

      draw(context: CanvasRenderingContext2D) {
        const fillStyle = `${this.color}${this.alpha})`;
        context.save();

        if (this.type === "heart") {
          // Draw a perfectly proportioned symmetric heart shape
          context.beginPath();
          const x = this.x;
          const y = this.y;
          const size = this.size;
          
          context.moveTo(x, y - size * 0.3);
          // Left half of the heart
          context.bezierCurveTo(
            x - size * 0.6, y - size * 0.8,
            x - size * 1.1, y - size * 0.1,
            x, y + size * 0.7
          );
          // Right half of the heart
          context.bezierCurveTo(
            x + size * 1.1, y - size * 0.1,
            x + size * 0.6, y - size * 0.8,
            x, y - size * 0.3
          );
          
          context.fillStyle = fillStyle;
          context.shadowBlur = size * 1.5;
          context.shadowColor = fillStyle;
          context.fill();
        } else if (this.type === "confetti") {
          // Draw custom rotating rectangle confetti
          context.translate(this.x, this.y);
          context.rotate(this.angle);
          context.beginPath();
          context.rect(-this.size / 2, -this.size / 1.4, this.size, this.size * 1.3);
          context.fillStyle = fillStyle;
          context.shadowBlur = this.size * 0.6;
          context.shadowColor = fillStyle;
          context.fill();
        } else if (this.type === "diamond") {
          // Draw an elegant sharp icy star/diamond
          context.beginPath();
          const x = this.x;
          const y = this.y;
          const size = this.size;
          context.moveTo(x, y - size);
          context.lineTo(x + size * 0.5, y);
          context.lineTo(x, y + size);
          context.lineTo(x - size * 0.5, y);
          context.closePath();
          context.fillStyle = fillStyle;
          context.shadowBlur = size * 1.6;
          context.shadowColor = fillStyle;
          context.fill();
        } else if (this.type === "sparkle") {
          // Draw small fiery ember sparkles
          context.beginPath();
          context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          context.fillStyle = fillStyle;
          context.shadowBlur = this.size * 3.0;
          context.shadowColor = fillStyle;
          context.fill();
        } else {
          // Draw standard bubbles
          context.beginPath();
          context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          context.fillStyle = fillStyle;
          context.shadowBlur = this.size * 1.2;
          context.shadowColor = fillStyle;
          context.fill();
        }

        context.restore();
      }
    }

    const particles: Particle[] = [];
    // Control density dynamically
    const particleCount = Math.min(Math.floor(width / 32), 48);

    // Seed initial particles distributed randomly vertically
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(true));
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [booster]);

  const config = COLORS_CONFIG[booster][isDark ? "dark" : "light"];

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Dynamic backdrop fill color transitioning smoothly */}
      <div className={`absolute inset-0 transition-all duration-[1200ms] cubic-bezier(0.25, 0.8, 0.25, 1) ${config.bgColor}`} />

      {/* Dynamic ambient blur sphere glows transitioning smoothly */}
      <div 
        className={`absolute top-[-150px] left-[15%] w-[650px] h-[650px] blur-[150px] rounded-full opacity-60 transition-all duration-[1200ms] cubic-bezier(0.25, 0.8, 0.25, 1) ${config.glow1}`} 
      />
      <div 
        className={`absolute top-[25%] right-[-120px] w-[500px] h-[500px] blur-[130px] rounded-full opacity-50 transition-all duration-[1200ms] cubic-bezier(0.25, 0.8, 0.25, 1) ${config.glow2}`} 
      />
      <div 
        className={`absolute bottom-[-100px] left-[-200px] w-[550px] h-[550px] blur-[140px] rounded-full opacity-50 transition-all duration-[1200ms] cubic-bezier(0.25, 0.8, 0.25, 1) ${config.glow3}`} 
      />

      {/* High-perf interactive particle canvas layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-70"
        style={{ mixBlendMode: "screen" }}
      />
    </div>
  );
}
