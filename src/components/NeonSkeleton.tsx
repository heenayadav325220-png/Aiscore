import React from "react";
import { motion } from "motion/react";
import { Sparkles, Cpu, Lightbulb, Code, ImageIcon, FileText, Zap } from "lucide-react";

export function GlobalNeonLoader({ label = "CORE AI MATRIX SYNTHESIZING..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3 select-none">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-2xl border-2 border-[#00e5ff] shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center justify-center bg-slate-950/80 backdrop-blur-md"
        >
          <Sparkles className="w-6 h-6 text-[#00e5ff]" />
        </motion.div>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5ff] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00e5ff]"></span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-[#00e5ff] rounded-full animate-bounce delay-100" />
        <span className="w-1.5 h-1.5 bg-[#00e5ff] rounded-full animate-bounce delay-200" />
        <span className="w-1.5 h-1.5 bg-[#00e5ff] rounded-full animate-bounce delay-300" />
        <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#00e5ff] neon-text-glow">
          {label}
        </span>
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex gap-3.5 items-start max-w-2xl w-full my-3 p-4 bg-white dark:bg-slate-900/90 border-2 border-cyan-500/40 dark:border-cyan-500/50 rounded-2xl shadow-[0_0_20px_rgba(0,229,255,0.15)] animate-pulse">
      <div className="w-8 h-8 rounded-full border border-[#00e5ff] bg-slate-950 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,229,255,0.3)]">
        <Cpu className="w-4 h-4 text-[#00e5ff]" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00e5ff] neon-text-glow">
              CORE AI SYNTHESIZING...
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400">Processing Matrix</span>
        </div>

        {/* Shimmering Neon Line Skeletons */}
        <div className="space-y-2">
          <div className="h-3.5 bg-gradient-to-r from-cyan-500/30 via-cyan-400/60 to-cyan-500/30 rounded-full w-full animate-pulse" />
          <div className="h-3.5 bg-gradient-to-r from-cyan-500/20 via-cyan-400/50 to-cyan-500/20 rounded-full w-5/6 animate-pulse" />
          <div className="h-3.5 bg-gradient-to-r from-cyan-500/20 via-cyan-400/40 to-cyan-500/20 rounded-full w-4/6 animate-pulse" />
        </div>

        {/* Technical Footer Pill Skeletons */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-5 w-20 bg-cyan-500/10 border border-cyan-500/30 rounded-full" />
          <div className="h-5 w-24 bg-cyan-500/10 border border-cyan-500/30 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ScorecardSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 p-4 md:p-6 animate-pulse">
      {/* Top Header Card Skeleton */}
      <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border-2 border-cyan-500/30 shadow-[0_0_20px_rgba(0,229,255,0.1)] space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2 flex-1">
            <div className="h-3 w-32 bg-cyan-500/30 rounded-full" />
            <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-full bg-slate-150 dark:bg-slate-800/60 rounded-lg" />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-20 h-8 bg-emerald-500/20 border border-emerald-500/40 rounded-full" />
            <div className="w-16 h-12 bg-cyan-500/20 border border-cyan-500/40 rounded-xl flex items-center justify-center font-extrabold text-[#00e5ff] text-xl font-mono">
              --
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Metric Skeleton Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <Zap className="w-4 h-4 text-cyan-500/60" />
            </div>
            <div className="h-8 w-16 bg-cyan-500/20 rounded-lg" />
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400/50 w-2/3" />
            </div>
          </div>
        ))}
      </div>

      {/* Strengths & Weaknesses Split Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl p-5 bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500 border border-slate-150 dark:border-slate-800 space-y-3">
          <div className="h-4 w-32 bg-emerald-500/30 rounded" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-3 w-4/6 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        </div>
        <div className="rounded-xl p-5 bg-white dark:bg-slate-900 border-l-4 border-l-rose-500 border border-slate-150 dark:border-slate-800 space-y-3">
          <div className="h-4 w-32 bg-rose-500/30 rounded" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-3 w-4/6 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BlueprintSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 p-4 md:p-6 animate-pulse">
      {/* Title Header Card Skeleton */}
      <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border-2 border-cyan-500/30 shadow-[0_0_20px_rgba(0,229,255,0.1)] space-y-4">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-[#00e5ff]" />
          <span className="text-xs font-mono font-bold text-[#00e5ff] uppercase tracking-wider">
            COMPILING INTERACTIVE BLUEPRINT...
          </span>
        </div>
        <div className="h-6 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-full bg-slate-150 dark:bg-slate-800/60 rounded-lg" />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg col-span-2 sm:col-span-1" />
        </div>
      </div>

      {/* Wireframe Box Skeleton */}
      <div className="rounded-2xl p-6 bg-slate-950 border border-cyan-500/40 space-y-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 mx-auto flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-[#00e5ff] animate-spin" />
        </div>
        <div className="h-4 w-48 bg-cyan-500/30 rounded-full mx-auto" />
        <div className="h-32 bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-center items-center space-y-2">
          <div className="h-3 w-3/4 bg-slate-800 rounded" />
          <div className="h-3 w-1/2 bg-slate-800 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ImageGeneratorSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 p-4 animate-pulse">
      <div className="rounded-2xl bg-slate-950 border-2 border-cyan-500/50 p-6 space-y-4 shadow-[0_0_25px_rgba(0,229,255,0.2)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#00e5ff]" />
            <span className="text-xs font-mono font-extrabold text-[#00e5ff] tracking-widest uppercase">
              GENERATING MOCKUP IMAGE...
            </span>
          </div>
          <span className="px-2.5 py-1 bg-cyan-500/20 border border-cyan-400/40 rounded-full text-[10px] font-mono text-cyan-300">
            Ratio 1:1
          </span>
        </div>

        {/* Glowing Frame Scanner Line */}
        <div className="relative h-64 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col items-center justify-center">
          <motion.div
            animate={{ y: [-120, 120] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-1 bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent shadow-[0_0_15px_#00e5ff]"
          />
          <Sparkles className="w-8 h-8 text-[#00e5ff] animate-pulse mb-2" />
          <span className="text-xs font-mono text-slate-400">Pollinations / Flux Engine Synthesizing Pixel Canvas</span>
        </div>
      </div>
    </div>
  );
}

export function WritingAssistantSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 p-4 animate-pulse">
      <div className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-cyan-500/40 p-6 space-y-4 shadow-[0_0_20px_rgba(0,229,255,0.15)]">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <FileText className="w-5 h-5 text-[#00e5ff]" />
          <span className="text-xs font-mono font-bold text-[#00e5ff] uppercase tracking-wider">
            DRAFTING DOCUMENT CANVAS...
          </span>
        </div>
        <div className="space-y-3 pt-2">
          <div className="h-5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800/80 rounded" />
          <div className="h-3.5 w-11/12 bg-slate-100 dark:bg-slate-800/80 rounded" />
          <div className="h-3.5 w-4/5 bg-slate-100 dark:bg-slate-800/80 rounded" />
          <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800/80 rounded" />
        </div>
      </div>
    </div>
  );
}
