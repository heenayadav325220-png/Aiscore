import React, { useState } from "react";
import { PenTool, Copy, Check, Sparkles, FileText, ArrowRight, BookOpen } from "lucide-react";

interface WritingAssistantProps {
  onDraftDocument: (payload: {
    prompt: string;
    documentType: string;
    tone: string;
    targetAudience: string;
  }) => Promise<string>;
  isDrafting: boolean;
}

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

export default function WritingAssistant({ onDraftDocument, isDrafting }: WritingAssistantProps) {
  const [selectedType, setSelectedType] = useState("pitch");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [selectedAudience, setSelectedAudience] = useState("general");
  const [prompt, setPrompt] = useState("");
  const [draftResult, setDraftResult] = useState("");
  const [copied, setCopied] = useState(false);

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
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 p-4 md:p-6">
      {/* Title block */}
      <div className="bento-card rounded-2xl p-6 bg-white relative overflow-hidden">
        <span className="text-xs font-mono tracking-widest text-[#00e5ff] uppercase font-bold neon-text-glow">
          Writing Engine
        </span>
        <h2 className="text-2xl font-bold font-display text-slate-950 mt-1">Advanced Copywriting Assistant</h2>
        <p className="text-sm text-slate-500 mt-2">
          Generate publication-ready business drafts, technical product requirements (PRDs), agile user stories, persuasive investor pitches, and marketing copy.
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
                        ? "bg-slate-50 border-cyan-400 text-slate-950 font-semibold"
                        : "bg-white border-slate-100 hover:border-slate-200 text-slate-600"
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
              className="w-full p-2.5 rounded-lg border border-slate-100 text-xs bg-white text-slate-700 focus:outline-none focus:border-cyan-400 font-sans"
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
              className="w-full p-2.5 rounded-lg border border-slate-100 text-xs bg-white text-slate-700 focus:outline-none focus:border-cyan-400 font-sans"
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
            <label className="text-xs font-bold uppercase text-slate-400 font-mono tracking-wider block">
              Core Concept & Guidelines
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A decentralised physical hardware network (DePIN) for sharing agricultural weather sensor data..."
              rows={4}
              className="w-full p-3 rounded-lg border border-slate-100 text-xs focus:outline-none focus:border-cyan-400 font-sans resize-none placeholder-slate-400 leading-relaxed"
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
        <div className="md:col-span-7 flex flex-col min-h-[380px] bento-card rounded-xl p-5 bg-white justify-between">
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 mb-4">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                Generated Draft Output
              </span>
              {draftResult && (
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 rounded border border-slate-100 cursor-pointer"
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

            {draftResult ? (
              <div className="flex-1 text-xs text-slate-700 overflow-y-auto leading-relaxed font-sans prose max-h-[340px] whitespace-pre-wrap">
                {draftResult}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-lg border border-dashed border-slate-100">
                <PenTool className="w-8 h-8 text-slate-300 animate-pulse mb-2.5" />
                <p className="text-xs text-slate-400 font-medium font-sans">
                  Choose your configurations and press "Draft Document" to begin drafting.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
