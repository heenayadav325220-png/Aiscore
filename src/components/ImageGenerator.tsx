import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Image, Sparkles, Upload, FileSearch, ArrowRight, RefreshCw, ZoomIn, ArrowLeft } from "lucide-react";

interface ImageGeneratorProps {
  onGenerateImage: (prompt: string, aspectRatio: string) => Promise<string>;
  onAnalyzeImage: (payload: { base64Data: string; mimeType: string; prompt: string }) => Promise<string>;
  isGenerating: boolean;
  isAnalyzing: boolean;
  onBackToChat?: () => void;
}

const RATIOS = [
  { label: "Square (1:1)", value: "1:1" },
  { label: "Landscape (16:9)", value: "16:9" },
  { label: "Portrait (9:16)", value: "9:16" },
  { label: "Classic (4:3)", value: "4:3" },
  { label: "Book (3:4)", value: "3:4" },
];

const ANALYSIS_PRESETS = [
  { id: "components", label: "Extract Layout Components", prompt: "Identify all primary visual components, grids, buttons, and sections in this sketch, and list them as UI items." },
  { id: "tech_stack", label: "Recommend Tech Architecture", prompt: "What modern frameworks, CSS styling libraries, and state managers should I use to turn this wireframe drawing into a functional, production-ready app?" },
  { id: "ux_audit", label: "Perform Accessibility & UX Review", prompt: "Perform a thorough UX and accessibility audit on this reference image. List what looks great and what can be optimized for touch targets, spacing, and hierarchy." },
];

export default function ImageGenerator({
  onGenerateImage,
  onAnalyzeImage,
  isGenerating,
  isAnalyzing,
  onBackToChat,
}: ImageGeneratorProps) {
  // Tabs: 'generate' or 'analyze'
  const [activeTab, setActiveTab] = useState<"generate" | "analyze">("generate");

  // State for generator
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [generatedUrl, setGeneratedUrl] = useState("");

  // State for analyzer
  const [uploadedBase64, setUploadedBase64] = useState("");
  const [uploadedMime, setUploadedMime] = useState("");
  const [analysisPrompt, setAnalysisPrompt] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // File picker handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Invalid format. Please select an image file (PNG, JPG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Str = reader.result as string;
      const parts = base64Str.split(",");
      if (parts.length === 2) {
        setUploadedBase64(parts[1]);
        setUploadedMime(file.type);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatePrompt.trim()) return;

    try {
      const url = await onGenerateImage(generatePrompt, aspectRatio);
      setGeneratedUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyze = async (presetPrompt?: string) => {
    if (!uploadedBase64) return;
    const finalPrompt = presetPrompt || analysisPrompt || "Analyze this image and explain how to code it.";

    try {
      const result = await onAnalyzeImage({
        base64Data: uploadedBase64,
        mimeType: uploadedMime,
        prompt: finalPrompt,
      });
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 p-4 md:p-6">
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
          <span className="text-xs font-mono font-bold text-slate-400">Visual Studio</span>
        )}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest text-cyan-500 uppercase font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            Image Generator & Visuals
          </span>
        </div>
      </div>
      {/* Tab Switcher */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full">
        <button
          onClick={() => setActiveTab("generate")}
          className={`flex-1 py-3 text-xs font-bold font-display rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "generate"
              ? "bg-white text-slate-950 shadow-sm border border-slate-200/50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#00e5ff]" />
          Visual Prototype Generator
        </button>
        <button
          onClick={() => setActiveTab("analyze")}
          className={`flex-1 py-3 text-xs font-bold font-display rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "analyze"
              ? "bg-white text-slate-950 shadow-sm border border-slate-200/50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileSearch className="w-4 h-4 text-[#00e5ff]" />
          Sketch & Design Analyzer
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "generate" ? (
          <motion.div
            key="generate-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* Left side parameters */}
            <form onSubmit={handleGenerate} className="md:col-span-5 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400 font-mono tracking-wider block">
                  Describe visual concept
                </label>
                <textarea
                  value={generatePrompt}
                  onChange={(e) => setGeneratePrompt(e.target.value)}
                  placeholder="e.g. Modern minimalist smart home app dashboard with temperature dials, white glassmorphism, cozy twilight lighting overlays..."
                  rows={4}
                  className="w-full p-3 rounded-lg border border-slate-100 text-xs focus:outline-none focus:border-cyan-400 font-sans resize-none placeholder-slate-400 leading-relaxed"
                />
              </div>

              {/* Aspect Ratio Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400 font-mono tracking-wider block">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {RATIOS.map((ratio) => (
                    <button
                      key={ratio.value}
                      type="button"
                      onClick={() => setAspectRatio(ratio.value)}
                      className={`p-2.5 rounded-lg border text-[11px] font-medium font-mono text-center transition-all cursor-pointer ${
                        aspectRatio === ratio.value
                          ? "bg-slate-50 border-cyan-400 text-slate-900 font-bold"
                          : "bg-white border-slate-100 hover:border-slate-200 text-slate-500"
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating || !generatePrompt.trim()}
                className="w-full py-3 bg-[#00e5ff] text-slate-950 font-bold font-display text-xs rounded-xl hover:bg-[#00b0ff] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.4)] disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                    Synthesizing...
                  </span>
                ) : (
                  <>
                    Generate Visual Asset
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Right side generated preview */}
            <div className="md:col-span-7 flex flex-col justify-between bento-card rounded-xl p-5 bg-white min-h-[360px]">
              <div className="flex-1 flex flex-col justify-center items-center">
                {generatedUrl ? (
                  <div className="space-y-3 w-full text-center">
                    <span className="text-[10px] font-mono font-bold text-[#00e5ff] tracking-widest uppercase">
                      Generated Asset Preview
                    </span>
                    <div className="p-1 rounded-2xl border border-slate-100 max-w-sm mx-auto overflow-hidden bg-slate-50 shadow-inner">
                      <img
                        src={generatedUrl}
                        alt="AI Generated Visual Asset"
                        referrerPolicy="no-referrer"
                        className="rounded-xl w-full h-auto max-h-[260px] object-contain transition-transform hover:scale-[1.02]"
                      />
                    </div>
                    <div className="flex justify-center gap-3 mt-2">
                      <a
                        href={generatedUrl}
                        download={`${generatePrompt.slice(0, 15).replace(/\s/g, "_")}.png`}
                        className="px-4 py-2 bg-slate-100 border border-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        Download Asset
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-slate-50/50 rounded-lg border border-dashed border-slate-100 w-full flex flex-col items-center justify-center h-full min-h-[280px]">
                    <Image className="w-10 h-10 text-slate-300 animate-pulse mb-3" />
                    <h4 className="text-xs font-bold text-slate-600 font-display">No visual asset generated yet</h4>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-normal">
                      Write a detailed description and trigger synthesis to generate immediate high-precision UI wireframe images.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="analyze-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* Left side upload canvas */}
            <div className="md:col-span-5 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400 font-mono tracking-wider block">
                  Sketch upload
                </label>

                {/* Drag and drop zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
                    isDragging
                      ? "border-cyan-400 bg-cyan-50/40"
                      : uploadedBase64
                      ? "border-slate-200 bg-slate-50/20"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {uploadedBase64 ? (
                    <div className="space-y-2">
                      <img
                        src={`data:${uploadedMime};base64,${uploadedBase64}`}
                        alt="Uploaded concept file"
                        referrerPolicy="no-referrer"
                        className="h-20 w-auto rounded border border-slate-200 mx-auto object-contain"
                      />
                      <span className="text-[10px] font-bold text-slate-500 font-mono block">
                        File Loaded successfully
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-7 h-7 text-slate-400 animate-bounce mb-2" />
                      <span className="text-xs font-bold text-slate-600 block">Drag & Drop Wireframe</span>
                      <span className="text-[10px] text-slate-400 mt-1 block">or click to browse from device</span>
                    </>
                  )}
                </div>
              </div>

              {/* Analysis prompt and presets */}
              {uploadedBase64 && (
                <div className="space-y-4">
                  {/* Analysis presets */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider block">
                      Recommended Preset Prompts
                    </label>
                    <div className="space-y-1">
                      {ANALYSIS_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleAnalyze(p.prompt)}
                          disabled={isAnalyzing}
                          className="w-full text-left p-2.5 rounded-lg border border-slate-100 text-[11px] bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center justify-between cursor-pointer group"
                        >
                          <span className="leading-snug truncate pr-2">{p.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual Prompt Input */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider block">
                      Custom Inquiry Prompt
                    </label>
                    <textarea
                      value={analysisPrompt}
                      onChange={(e) => setAnalysisPrompt(e.target.value)}
                      placeholder="e.g. List all colors used, evaluate layout proportions, and write tailwind code to reproduce this..."
                      rows={3}
                      className="w-full p-2.5 rounded-lg border border-slate-100 text-xs focus:outline-none focus:border-cyan-400 font-sans resize-none placeholder-slate-400 leading-relaxed"
                    />
                    <button
                      onClick={() => handleAnalyze()}
                      disabled={isAnalyzing || !analysisPrompt.trim()}
                      className="w-full py-2.5 bg-slate-900 text-white font-bold font-display text-xs rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                          Analyzing Sketch...
                        </>
                      ) : (
                        <>
                          Custom Analysis
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right side outcome details */}
            <div className="md:col-span-7 flex flex-col justify-between bento-card rounded-xl p-5 bg-white min-h-[380px]">
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 mb-4">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                    Multimodal Assessment Output
                  </span>
                </div>

                {analysisResult ? (
                  <div className="flex-1 text-xs text-slate-700 overflow-y-auto leading-relaxed font-sans prose max-h-[320px] whitespace-pre-wrap">
                    {analysisResult}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-lg border border-dashed border-slate-100 h-full min-h-[280px]">
                    <FileSearch className="w-8 h-8 text-slate-300 mb-2" />
                    <h4 className="text-xs font-bold text-slate-500 font-display">No outcome generated yet</h4>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-normal">
                      Upload or drag-and-drop a wireframe blueprint image first, then click any prompt preset or write your own inquiry to run the understanding engine.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
