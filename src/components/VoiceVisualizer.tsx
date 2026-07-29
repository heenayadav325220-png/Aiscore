import React from "react";
import { motion } from "motion/react";
import { Volume2, VolumeX, Mic, Square, Sparkles } from "lucide-react";

interface VoiceVisualizerProps {
  /** Number of audio bars to render (default 16) */
  barCount?: number;
  /** Height class or numerical pixel size */
  size?: "xs" | "sm" | "md" | "lg";
  /** Color theme accent (default cyan) */
  accentColor?: string;
  /** Active state mode */
  state?: "speaking" | "listening" | "loading" | "idle";
  /** Optional custom class names */
  className?: string;
}

/** Pre-calculated organic height profiles & keyframes for dynamic spectral equalizer effect */
const BAR_PROFILES = [
  { minRatio: 0.15, maxRatio: 0.85, keyframes: [0.15, 0.75, 0.40, 0.95, 0.25, 0.85, 0.15], delay: 0.00, duration: 0.85 },
  { minRatio: 0.30, maxRatio: 1.00, keyframes: [0.30, 0.90, 0.20, 1.00, 0.45, 0.70, 0.30], delay: 0.12, duration: 1.05 },
  { minRatio: 0.20, maxRatio: 0.65, keyframes: [0.20, 0.55, 0.80, 0.30, 0.65, 0.20, 0.20], delay: 0.24, duration: 0.75 },
  { minRatio: 0.40, maxRatio: 0.95, keyframes: [0.40, 0.85, 0.35, 0.95, 0.50, 0.80, 0.40], delay: 0.08, duration: 0.95 },
  { minRatio: 0.10, maxRatio: 0.75, keyframes: [0.10, 0.60, 0.90, 0.25, 0.75, 0.35, 0.10], delay: 0.18, duration: 1.10 },
  { minRatio: 0.25, maxRatio: 0.90, keyframes: [0.25, 0.90, 0.30, 0.80, 0.45, 0.90, 0.25], delay: 0.04, duration: 0.80 },
  { minRatio: 0.35, maxRatio: 1.00, keyframes: [0.35, 0.70, 1.00, 0.40, 0.85, 0.50, 0.35], delay: 0.28, duration: 1.00 },
  { minRatio: 0.15, maxRatio: 0.80, keyframes: [0.15, 0.80, 0.25, 0.70, 0.35, 0.80, 0.15], delay: 0.14, duration: 0.90 },
  { minRatio: 0.20, maxRatio: 0.95, keyframes: [0.20, 0.65, 0.95, 0.30, 0.85, 0.40, 0.20], delay: 0.22, duration: 1.15 },
  { minRatio: 0.30, maxRatio: 0.85, keyframes: [0.30, 0.85, 0.40, 0.75, 0.20, 0.85, 0.30], delay: 0.06, duration: 0.82 },
  { minRatio: 0.10, maxRatio: 0.70, keyframes: [0.10, 0.45, 0.70, 0.20, 0.60, 0.30, 0.10], delay: 0.16, duration: 1.08 },
  { minRatio: 0.25, maxRatio: 0.90, keyframes: [0.25, 0.80, 0.35, 0.90, 0.50, 0.75, 0.25], delay: 0.32, duration: 0.88 },
  { minRatio: 0.35, maxRatio: 1.00, keyframes: [0.35, 0.95, 0.30, 0.85, 1.00, 0.45, 0.35], delay: 0.10, duration: 0.96 },
  { minRatio: 0.15, maxRatio: 0.75, keyframes: [0.15, 0.65, 0.40, 0.75, 0.20, 0.65, 0.15], delay: 0.26, duration: 1.12 },
  { minRatio: 0.20, maxRatio: 0.85, keyframes: [0.20, 0.75, 0.85, 0.35, 0.70, 0.25, 0.20], delay: 0.02, duration: 0.84 },
  { minRatio: 0.25, maxRatio: 0.95, keyframes: [0.25, 0.90, 0.20, 0.95, 0.40, 0.80, 0.25], delay: 0.20, duration: 1.02 },
];

export function VoiceVisualizer({
  barCount = 16,
  size = "md",
  accentColor = "#00e5ff",
  state = "speaking",
  className = "",
}: VoiceVisualizerProps) {
  // Height map based on size
  const containerHeightMap = {
    xs: "h-3.5 gap-0.5",
    sm: "h-5 gap-0.5",
    md: "h-7 gap-1",
    lg: "h-10 gap-1.5",
  };

  const barWidthMap = {
    xs: "w-0.5 rounded-full",
    sm: "w-0.75 rounded-full",
    md: "w-1 rounded-full",
    lg: "w-1.5 rounded-full",
  };

  const barsToRender = Array.from({ length: barCount }).map((_, index) => {
    const profile = BAR_PROFILES[index % BAR_PROFILES.length];
    return {
      id: index,
      ...profile,
    };
  });

  const isListening = state === "listening";

  return (
    <div
      className={`inline-flex items-center justify-center ${containerHeightMap[size]} ${className} select-none`}
      aria-label="Voice audio visualizer"
    >
      {barsToRender.map((bar) => {
        // Adjust color gradient dynamically based on state
        const isMiddleBar = bar.id % 3 === 1;
        const isPeakBar = bar.id % 4 === 2;

        return (
          <motion.div
            key={bar.id}
            className={`${barWidthMap[size]} transition-colors`}
            style={{
              background: isListening
                ? isPeakBar
                  ? "linear-gradient(to top, #f43f5e, #fb7185)"
                  : "linear-gradient(to top, #e11d48, #f43f5e)"
                : isPeakBar
                ? `linear-gradient(to top, ${accentColor}cc, #38bdf8)`
                : isMiddleBar
                ? `linear-gradient(to top, ${accentColor}, #818cf8)`
                : `linear-gradient(to top, ${accentColor}aa, ${accentColor})`,
              boxShadow: `0 0 ${size === "lg" ? "8px" : "5px"} ${
                isListening ? "rgba(244,63,94,0.6)" : `${accentColor}80`
              }`,
              transformOrigin: "bottom",
            }}
            animate={
              state === "idle"
                ? { scaleY: 0.15, opacity: 0.4 }
                : {
                    scaleY: bar.keyframes,
                    opacity: [0.65, 1, 0.8, 1, 0.7, 1, 0.65],
                  }
            }
            transition={
              state === "idle"
                ? { duration: 0.3 }
                : {
                    scaleY: {
                      repeat: Infinity,
                      repeatType: "mirror",
                      duration: bar.duration,
                      delay: bar.delay,
                      ease: "easeInOut",
                    },
                    opacity: {
                      repeat: Infinity,
                      repeatType: "mirror",
                      duration: bar.duration * 1.2,
                      delay: bar.delay,
                      ease: "easeInOut",
                    },
                  }
            }
          />
        );
      })}
    </div>
  );
}

interface SpeakingIndicatorWidgetProps {
  /** Whether AI or user audio is currently active */
  isSpeaking?: boolean;
  /** Whether voice recording is active */
  isListening?: boolean;
  /** Active message text snippet being spoken */
  spokenTextSnippet?: string;
  /** Callback to stop speaking or mute */
  onStopSpeaking: () => void;
  /** Accent color */
  accentColor?: string;
}

/**
 * Floating Premium Speaking Indicator Widget
 * Rendered at the bottom/top of screen when speech output or listening is active.
 */
export function SpeakingIndicatorWidget({
  isSpeaking = false,
  isListening = false,
  spokenTextSnippet,
  onStopSpeaking,
  accentColor = "#00e5ff",
}: SpeakingIndicatorWidgetProps) {
  if (!isSpeaking && !isListening) return null;

  const isActiveListening = isListening && !isSpeaking;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-40 max-w-md w-[92%] sm:w-auto"
    >
      <div
        className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl backdrop-blur-2xl border shadow-2xl transition-all select-none ${
          isActiveListening
            ? "bg-slate-950/90 dark:bg-slate-950/95 border-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.25)]"
            : "bg-slate-950/90 dark:bg-slate-950/95 border-cyan-500/40 shadow-[0_0_25px_rgba(0,229,255,0.25)]"
        }`}
      >
        {/* Animated Visualizer Hub */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
              isActiveListening
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
            }`}
          >
            {isActiveListening ? (
              <Mic className="w-4 h-4 text-rose-400 animate-pulse" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-300 animate-pulse" />
            )}
          </div>

          <VoiceVisualizer
            barCount={18}
            size="md"
            accentColor={isActiveListening ? "#f43f5e" : accentColor}
            state={isActiveListening ? "listening" : "speaking"}
          />
        </div>

        {/* Text Info */}
        <div className="min-w-0 flex-1 max-w-[200px] sm:max-w-[280px]">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-mono font-black uppercase tracking-wider ${
                isActiveListening ? "text-rose-400" : "text-cyan-300"
              }`}
            >
              {isActiveListening ? "LISTENING TO VOICE..." : "CORE AI SPEAKING"}
            </span>
            <Sparkles
              className="w-3 h-3 animate-spin"
              style={{ color: isActiveListening ? "#f43f5e" : accentColor }}
            />
          </div>
          {spokenTextSnippet ? (
            <p className="text-[11px] text-slate-300 font-medium truncate leading-tight mt-0.5">
              "{spokenTextSnippet}"
            </p>
          ) : (
            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
              {isActiveListening
                ? "Speak clearly into your microphone..."
                : "Synthesizing real-time voice guidance..."}
            </p>
          )}
        </div>

        {/* Mute / Stop Action Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={onStopSpeaking}
          className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
            isActiveListening
              ? "bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border border-rose-500/40"
              : "bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border border-rose-500/40"
          }`}
          title={isActiveListening ? "Stop Voice Listening" : "Mute AI Voice Output"}
        >
          <Square className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
          <span className="hidden sm:inline font-mono text-[10px] font-extrabold uppercase">
            {isActiveListening ? "Stop" : "Mute"}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
