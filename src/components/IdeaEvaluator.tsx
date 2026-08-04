import React, { useEffect, useState } from "react";
import { IdeaEvaluation } from "../types";
import { FileText, CheckCircle, XCircle, Award, Target, Zap, ArrowRight, ShieldCheck, AlertTriangle, Lightbulb, TrendingUp, Download, FileJson, Printer, RefreshCw, ArrowLeft } from "lucide-react";
import { motion, useMotionValue, animate, Variants } from "motion/react";
import { exportEvaluationToPdf } from "../lib/exportUtils";

interface IdeaEvaluatorProps {
  evaluation: IdeaEvaluation;
  onGenerateGuidance: (idea: string, title: string) => void;
  isGeneratingGuidance: boolean;
  onBackToChat?: () => void;
}

function AnimatedScore({ value, className }: { value: number; className?: string }) {
  const count = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    count.set(0);
    const controls = animate(count, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [value, count]);

  return <span className={className}>{displayValue}</span>;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 25,
    },
  },
};

export default function IdeaEvaluator({
  evaluation,
  onGenerateGuidance,
  isGeneratingGuidance,
  onBackToChat,
}: IdeaEvaluatorProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-rose-500";
  };

  const getProgressBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-3xl mx-auto space-y-4 p-4 md:p-6"
    >
      {/* Top Back Navigation Toolbar */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs"
      >
        {onBackToChat ? (
          <button
            type="button"
            onClick={onBackToChat}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-[#00e5ff]" />
            <span className="font-sans font-bold">← Back to Chat</span>
          </button>
        ) : (
          <span className="text-xs font-mono font-bold text-slate-400">Viability Scorecard</span>
        )}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest text-cyan-500 uppercase font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            Viability Evaluator
          </span>
        </div>
      </motion.div>

      {/* Export Bar Option Card */}
      <motion.div
        variants={itemVariants}
        id="scorecard-export-toolbar"
        className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-50 rounded-lg text-cyan-600">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block leading-none">Dossier Actions</span>
            <span className="text-xs font-bold text-slate-700 block mt-0.5">Save viability scorecard</span>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="btn-export-scorecard-pdf"
            onClick={() => exportEvaluationToPdf(evaluation)}
            className="flex-1 sm:flex-initial px-4 py-2 bg-[#00e5ff] text-slate-950 font-bold text-[11px] rounded-lg hover:bg-[#00b0ff] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.25)]"
            title="Export stylized PDF document"
          >
            <FileText className="w-3.5 h-3.5 text-slate-950" />
            PDF Report
          </button>
        </div>
      </motion.div>

      {/* Top Evaluation Result Card */}
      <motion.div
        variants={itemVariants}
        className="bento-card rounded-2xl p-6 relative overflow-hidden bg-white border border-slate-100"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 relative">
          <div>
            <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">Global-Level Verdict</span>
            <h2 className="text-2xl font-bold font-display text-slate-950 mt-1">{evaluation.title}</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-lg">{evaluation.summary}</p>
          </div>
          <div className="flex items-center gap-3 self-stretch md:self-auto justify-between border-t md:border-t-0 pt-3 md:pt-0">
            <div className="flex items-center gap-2">
              {evaluation.approved ? (
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-full font-semibold text-xs border border-emerald-100 uppercase tracking-wider">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  Approved
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 text-rose-700 rounded-full font-semibold text-xs border border-rose-100 uppercase tracking-wider">
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  Rejected
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-400 font-mono">Score:</span>
              <AnimatedScore
                value={evaluation.overallScore}
                className={`text-4xl font-extrabold font-display ${getScoreColor(evaluation.overallScore)}`}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Glow Accent based on Verdict */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-1 ${
            evaluation.approved ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]"
          }`}
        />
      </motion.div>

      {/* Grid of Metric Cards with Staggered Animations */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Feasibility */}
        <motion.div variants={itemVariants} className="bento-card rounded-xl p-5 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Feasibility</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <AnimatedScore
              value={evaluation.feasibilityScore}
              className={`text-2xl font-bold font-display ${getScoreColor(evaluation.feasibilityScore)}`}
            />
            <span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${getProgressBg(evaluation.feasibilityScore)}`}
              initial={{ width: 0 }}
              animate={{ width: `${evaluation.feasibilityScore}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">Technical viability & implementation effort.</p>
        </motion.div>

        {/* Market Potential */}
        <motion.div variants={itemVariants} className="bento-card rounded-xl p-5 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Market Potential</span>
            <Target className="w-4 h-4 text-[#00e5ff]" />
          </div>
          <div className="flex items-baseline gap-1">
            <AnimatedScore
              value={evaluation.marketPotentialScore}
              className={`text-2xl font-bold font-display ${getScoreColor(evaluation.marketPotentialScore)}`}
            />
            <span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${getProgressBg(evaluation.marketPotentialScore)}`}
              initial={{ width: 0 }}
              animate={{ width: `${evaluation.marketPotentialScore}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">Monetization, scaling & growth vector.</p>
        </motion.div>

        {/* Innovation */}
        <motion.div variants={itemVariants} className="bento-card rounded-xl p-5 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Uniqueness</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <AnimatedScore
              value={evaluation.innovationScore}
              className={`text-2xl font-bold font-display ${getScoreColor(evaluation.innovationScore)}`}
            />
            <span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${getProgressBg(evaluation.innovationScore)}`}
              initial={{ width: 0 }}
              animate={{ width: `${evaluation.innovationScore}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">Novelty, competitive edge & disruption.</p>
        </motion.div>
      </motion.div>

      {/* Strengths & Weaknesses Split Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bento-card rounded-xl p-5 bg-white border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-display text-slate-800">Key Advantages</h3>
          </div>
          <ul className="space-y-2.5">
            {evaluation.strengths.map((strength, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed"
              >
                <span className="text-emerald-500 font-bold font-mono mt-0.5">•</span>
                <span>{strength}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bento-card rounded-xl p-5 bg-white border-l-4 border-l-rose-500">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-display text-slate-800">Execution Hurdles</h3>
          </div>
          <ul className="space-y-2.5">
            {evaluation.weaknesses.map((weakness, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed"
              >
                <span className="text-rose-500 font-bold font-mono mt-0.5">•</span>
                <span>{weakness}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Market analysis */}
      <motion.div variants={itemVariants} className="bento-card rounded-xl p-5 bg-white">
        <div className="flex items-center gap-2 mb-2.5">
          <TrendingUp className="w-4 h-4 text-[#00e5ff]" />
          <h3 className="text-sm font-bold uppercase tracking-wider font-display text-slate-800">Market Size & Landscape</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-sans">{evaluation.marketSizeAnalysis}</p>
      </motion.div>

      {/* Recommendations */}
      <motion.div variants={itemVariants} className="bento-card rounded-xl p-5 bg-white relative">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold uppercase tracking-wider font-display text-slate-800">Actionable Next Steps</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {evaluation.recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-between"
            >
              <span className="text-[10px] font-mono text-slate-400 font-semibold mb-1">0{i + 1}. RECOMMENDATION</span>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">{rec}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Auto-Pivot Recommendations */}
      {(evaluation.pivotRecommendations && evaluation.pivotRecommendations.length > 0) || !evaluation.approved ? (
        <motion.div
          variants={itemVariants}
          className="bento-card rounded-xl p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(0,229,255,0.15)] relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-cyan-500/20 rounded-lg border border-cyan-400/40 text-[#00e5ff]">
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-extrabold uppercase text-[#00e5ff] tracking-widest block">
                  {!evaluation.approved ? "⚠️ CONCEPT REJECTED — ACTIONABLE PIVOTS REQUIRED" : "🔄 STRATEGIC PIVOT OPPORTUNITIES"}
                </span>
                <h3 className="text-sm font-bold font-display text-slate-100">
                  Recommended Business Model Pivots
                </h3>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
              CORE AI Strategy
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {(evaluation.pivotRecommendations && evaluation.pivotRecommendations.length > 0
              ? evaluation.pivotRecommendations
              : [
                  "Shift from broad consumer audience to a targeted B2B enterprise workflow niche with clearer willingness to pay.",
                  "Pivot from custom hardware or complex manual ops to an API-first white-label service.",
                  "Focus exclusively on high-retention automation tools before expanding into a full suite."
                ]
            ).map((pivot, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 flex items-start gap-3 hover:border-cyan-500/50 transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[#00e5ff] flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                  P{i + 1}
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">{pivot}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : null}

    </motion.div>
  );
}
