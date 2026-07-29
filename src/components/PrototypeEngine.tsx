import React, { useState } from "react";
import { PrototypeGuidance } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Code, CheckSquare, Square, Layers, Layout, Clock, Sparkles, Image, RefreshCw, Download, Copy, Check, ArrowLeft, Kanban } from "lucide-react";
import ImageGenerator from "./ImageGenerator";
import MilestoneTimeline from "./MilestoneTimeline";

interface PrototypeEngineProps {
  guidance: PrototypeGuidance;
  onGenerateImage?: (prompt: string, aspectRatio: string) => Promise<string>;
  isGeneratingImage?: boolean;
  onAnalyzeImage?: (payload: { base64Data: string; mimeType: string; prompt: string }) => Promise<string>;
  isAnalyzingImage?: boolean;
  onBackToChat?: () => void;
}

export default function PrototypeEngine({
  guidance,
  onGenerateImage,
  isGeneratingImage = false,
  onAnalyzeImage,
  isAnalyzingImage = false,
  onBackToChat,
}: PrototypeEngineProps) {
  // Let the user keep track of completed steps!
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStepTab, setActiveStepTab] = useState<number>(1);
  const [activeVisualMode, setActiveVisualMode] = useState<"wireframe" | "image_engine" | "tailwind_code">("image_engine");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Quick auto-generated image state for prototype
  const [quickMockupUrl, setQuickMockupUrl] = useState<string>("");
  const [isQuickGenerating, setIsQuickGenerating] = useState<boolean>(false);

  const toggleStep = (stepNum: number) => {
    if (completedSteps.includes(stepNum)) {
      setCompletedSteps(completedSteps.filter((n) => n !== stepNum));
    } else {
      setCompletedSteps([...completedSteps, stepNum]);
    }
  };

  const handleAutoGenerateBlueprintMockup = async () => {
    if (!onGenerateImage) return;
    setIsQuickGenerating(true);
    try {
      const autoPrompt = `High fidelity UI prototype mockup for app "${guidance.title}". ${guidance.wireframeConcept.slice(0, 180)}. Sleek modern dark mode interface with cyan accents, clean layout, professional mobile screen design.`;
      const url = await onGenerateImage(autoPrompt, "9:16");
      setQuickMockupUrl(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsQuickGenerating(false);
    }
  };

  const totalHours = guidance.steps.reduce((sum, s) => sum + s.estimatedHours, 0);
  const percentComplete = Math.round(
    (completedSteps.length / guidance.steps.length) * 100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-3xl mx-auto space-y-4 p-4 md:p-6"
    >
      {/* Top Back Navigation Toolbar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
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
          <span className="text-xs font-mono font-bold text-slate-400">Prototype Studio</span>
        )}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest text-cyan-500 uppercase font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            Prototype Blueprint
          </span>
        </div>
      </div>
      {/* Title & Stats */}
      <div className="bento-card rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <span className="text-xs font-mono tracking-widest text-[#00e5ff] uppercase font-bold neon-text-glow">
          Interactive Prototype Blueprint
        </span>
        <h2 className="text-2xl font-bold font-display text-slate-950 dark:text-slate-100 mt-1">{guidance.title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{guidance.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 mt-5 pt-5">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Time</span>
              <span className="text-sm font-bold font-display text-slate-800 dark:text-slate-200">{totalHours} Hours</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-400" />
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Build Phases</span>
              <span className="text-sm font-bold font-display text-slate-800 dark:text-slate-200">{guidance.steps.length} Steps</span>
            </div>
          </div>
          <div className="flex items-center gap-2 col-span-2 sm:col-span-1 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
            <CheckSquare className="w-5 h-5 text-emerald-500" />
            <div className="w-full">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Blueprint Progress</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-display text-slate-800 dark:text-slate-200">{percentComplete}%</span>
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden max-w-[80px]">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Stack Section */}
      <div className="bento-card rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Code className="w-5 h-5 text-[#00e5ff]" />
          <h3 className="text-sm font-bold uppercase tracking-wider font-display text-slate-800 dark:text-slate-200">
            Recommended Technology Stack
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {guidance.prototypeStack.map((tech, i) => (
            <span
              key={i}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 hover:border-cyan-300 transition-colors"
            >
              <div className="w-1.5 h-1.5 bg-[#00e5ff] rounded-full shadow-[0_0_8px_#00e5ff]" />
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Main timeline and instructions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Step list - Left Side */}
        <div className="md:col-span-5 space-y-2.5">
          <h4 className="text-xs font-bold uppercase text-slate-400 font-mono tracking-wider px-1">
            Execution Roadmap
          </h4>
          <div className="space-y-2">
            {guidance.steps.map((step) => {
              const isCompleted = completedSteps.includes(step.stepNumber);
              const isActive = activeStepTab === step.stepNumber;
              return (
                <div
                  key={step.stepNumber}
                  onClick={() => setActiveStepTab(step.stepNumber)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isActive
                      ? "bg-slate-50 dark:bg-slate-800/80 border-cyan-400/80 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStep(step.stepNumber);
                      }}
                      className="text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                    >
                      {isCompleted ? (
                        <CheckSquare className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-400" />
                      )}
                    </button>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        PHASE 0{step.stepNumber}
                      </span>
                      <h4
                        className={`text-xs font-bold leading-tight ${
                          isCompleted ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {step.title}
                      </h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{step.estimatedHours}h</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Step Details - Right Side */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 bento-card rounded-xl p-5 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {guidance.steps
              .filter((s) => s.stepNumber === activeStepTab)
              .map((step) => (
                <motion.div
                  key={step.stepNumber}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4 h-full flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                        Active Step Details
                      </span>
                      <span className="text-xs font-mono bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded font-bold">
                        {step.estimatedHours} Hours Est.
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold font-display text-slate-950 dark:text-slate-100">
                        {step.stepNumber}. {step.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-700/80">
                        {step.actionItem}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase block">
                        Technical Guidelines & Snippets
                      </span>
                      <pre className="text-[11px] font-mono text-emerald-400 bg-slate-950 p-3.5 rounded-lg overflow-x-auto leading-relaxed max-h-[160px] whitespace-pre-wrap border border-slate-800">
                        {step.technicalDetails}
                      </pre>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-400">
                      Toggle checkbox to update plan progress.
                    </span>
                    <button
                      onClick={() => toggleStep(step.stepNumber)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-display transition-all cursor-pointer ${
                        completedSteps.includes(step.stepNumber)
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200"
                          : "bg-[#00e5ff] text-slate-950 shadow-[0_0_10px_rgba(0,229,255,0.2)] hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                      }`}
                    >
                      {completedSteps.includes(step.stepNumber) ? "Mark Incomplete" : "Complete Phase"}
                    </button>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>

      {/* INTERACTIVE MILESTONE TIMELINE ENGINE */}
      <MilestoneTimeline
        steps={guidance.steps}
        completedStepNumbers={completedSteps}
        onStepToggle={toggleStep}
      />

      {/* PROTOTYPE VISUALS & IMAGE GENERATOR ENGINE SECTION */}
      <div className="bento-card rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00e5ff]" />
            <div>
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">
                Prototype Image Generator Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Synthesize high-fidelity UI mockup images or analyze sketch blueprints for "{guidance.title}".
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto text-xs font-bold font-mono">
            <button
              onClick={() => setActiveVisualMode("image_engine")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeVisualMode === "image_engine"
                  ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-cyan-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Image className="w-3.5 h-3.5 text-cyan-500" />
              <span>Image Generator</span>
            </button>

            <button
              onClick={() => setActiveVisualMode("wireframe")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeVisualMode === "wireframe"
                  ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-cyan-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Layout className="w-3.5 h-3.5 text-cyan-500" />
              <span>Mobile Wireframe</span>
            </button>

            <button
              onClick={() => setActiveVisualMode("tailwind_code")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeVisualMode === "tailwind_code"
                  ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-cyan-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Code className="w-3.5 h-3.5 text-cyan-500" />
              <span>Tailwind Wireframe</span>
            </button>
          </div>
        </div>

        {activeVisualMode === "image_engine" ? (
          <div className="space-y-5">
            {/* Quick 1-Click Synthesizer Banner */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">
                  ⚡ Quick Blueprint Mockup
                </span>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Generate instant 9:16 mobile mockup for "{guidance.title}"
                </h4>
              </div>

              <button
                onClick={handleAutoGenerateBlueprintMockup}
                disabled={isQuickGenerating || !onGenerateImage}
                className="px-4 py-2 bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 font-bold font-display text-xs rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isQuickGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 dark:text-slate-950" />
                    Auto-Generate Mockup
                  </>
                )}
              </button>
            </div>

            {/* Rendered Quick Mockup Preview if available */}
            {quickMockupUrl && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-3">
                <span className="text-[10px] font-mono font-bold text-[#00e5ff] uppercase tracking-widest block">
                  ✨ Instant Blueprint Mockup Generated
                </span>
                <div className="max-w-xs mx-auto overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
                  <img
                    src={quickMockupUrl}
                    alt="Auto Generated Prototype Mockup"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-cover hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex justify-center gap-2">
                  <a
                    href={quickMockupUrl}
                    download="blueprint_mockup.png"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    Download Mockup
                  </a>
                </div>
              </div>
            )}

            {/* Embedded Full Image Generator Component */}
            {onGenerateImage && onAnalyzeImage && (
              <div className="pt-2">
                <ImageGenerator
                  onGenerateImage={onGenerateImage}
                  onAnalyzeImage={onAnalyzeImage}
                  isGenerating={isGeneratingImage}
                  isAnalyzing={isAnalyzingImage}
                />
              </div>
            )}
          </div>
        ) : activeVisualMode === "tailwind_code" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-t-xl border border-slate-800 border-b-0">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#00e5ff]" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  Approved Wireframe Tailwind HTML Snippet
                </span>
              </div>
              <button
                onClick={() => {
                  const codeToCopy = guidance.wireframeCode || `<div class="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center">\n  <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">\n    <h1 class="text-xl font-bold text-[#00e5ff]">${guidance.title}</h1>\n    <p class="text-xs text-slate-400">${guidance.description}</p>\n  </div>\n</div>`;
                  navigator.clipboard.writeText(codeToCopy);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-cyan-300 font-mono text-xs rounded-b-xl border border-slate-800 overflow-x-auto max-h-[380px] whitespace-pre-wrap leading-relaxed select-all">
              {guidance.wireframeCode || `<div class="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center">
  <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
    <div class="flex justify-between items-center border-b border-slate-800 pb-3">
      <h1 class="text-lg font-extrabold text-[#00e5ff] tracking-tight">${guidance.title}</h1>
      <span class="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-mono font-bold">v1.0 MVP</span>
    </div>
    <p class="text-xs text-slate-400 leading-relaxed">${guidance.description}</p>
    <div class="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
      <span class="text-[10px] font-mono text-cyan-400 font-bold uppercase">Visual Layout Concept</span>
      <p class="text-xs text-slate-300">${guidance.wireframeConcept}</p>
    </div>
    <button class="w-full py-3 bg-[#00e5ff] hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all">
      Launch Interactive Component
    </button>
  </div>
</div>`}
            </pre>
          </div>
        ) : (
          /* Realistic Mobile View mockup */
          <div className="flex justify-center py-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="w-[300px] h-[520px] bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border-8 border-slate-950 dark:border-slate-800 relative flex flex-col overflow-hidden select-none">
              {/* Phone notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-950 rounded-b-xl z-20 flex justify-center items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
                <div className="w-12 h-1 bg-slate-900 rounded-full" />
              </div>

              {/* Status bar */}
              <div className="h-6 px-6 pt-1 flex justify-between items-center text-[10px] text-slate-400 font-mono z-10">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <div className="w-4 h-2 bg-slate-300 rounded-sm" />
                </div>
              </div>

              {/* Inner Phone Content */}
              <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto text-slate-800 dark:text-slate-200 relative">
                <div className="space-y-3 pt-2">
                  {/* Header Mockup */}
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-extrabold font-display tracking-tight text-[#00e5ff]">
                      {guidance.title.slice(0, 15)}...
                    </span>
                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800" />
                  </div>

                  {/* Simulated Widget Carousel */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 rounded-xl space-y-1.5">
                    <div className="w-12 h-2.5 bg-[#00e5ff]/20 rounded" />
                    <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="w-full h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[10px] font-mono text-slate-400">
                      Interactive Visual Block
                    </div>
                  </div>

                  {/* Sub-sections wireframe concept list */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 font-mono uppercase">
                      Primary List Layout
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-lg text-center space-y-1">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto" />
                        <div className="w-12 h-2 bg-slate-200 dark:bg-slate-700 rounded mx-auto" />
                      </div>
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-lg text-center space-y-1">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto" />
                        <div className="w-12 h-2 bg-slate-200 dark:bg-slate-700 rounded mx-auto" />
                      </div>
                    </div>
                  </div>

                  {/* Inline user concept description parsed */}
                  <div className="p-3 bg-slate-950 text-emerald-400 font-mono text-[9px] rounded-lg border border-slate-800 leading-normal whitespace-pre-line max-h-[140px] overflow-y-auto">
                    {guidance.wireframeConcept}
                  </div>
                </div>

                {/* Mobile bottom navigation menu wireframe */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-around items-center mt-3">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-[#00e5ff] rounded-sm" />
                    <span className="text-[8px] mt-0.5 text-[#00e5ff] font-bold">Home</span>
                  </div>
                  <div className="flex flex-col items-center opacity-40">
                    <div className="w-4 h-4 bg-slate-400 rounded-sm" />
                    <span className="text-[8px] mt-0.5">Explore</span>
                  </div>
                  <div className="flex flex-col items-center opacity-40">
                    <div className="w-4 h-4 bg-slate-400 rounded-sm" />
                    <span className="text-[8px] mt-0.5">Settings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

