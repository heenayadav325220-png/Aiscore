import React from "react";

interface CoreAiLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  glow?: boolean;
  variant?: "classic" | "minimal" | "badge";
}

/**
 * CORE AI Classic Professional Logo & Emblem Component
 * Symbolizing precision, decision reflection, and intelligence.
 */
export const CoreAiLogo: React.FC<CoreAiLogoProps> = ({
  size = "md",
  showText = false,
  className = "",
  glow = true,
  variant = "classic",
}) => {
  // Size dimensions for icon SVG
  const dimensions = {
    xs: { icon: "w-4 h-4", box: "w-5.5 h-5.5", text: "text-xs", badge: "text-[9px]" },
    sm: { icon: "w-5 h-5", box: "w-7 h-7", text: "text-xs sm:text-sm", badge: "text-[10px]" },
    md: { icon: "w-6 h-6", box: "w-9 h-9", text: "text-sm sm:text-base", badge: "text-[10px]" },
    lg: { icon: "w-7 h-7 sm:w-8 sm:h-8", box: "w-11 h-11 sm:w-13 sm:h-13", text: "text-lg sm:text-xl", badge: "text-[11px]" },
    xl: { icon: "w-9 h-9 sm:w-10 sm:h-10", box: "w-14 h-14 sm:w-16 sm:h-16", text: "text-xl sm:text-2xl", badge: "text-xs" },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Emblem SVG Container */}
      <div className="relative flex items-center justify-center shrink-0">
        {/* Ambient Glow Aura */}
        {glow && (
          <div
            className={`absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/30 via-indigo-500/20 to-teal-400/30 blur-lg transition-all duration-500 ${
              size === "xl" ? "blur-2xl opacity-80" : "opacity-60"
            }`}
          />
        )}

        {/* Outer Frame with Metallic Glass Frame */}
        <div
          className={`${dimensions.box} rounded-2xl bg-slate-950/95 dark:bg-slate-950/95 border-2 border-cyan-400/60 dark:border-cyan-400/70 shadow-[0_0_20px_rgba(0,229,255,0.25)] flex items-center justify-center relative z-10 transition-transform duration-300 hover:scale-105`}
        >
          {/* Classic Precision Emblem Vector SVG */}
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${dimensions.icon} text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]`}
          >
            <defs>
              {/* Gold/Silver & Cyan Gradients for Classic Emblem */}
              <linearGradient id="coreLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00e5ff" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
              <linearGradient id="coreInnerGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#00e5ff" />
              </linearGradient>
              <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer Diamond Shield Crest */}
            <path
              d="M50 8 L88 30 L88 70 L50 92 L12 70 L12 30 Z"
              stroke="url(#coreLogoGrad)"
              strokeWidth="3.5"
              strokeLinejoin="round"
              className="opacity-90"
            />

            {/* Inner Precision Hexagon Mirror Structure */}
            <path
              d="M50 18 L78 34 L78 66 L50 82 L22 66 L22 34 Z"
              stroke="url(#coreLogoGrad)"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              className="opacity-60"
            />

            {/* Classic Core Mirror Rays (Geometric Decision Lines) */}
            <line x1="50" y1="8" x2="50" y2="38" stroke="url(#coreInnerGrad)" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="92" x2="50" y2="62" stroke="url(#coreInnerGrad)" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="30" x2="38" y2="45" stroke="url(#coreInnerGrad)" strokeWidth="2" strokeLinecap="round" />
            <line x1="88" y1="30" x2="62" y2="45" stroke="url(#coreInnerGrad)" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="70" x2="38" y2="55" stroke="url(#coreInnerGrad)" strokeWidth="2" strokeLinecap="round" />
            <line x1="88" y1="70" x2="62" y2="55" stroke="url(#coreInnerGrad)" strokeWidth="2" strokeLinecap="round" />

            {/* Center Core Emblem (Reflective Prism Diamond) */}
            <polygon
              points="50,34 66,50 50,66 34,50"
              fill="url(#coreLogoGrad)"
              stroke="#ffffff"
              strokeWidth="1.5"
              filter="url(#glowFilter)"
            />

            {/* Central Sparkle/Star Dot */}
            <circle cx="50" cy="50" r="4" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* Brand Name Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black font-display tracking-tight text-slate-950 dark:text-white ${dimensions.text}`}
            >
              CORE
            </span>
            <span
              className={`font-mono font-extrabold text-[#00e5ff] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 ${dimensions.badge} tracking-widest uppercase shadow-[0_0_10px_rgba(0,229,255,0.2)]`}
            >
              AI
            </span>
          </div>
          {size === "xl" && (
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1 font-medium tracking-wide">
              DECISION MIRROR ENGINE
            </span>
          )}
        </div>
      )}
    </div>
  );
};
