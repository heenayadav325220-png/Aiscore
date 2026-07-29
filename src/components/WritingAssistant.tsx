import React, { useState, useEffect, useRef } from "react";
import { PenTool, Copy, Check, Sparkles, FileText, ArrowRight, BookOpen, ArrowLeft, Save, RotateCcw, Trash2, Clock, CheckCircle2, Bold, Italic, Underline, List, Code } from "lucide-react";

interface WritingAssistantProps {
  onDraftDocument: (payload: {
    prompt: string;
    documentType: string;
    tone: string;
    targetAudience: string;
  }) => Promise<string>;
  isDrafting: boolean;
  onBackToChat?: () => void;
}

const STORAGE_KEY = "core_ai_writing_canvas_draft";

const DOCUMENT_TYPES = [
  { id: "pitch", label: "Elevator Pitch", icon: Sparkles },
  { id: "spec", label: "Technical Spec (PRD)", icon: CodeBlockIcon },
  { id: "marketing", label: "Marketing Ad Copy", icon: FileText },
  { id: "user_stories", label: "Agile User Stories", icon: BookOpen },
  { id: "business_plan", label: "Executive Summary", icon: PenTool },
];

function CodeBlockIcon(props: React.SVGProps<SVGSVGElement>) {
  return <FileText {...props} />;
}

const TONES = [
  { id: "professional", label: "Professional" },
  { id: "bold", label: "Bold & Persuasive" },
  { id: "creative", label: "Creative & Inspiring" },
  { id: "empathetic", label: "Warm & Empathetic" },
  { id: "witty", label: "Casual & Witty" },
];

const AUDIENCES = [
  { id: "investors", label: "Venture Investors" },
  { id: "developers", label: "Software Engineers" },
  { id: "consumers", label: "Everyday Customers" },
  { id: "executives", label: "Corporate Executives" },
  { id: "general", label: "General Public" },
];

export default function WritingAssistant({ onDraftDocument, isDrafting, onBackToChat }: WritingAssistantProps) {
  const [selectedType, setSelectedType] = useState("pitch");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [selectedAudience, setSelectedAudience] = useState("general");
  const [prompt, setPrompt] = useState("");
  const [draftResult, setDraftResult] = useState("");
  const [copied, setCopied] = useState(false);

  const canvasTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Formatting helper for Bold, Italic, Underline, List, and Code
  const applyFormat = (formatType: "bold" | "italic" | "underline" | "list" | "code") => {
    const textarea = canvasTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = draftResult.substring(start, end);

    let prefix = "";
    let suffix = "";
    let placeholder = "";

    switch (formatType) {
      case "bold":
        prefix = "**";
        suffix = "**";
        placeholder = "bold text";
        break;
      case "italic":
        prefix = "*";
        suffix = "*";
        placeholder = "italic text";
        break;
      case "underline":
        prefix = "<u>";
        suffix = "</u>";
        placeholder = "underlined text";
        break;
      case "list":
        prefix = "\n- ";
        suffix = "";
        placeholder = "List item";
        break;
      case "code":
        prefix = "`";
        suffix = "`";
        placeholder = "code";
        break;
    }

    const textToWrap = selectedText || placeholder;
    const replacement = `${prefix}${textToWrap}${suffix}`;

    const updatedText = draftResult.substring(0, start) + replacement + draftResult.substring(end);
    setDraftResult(updatedText);

    // Re-focus and set selection range
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start, start + replacement.length);
      } else {
        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length + placeholder.length
        );
      }
    }, 10);
  };

  // Auto-save state tracking
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Keep fresh references for interval save
  const stateRef = useRef({ prompt, draftResult, selectedType, selectedTone, selectedAudience });
  useEffect(() => {
    stateRef.current = { prompt, draftResult, selectedType, selectedTone, selectedAudience };
  }, [prompt, draftResult, selectedType, selectedTone, selectedAudience]);

  // 1. Load saved draft from localStorage on initial render
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed) {
          if (typeof parsed.prompt === "string") setPrompt(parsed.prompt);
          if (typeof parsed.draftResult === "string") setDraftResult(parsed.draftResult);
          if (parsed.selectedType) setSelectedType(parsed.selectedType);
          if (parsed.selectedTone) setSelectedTone(parsed.selectedTone);
          if (parsed.selectedAudience) setSelectedAudience(parsed.selectedAudience);
          if (parsed.lastSavedAt) setLastSavedAt(parsed.lastSavedAt);
          setSaveStatus("saved");
        }
      }
    } catch (err) {
      console.warn("Could not parse saved Writing Canvas draft from localStorage:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Function to save current state to localStorage
  const performAutoSave = () => {
    const current = stateRef.current;
    if (!current.prompt.trim() && !current.draftResult.trim()) return;

    try {
      setSaveStatus("saving");
      const timestamp = Date.now();
      const payload = {
        prompt: current.prompt,
        draftResult: current.draftResult,
        selectedType: current.selectedType,
        selectedTone: current.selectedTone,
        selectedAudience: current.selectedAudience,
        lastSavedAt: timestamp,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setLastSavedAt(timestamp);
      setSaveStatus("saved");
    } catch (err) {
      console.error("Auto-save to localStorage failed:", err);
      setSaveStatus("idle");
    }
  };

  // 2. Setup 5-second interval timer for auto-saving
  useEffect(() => {
    if (!isLoaded) return;

    const intervalId = setInterval(() => {
      performAutoSave();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isLoaded]);

  // Clear draft from state and localStorage
  const handleClearDraft = () => {
    if (window.confirm("Are you sure you want to clear your draft and reset the canvas?")) {
      setPrompt("");
      setDraftResult("");
      localStorage.removeItem(STORAGE_KEY);
      setLastSavedAt(null);
      setSaveStatus("idle");
    }
  };

  const handleCopy = () => {
    if (draftResult) {
      navigator.clipboard.writeText(draftResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    try {
      const docTypeLabel = DOCUMENT_TYPES.find((d) => d.id === selectedType)?.label || selectedType;
      const toneLabel = TONES.find((t) => t.id === selectedTone)?.label || selectedTone;
      const audienceLabel = AUDIENCES.find((a) => a.id === selectedAudience)?.label || selectedAudience;

      const response = await onDraftDocument({
        prompt,
        documentType: docTypeLabel,
        tone: toneLabel,
        targetAudience: audienceLabel,
      });
      setDraftResult(response);

      // Immediately save newly generated document to localStorage
      try {
        const timestamp = Date.now();
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            prompt,
            draftResult: response,
            selectedType,
            selectedTone,
            selectedAudience,
            lastSavedAt: timestamp,
          })
        );
        setLastSavedAt(timestamp);
        setSaveStatus("saved");
      } catch (err) {
        console.error("Immediate save failed:", err);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Word and character counts for draft
  const wordCount = draftResult.trim() ? draftResult.trim().split(/\s+/).length : 0;
  const charCount = draftResult.length;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 p-4 md:p-6">
      {/* Top Back Navigation Toolbar & Auto-Save Status */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs gap-3">
        <div className="flex items-center gap-2">
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
            <span className="text-xs font-mono font-bold text-slate-400">Writing Canvas</span>
          )}
        </div>

        {/* Auto-Save Status Indicator & Clear Control */}
        <div className="flex items-center justify-between sm:justify-end gap-3.5">
          <div className="flex items-center gap-2">
            {saveStatus === "saving" ? (
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-500 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Saving draft...</span>
              </span>
            ) : lastSavedAt ? (
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  Auto-saved {new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Auto-save every 5s</span>
              </span>
            )}
          </div>

          {(prompt || draftResult) && (
            <button
              type="button"
              onClick={handleClearDraft}
              className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
              title="Clear current draft and start fresh"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <span className="text-[10px] font-mono tracking-widest text-cyan-500 uppercase font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            Writing Assistant
          </span>
        </div>
      </div>

      {/* Title block */}
      <div className="bento-card rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <span className="text-xs font-mono tracking-widest text-[#00e5ff] uppercase font-bold neon-text-glow">
          Writing Engine
        </span>
        <h2 className="text-2xl font-bold font-display text-slate-950 dark:text-white mt-1">Advanced Copywriting Assistant</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Generate publication-ready business drafts, technical PRDs, user stories, investor pitches, and marketing copy. Your progress auto-saves locally every 5 seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Settings panel - Left */}
        <form onSubmit={handleDraft} className="md:col-span-5 space-y-5">
          {/* Doc type selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 font-mono tracking-wider">
              Document Format
            </label>
            <div className="space-y-1.5">
              {DOCUMENT_TYPES.map((doc) => {
                const Icon = doc.icon;
                const isSelected = selectedType === doc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedType(doc.id)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-50 dark:bg-slate-800/80 border-cyan-400 text-slate-950 dark:text-white font-semibold"
                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? "text-[#00e5ff]" : "text-slate-400"}`} />
                    {doc.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 font-mono tracking-wider block">
              Tone Style
            </label>
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
            >
              {TONES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Audience Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 font-mono tracking-wider block">
              Target Audience
            </label>
            <select
              value={selectedAudience}
              onChange={(e) => setSelectedAudience(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
            >
              {AUDIENCES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          {/* Prompt Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-slate-400 font-mono tracking-wider block">
                Core Concept & Guidelines
              </label>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A decentralised physical hardware network (DePIN) for sharing agricultural weather sensor data..."
              rows={4}
              className="w-full p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-400 font-sans resize-none placeholder-slate-400 leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={isDrafting || !prompt.trim()}
            className="w-full py-3 bg-[#00e5ff] text-slate-950 font-bold font-display text-xs rounded-xl hover:bg-[#00b0ff] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.4)] disabled:opacity-50 cursor-pointer"
          >
            {isDrafting ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Synthesizing...
              </span>
            ) : (
              <>
                Draft Document
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Output pane - Right */}
        <div className="md:col-span-7 flex flex-col min-h-[380px] bento-card rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 justify-between">
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                  Editable Canvas Output
                </span>
                {draftResult && (
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {wordCount} words · {charCount} chars
                  </span>
                )}
              </div>
              {draftResult && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded border border-slate-100 dark:border-slate-700 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold font-mono">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="font-mono">Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {draftResult || prompt ? (
              <div className="flex-1 flex flex-col">
                {/* Formatting Toolbar */}
                <div className="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60 mb-2">
                  <span className="text-[10px] font-mono font-semibold text-slate-400 px-2 uppercase tracking-wider">Format:</span>
                  <button
                    type="button"
                    onClick={() => applyFormat("bold")}
                    className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-cyan-500 rounded font-bold transition-colors cursor-pointer"
                    title="Bold (**text**)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("italic")}
                    className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-cyan-500 rounded transition-colors cursor-pointer"
                    title="Italic (*text*)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("underline")}
                    className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-cyan-500 rounded transition-colors cursor-pointer"
                    title="Underline (<u>text</u>)"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-px h-3.5 bg-slate-300 dark:bg-slate-700 mx-1" />
                  <button
                    type="button"
                    onClick={() => applyFormat("list")}
                    className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-cyan-500 rounded transition-colors cursor-pointer"
                    title="Bullet List (- item)"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("code")}
                    className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-cyan-500 rounded transition-colors cursor-pointer"
                    title="Inline Code (`code`)"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                </div>

                <textarea
                  ref={canvasTextareaRef}
                  value={draftResult}
                  onChange={(e) => setDraftResult(e.target.value)}
                  placeholder="Your generated document draft will appear here. You can also edit or write directly on this canvas..."
                  className="w-full flex-1 min-h-[300px] p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-800 dark:text-slate-100 font-sans leading-relaxed focus:outline-none focus:border-cyan-400/60 resize-none"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-950/50 rounded-lg border border-dashed border-slate-100 dark:border-slate-800">
                <PenTool className="w-8 h-8 text-slate-300 dark:text-slate-700 animate-pulse mb-2.5" />
                <p className="text-xs text-slate-400 font-medium font-sans">
                  Choose your configurations and press "Draft Document" or start typing in guidelines to write. Your canvas auto-saves every 5 seconds!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

