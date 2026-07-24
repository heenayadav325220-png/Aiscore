import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  User,
  Lightbulb,
  Cpu,
  Sliders,
  Sparkles,
  MessageSquare,
  ChevronRight,
  Settings,
  Plus,
  Compass,
  CheckCircle,
  Volume2,
  Check,
  Zap,
  TrendingUp,
  Target,
  Infinity,
  Shield,
  Tag,
  Filter,
  Search,
  Hash
} from "lucide-react";
import { UIMode, IdeaEvaluation, CustomInstructions, ThemeSettings, ChatSession } from "../types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  // State variables and handlers passed from main application
  activeMode: UIMode;
  onChangeMode: (mode: UIMode) => void;
  ideas: IdeaEvaluation[];
  onSelectIdea: (idea: IdeaEvaluation) => void;
  customInstructions: CustomInstructions;
  onSaveInstructions: (inst: CustomInstructions) => void;
  themeSettings: ThemeSettings;
  onSaveTheme: (theme: ThemeSettings) => void;
  chatSessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  userEmail: string;
  onUpdateSessionTags?: (sessionId: string, tags: string[]) => void;
  onOpenAutoNameSelector?: (sessionId: string) => void;
}

type SidebarSubTab = "menu" | "profile" | "ideas" | "instructions" | "modes" | "themes" | "chats" | "xfactor";

export default function Sidebar({
  isOpen,
  onClose,
  activeMode,
  onChangeMode,
  ideas,
  onSelectIdea,
  customInstructions,
  onSaveInstructions,
  themeSettings,
  onSaveTheme,
  chatSessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  userEmail,
  onUpdateSessionTags,
  onOpenAutoNameSelector,
}: SidebarProps) {
  const [activeSubTab, setActiveSubTab] = useState<SidebarSubTab>("menu");

  // Tag Filtering & Editing States
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [editingTagsSessionId, setEditingTagsSessionId] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState<string>("");
  const [tagSearchQuery, setTagSearchQuery] = useState<string>("");

  // Form states
  const [instructionsForm, setInstructionsForm] = useState<CustomInstructions>({ ...customInstructions });
  const [themeForm, setThemeForm] = useState<ThemeSettings>({ ...themeSettings });

  // X-Factor States
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>("");
  const [customIdeaText, setCustomIdeaText] = useState<string>("");
  const [xfactorResult, setXfactorResult] = useState<{
    title: string;
    unfairAdvantage: string;
    growthLoop: string;
    magicRetentionFeature: string;
    marketPositioningEdge: string;
    strategicTriggers: string[];
  } | null>(() => {
    const cached = localStorage.getItem("core_ai_xfactor");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoadingXFactor, setIsLoadingXFactor] = useState<boolean>(false);
  const [xfactorError, setXfactorError] = useState<string | null>(null);
  const [copiedXFactor, setCopiedXFactor] = useState<boolean>(false);

  // Auto-fill selected idea ID when ideas are loaded
  useEffect(() => {
    if (ideas.length > 0 && !selectedIdeaId) {
      setSelectedIdeaId(ideas[0].id);
    }
  }, [ideas, selectedIdeaId]);

  useEffect(() => {
    setInstructionsForm({ ...customInstructions });
  }, [customInstructions]);

  useEffect(() => {
    setThemeForm({ ...themeSettings });
  }, [themeSettings]);

  const handleSaveInstructions = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveInstructions(instructionsForm);
    setActiveSubTab("menu");
  };

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTheme(themeForm);
    setActiveSubTab("menu");
  };

  const handleGenerateXFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingXFactor(true);
    setXfactorError(null);

    let targetIdeaText = "";
    if (selectedIdeaId === "custom") {
      targetIdeaText = customIdeaText;
    } else {
      const selectedIdea = ideas.find((i) => i.id === selectedIdeaId);
      targetIdeaText = selectedIdea ? `${selectedIdea.title}: ${selectedIdea.idea}` : customIdeaText;
    }

    if (!targetIdeaText.trim()) {
      setXfactorError("Please select an idea or enter custom concept text first.");
      setIsLoadingXFactor(false);
      return;
    }

    try {
      const response = await fetch("/api/generate-xfactor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: targetIdeaText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate X-Factor.");
      }

      const data = await response.json();
      setXfactorResult(data);
      localStorage.setItem("core_ai_xfactor", JSON.stringify(data));
    } catch (err: any) {
      console.error(err);
      setXfactorError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoadingXFactor(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950 z-40 cursor-pointer"
          />

          {/* Drawer - responsive width on mobile (<768px) */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-0 left-0 w-[88vw] sm:w-[380px] md:w-[420px] max-w-[calc(100vw-1.5rem)] sm:max-w-[420px] bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 shadow-2xl z-50 flex flex-col justify-between text-slate-800 dark:text-slate-100"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 font-display leading-tight truncate">
                    {userEmail ? userEmail.split("@")[0] : "Core User"}
                  </h4>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-mono">ASCEND STUDY Member</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Panel Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeSubTab === "menu" && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono tracking-widest text-slate-400 dark:text-slate-500 uppercase font-bold px-1.5 block mb-2">
                    CORE NAVIGATION
                  </span>

                  {/* Profile Option */}
                  <button
                    onClick={() => setActiveSubTab("profile")}
                    className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 group-hover:text-[#00e5ff] transition-colors">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">My Profile</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Preferences & member logs</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />
                  </button>

                   {/* Ideas Option */}
                  <button
                    onClick={() => setActiveSubTab("ideas")}
                    className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 group-hover:text-[#00e5ff] transition-colors">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Ideas Hub</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Analyzed ideas & wireframes ({ideas.length})</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />
                  </button>

                  {/* X-Factor Strategic Catalyst */}
                  <button
                    onClick={() => setActiveSubTab("xfactor")}
                    className="w-full text-left p-3 rounded-xl hover:bg-cyan-50/10 dark:hover:bg-cyan-950/30 hover:border-cyan-200/50 border border-transparent transition-all flex items-center justify-between group cursor-pointer bg-cyan-50/10 dark:bg-cyan-950/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-50 dark:bg-cyan-950 rounded-lg text-cyan-500 dark:text-cyan-400 group-hover:text-[#00e5ff] transition-colors">
                        <Zap className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">X-Factor Catalyst</h4>
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-200 uppercase tracking-wider">New</span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-sans font-medium">Unlock non-obvious unfair advantages</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />
                  </button>

                  {/* Custom Instructions */}
                  <button
                    onClick={() => setActiveSubTab("instructions")}
                    className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 group-hover:text-[#00e5ff] transition-colors">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Custom Instructions</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Define persona, rules, & guidelines</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />
                  </button>

                  {/* UI Modes */}
                  <button
                    onClick={() => setActiveSubTab("modes")}
                    className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 group-hover:text-[#00e5ff] transition-colors">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Operational Modes</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Active mode: Mode {activeMode}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />
                  </button>

                  {/* Themes */}
                  <button
                    onClick={() => setActiveSubTab("themes")}
                    className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 group-hover:text-[#00e5ff] transition-colors">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Themes & Accents</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Custom colors & glow parameters</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />
                  </button>

                  {/* Active Chats history */}
                  <button
                    onClick={() => setActiveSubTab("chats")}
                    className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg text-slate-500 group-hover:text-[#00e5ff] transition-colors">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Chat Threads</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Browse active sessions ({chatSessions.length})</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </button>
                </div>
              )}

              {/* Sub-panels */}
              {activeSubTab === "profile" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <button onClick={() => setActiveSubTab("menu")} className="text-xs text-[#00e5ff] font-bold cursor-pointer">← Back</button>
                    <h3 className="text-sm font-bold font-display text-slate-800">My Profile</h3>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-400 block">EMAIL ADDRESS</span>
                      <span className="text-xs font-semibold text-slate-700 block truncate">{userEmail || "Not logged in"}</span>
                    </div>
                    <div className="space-y-1 border-t border-slate-200/50 pt-2.5">
                      <span className="text-[9px] font-mono text-slate-400 block">ACCOUNT STANDING</span>
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                        ACTIVE MEMBER
                      </span>
                    </div>
                    <div className="space-y-1 border-t border-slate-200/50 pt-2.5">
                      <span className="text-[9px] font-mono text-slate-400 block">ANALYSED CONCEPTS</span>
                      <span className="text-xs font-bold text-slate-800 block">{ideas.length} Ideas logged</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Ideas Panel */}
              {activeSubTab === "ideas" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <button onClick={() => setActiveSubTab("menu")} className="text-xs text-[#00e5ff] font-bold cursor-pointer">← Back</button>
                    <h3 className="text-sm font-bold font-display text-slate-800">Ideas Archive</h3>
                  </div>
                  {ideas.length === 0 ? (
                    <div className="text-center p-6 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                      <Lightbulb className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-400 font-sans font-medium">No ideas evaluated yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {ideas.map((idea) => (
                        <div
                          key={idea.id}
                          onClick={() => {
                            onSelectIdea(idea);
                            onClose();
                          }}
                          className="p-3 bg-white border border-slate-100 rounded-xl hover:border-cyan-300 transition-colors cursor-pointer flex justify-between items-start"
                        >
                          <div className="max-w-[80%]">
                            <h4 className="text-xs font-bold text-slate-800 leading-snug truncate">{idea.title}</h4>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{idea.idea}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[11px] font-mono font-extrabold text-cyan-600">{idea.overallScore}</span>
                            {idea.approved ? (
                              <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">APP</span>
                            ) : (
                              <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100">REJ</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Custom Instructions Form */}
              {activeSubTab === "instructions" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <button onClick={() => setActiveSubTab("menu")} className="text-xs text-[#00e5ff] font-bold cursor-pointer">← Back</button>
                    <h3 className="text-sm font-bold font-display text-slate-800">Persona Guidelines</h3>
                  </div>
                  <form onSubmit={handleSaveInstructions} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Target Domain</label>
                      <input
                        type="text"
                        value={instructionsForm.targetDomain}
                        onChange={(e) => setInstructionsForm({ ...instructionsForm, targetDomain: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-100 text-xs text-slate-700 bg-white focus:outline-none focus:border-cyan-400"
                        placeholder="e.g. Fintech, Healthcare, Web3, DePIN"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Personality Style</label>
                      <select
                        value={instructionsForm.personalityStyle}
                        onChange={(e) => setInstructionsForm({ ...instructionsForm, personalityStyle: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-100 text-xs text-slate-700 bg-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="objective">Highly Critical & Objective</option>
                        <option value="enthusiastic">Enthusiastic & Supportive</option>
                        <option value="academic">Scientific & Academic</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Coding Preferences</label>
                      <input
                        type="text"
                        value={instructionsForm.codePreference}
                        onChange={(e) => setInstructionsForm({ ...instructionsForm, codePreference: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-100 text-xs text-slate-700 bg-white focus:outline-none focus:border-cyan-400"
                        placeholder="e.g. React 19, Tailwind v4, Rust"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Save Rules
                    </button>
                  </form>
                </div>
              )}

              {/* Operational Modes Tab */}
              {activeSubTab === "modes" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <button onClick={() => setActiveSubTab("menu")} className="text-xs text-[#00e5ff] font-bold cursor-pointer">← Back</button>
                    <h3 className="text-sm font-bold font-display text-slate-800">Operational Modes</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        id: "guider" as UIMode,
                        label: "Guider Mode",
                        description: "CTO behavior, structured milestone maps, robotic voice option.",
                      },
                      {
                        id: "companion" as UIMode,
                        label: "Friend/Companion Mode",
                        description: "Brainstorm partner, friendly conversations, human-like voice.",
                      },
                      {
                        id: "automatic" as UIMode,
                        label: "Automatic Mode",
                        description: "Adapt behavior and voice dynamics dynamically depending on input context.",
                      },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => {
                          onChangeMode(mode.id);
                        }}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                          activeMode === mode.id
                            ? "bg-slate-50 border-cyan-400 text-slate-900 font-bold"
                            : "bg-white border-slate-100 hover:border-slate-200 text-slate-500"
                        }`}
                      >
                        <span className="block font-bold mb-0.5">{mode.label}</span>
                        <span className="block text-[10px] text-slate-400 leading-normal font-medium">{mode.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Themes Tab */}
              {activeSubTab === "themes" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <button onClick={() => setActiveSubTab("menu")} className="text-xs text-[#00e5ff] font-bold cursor-pointer">← Back</button>
                    <h3 className="text-sm font-bold font-display text-slate-800">Customise Theme</h3>
                  </div>
                  <form onSubmit={handleSaveTheme} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Neon Glow Power</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["soft", "vibrant", "extreme"].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setThemeForm({ ...themeForm, neonGlowStrength: lvl as any })}
                            className={`p-2 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              themeForm.neonGlowStrength === lvl
                                ? "bg-slate-50 border-cyan-400 text-slate-900"
                                : "bg-white border-slate-100 text-slate-400"
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Predefined Accent Color Palette */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        Quick Preset Palette
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { name: "Cyan", value: "#00e5ff" },
                          { name: "Pink", value: "#ff007f" },
                          { name: "Green", value: "#39ff14" },
                          { name: "Purple", value: "#bd00ff" },
                          { name: "Amber", value: "#ff5e00" },
                          { name: "Gold", value: "#ffd700" },
                          { name: "Rose", value: "#ff1493" },
                          { name: "Mint", value: "#00ff87" },
                        ].map((color) => {
                          const isSelected = themeForm.accentColor.toLowerCase() === color.value.toLowerCase();
                          return (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => setThemeForm({ ...themeForm, accentColor: color.value })}
                              className={`h-9 rounded-xl border flex items-center justify-center relative cursor-pointer hover:scale-105 transition-transform ${
                                isSelected ? "border-slate-800 ring-2 ring-slate-100" : "border-slate-150"
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            >
                              {isSelected && (
                                <span className="p-0.5 bg-black/35 rounded-full backdrop-blur-xs flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Fine-Tuning controls */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        Fine-Tune Accent
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeForm.accentColor}
                          onChange={(e) => setThemeForm({ ...themeForm, accentColor: e.target.value })}
                          className="w-12 h-9 p-0.5 rounded-lg border border-slate-200 bg-white cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={themeForm.accentColor.toUpperCase()}
                          onChange={(e) => setThemeForm({ ...themeForm, accentColor: e.target.value })}
                          className="flex-1 p-2 border border-slate-150 rounded-lg text-xs font-mono text-slate-700 bg-white focus:outline-none focus:border-cyan-400 uppercase"
                          placeholder="#00E5FF"
                          maxLength={7}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Apply Colors & Glows
                    </button>
                  </form>
                </div>
              )}

              {/* X-Factor Strategic Catalyst */}
              {activeSubTab === "xfactor" && (
                <div className="space-y-4 font-sans text-slate-800">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <button onClick={() => setActiveSubTab("menu")} className="text-xs text-cyan-500 font-bold cursor-pointer">← Back</button>
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-cyan-500 fill-cyan-500/10" />
                      <h3 className="text-sm font-bold font-display text-slate-800">X-Factor Catalyst</h3>
                    </div>
                  </div>

                  {!xfactorResult ? (
                    <form onSubmit={handleGenerateXFactor} className="space-y-4">
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        Engineer a high-conviction, non-obvious unfair advantage and viral growth engine for your concept.
                      </p>

                      {ideas.length > 0 ? (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Select Analyzed Idea</label>
                          <select
                            value={selectedIdeaId}
                            onChange={(e) => setSelectedIdeaId(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-100 text-xs text-slate-700 bg-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 cursor-pointer"
                          >
                            {ideas.map((i) => (
                              <option key={i.id} value={i.id}>
                                {i.title} ({i.overallScore} pts)
                              </option>
                            ))}
                            <option value="custom">-- Enter a Custom Concept --</option>
                          </select>
                        </div>
                      ) : null}

                      {(ideas.length === 0 || selectedIdeaId === "custom") && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Custom Concept Details</label>
                          <textarea
                            value={customIdeaText}
                            onChange={(e) => setCustomIdeaText(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-100 text-xs text-slate-700 bg-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 min-h-[90px]"
                            placeholder="Describe your startup, audience, or project idea in a sentence or two..."
                            required
                          />
                        </div>
                      )}

                      {xfactorError && (
                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-600 font-medium">
                          ⚠️ {xfactorError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoadingXFactor}
                        className={`w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-slate-900/10 ${
                          isLoadingXFactor ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                      >
                        {isLoadingXFactor ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Engineering Moat...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
                            <span>Catalyze Unfair Advantage</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      {/* Premium Neon Accent Card */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,229,255,0.15)] text-white space-y-4">
                        <div>
                          <span className="text-[8px] font-mono font-bold tracking-widest text-cyan-400 block uppercase">ENGINEERED BLUEPRINT</span>
                          <h4 className="text-xs font-bold font-display text-[#00e5ff] mt-0.5">{xfactorResult.title}</h4>
                        </div>

                        {/* Unfair Advantage */}
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-[9px] font-mono font-extrabold text-cyan-400 uppercase tracking-wider">Unfair Moat Advantage</span>
                          </div>
                          <p className="text-[10px] text-slate-300 leading-relaxed pl-5 font-medium font-sans">
                            {xfactorResult.unfairAdvantage}
                          </p>
                        </div>

                        {/* Growth Loop */}
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-1.5">
                            <Infinity className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-[9px] font-mono font-extrabold text-cyan-400 uppercase tracking-wider">Growth Flywheel Loop</span>
                          </div>
                          <p className="text-[10px] text-slate-300 leading-relaxed pl-5 font-medium font-sans">
                            {xfactorResult.growthLoop}
                          </p>
                        </div>

                        {/* Magic Feature */}
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-[9px] font-mono font-extrabold text-cyan-400 uppercase tracking-wider">The Magic Stick Feature</span>
                          </div>
                          <p className="text-[10px] text-slate-300 leading-relaxed pl-5 font-medium font-sans">
                            {xfactorResult.magicRetentionFeature}
                          </p>
                        </div>

                        {/* Market Positioning Edge */}
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-[9px] font-mono font-extrabold text-cyan-400 uppercase tracking-wider">Market Disruption Edge</span>
                          </div>
                          <p className="text-[10px] text-slate-300 leading-relaxed pl-5 font-medium font-sans">
                            {xfactorResult.marketPositioningEdge}
                          </p>
                        </div>

                        {/* Strategic Triggers */}
                        <div className="space-y-1.5 pt-2.5 border-t border-slate-800 text-left">
                          <span className="text-[8px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block mb-1">STRATEGIC TRIGGER ACTION STEPS</span>
                          <div className="space-y-1.5">
                            {xfactorResult.strategicTriggers.map((trigger, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-[9.5px] text-slate-300 font-medium leading-relaxed">
                                <span className="w-4 h-4 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 font-bold font-mono text-[8.5px] mt-0.5">
                                  {idx + 1}
                                </span>
                                <span>{trigger}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setXfactorResult(null);
                            localStorage.removeItem("core_ai_xfactor");
                          }}
                          className="py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-[10px] text-slate-600 font-bold bg-white text-center cursor-pointer transition-colors"
                        >
                          Catalyze Another
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const markdown = `### X-Factor Blueprint: ${xfactorResult.title}\n\n**🛡️ Unfair Moat:** ${xfactorResult.unfairAdvantage}\n\n**♾️ Growth Loop:** ${xfactorResult.growthLoop}\n\n**✨ Magic Feature:** ${xfactorResult.magicRetentionFeature}\n\n**🎯 Disruption Edge:** ${xfactorResult.marketPositioningEdge}\n\n**🚀 Action Steps:**\n${xfactorResult.strategicTriggers.map((t, i) => `${i + 1}. ${t}`).join("\n")}`;
                            navigator.clipboard.writeText(markdown).then(() => {
                              setCopiedXFactor(true);
                              setTimeout(() => setCopiedXFactor(false), 2000);
                            });
                          }}
                          className="py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold text-center cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                        >
                          {copiedXFactor ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copy Blueprint</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Active chats */}
              {activeSubTab === "chats" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setActiveSubTab("menu")} className="text-xs text-[#00e5ff] font-bold cursor-pointer">← Back</button>
                      <h3 className="text-sm font-bold font-display text-slate-800 dark:text-slate-100">Chat History</h3>
                    </div>
                    <button
                      onClick={() => {
                        onNewSession();
                        onClose();
                      }}
                      className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/80 hover:bg-cyan-100 dark:hover:bg-cyan-900 text-cyan-600 dark:text-cyan-400 transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      NEW
                    </button>
                  </div>

                  {/* Search and Tag Filter Bar */}
                  <div className="space-y-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    {/* Search box */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={tagSearchQuery}
                        onChange={(e) => setTagSearchQuery(e.target.value)}
                        placeholder="Search chats or tags..."
                        className="w-full pl-8 pr-7 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                      />
                      {tagSearchQuery && (
                        <button
                          onClick={() => setTagSearchQuery("")}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                      <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase shrink-0 flex items-center gap-1">
                        <Filter className="w-3 h-3 text-cyan-500" />
                        Tags:
                      </span>

                      {/* All Pill */}
                      <button
                        onClick={() => setSelectedTagFilter(null)}
                        className={`px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer shrink-0 ${
                          selectedTagFilter === null
                            ? "bg-cyan-500 text-slate-950 shadow-xs font-extrabold"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        All ({chatSessions.length})
                      </button>

                      {/* Unique Tags */}
                      {Array.from(new Set(chatSessions.flatMap((s) => s.tags || []))).sort().map((tag) => {
                        const count = chatSessions.filter((s) => s.tags?.includes(tag)).length;
                        const isSelected = selectedTagFilter === tag;
                        return (
                          <button
                            key={tag}
                            onClick={() => setSelectedTagFilter(isSelected ? null : tag)}
                            className={`px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                              isSelected
                                ? "bg-cyan-500 text-slate-950 shadow-xs font-extrabold"
                                : "bg-cyan-50/80 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60 hover:bg-cyan-100 dark:hover:bg-cyan-900"
                            }`}
                          >
                            <Tag className="w-2.5 h-2.5" />
                            <span>{tag}</span>
                            <span className="opacity-75 text-[9px]">({count})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Filtered Sessions List */}
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-0.5">
                    {chatSessions
                      .filter((s) => {
                        const matchesTag = selectedTagFilter ? s.tags?.includes(selectedTagFilter) : true;
                        const matchesSearch = tagSearchQuery.trim()
                          ? s.title.toLowerCase().includes(tagSearchQuery.toLowerCase()) ||
                            s.tags?.some((t) => t.toLowerCase().includes(tagSearchQuery.toLowerCase()))
                          : true;
                        return matchesTag && matchesSearch;
                      })
                      .map((sess) => {
                        const isEditingThisSession = editingTagsSessionId === sess.id;
                        const tags = sess.tags || [];

                        return (
                          <div
                            key={sess.id}
                            className={`p-3 rounded-xl border transition-all ${
                              activeSessionId === sess.id
                                ? "bg-slate-50 dark:bg-slate-800/80 border-cyan-400 shadow-xs"
                                : "bg-white dark:bg-slate-900/90 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div
                                onClick={() => {
                                  onSelectSession(sess.id);
                                  onClose();
                                }}
                                className="flex-1 cursor-pointer min-w-0"
                              >
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate leading-snug">
                                  {sess.title}
                                </h4>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono block mt-0.5 uppercase">
                                  Mode: {sess.activeMode} • {sess.messages.length} msgs
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {onOpenAutoNameSelector && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenAutoNameSelector(sess.id);
                                      onClose();
                                    }}
                                    className="p-1 rounded-lg text-[10px] font-bold flex items-center gap-0.5 bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900 border border-cyan-300/40 dark:border-cyan-800/40 transition-all cursor-pointer hover:scale-105"
                                    title="Auto Chat Name Selector"
                                  >
                                    <Sparkles className="w-3 h-3 text-cyan-500 animate-pulse" />
                                    <span className="text-[9px] font-mono">Auto Name</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTagsSessionId(isEditingThisSession ? null : sess.id);
                                    setNewTagInput("");
                                  }}
                                  className={`p-1 rounded-lg text-[10px] font-bold flex items-center gap-0.5 transition-colors cursor-pointer ${
                                    isEditingThisSession
                                      ? "bg-cyan-500 text-slate-950"
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-cyan-500"
                                  }`}
                                  title="Manage tags"
                                >
                                  <Tag className="w-3 h-3" />
                                  <span className="text-[9px] font-mono">+Tag</span>
                                </button>
                                <ChevronRight
                                  onClick={() => {
                                    onSelectSession(sess.id);
                                    onClose();
                                  }}
                                  className="w-4 h-4 text-slate-300 dark:text-slate-600 cursor-pointer"
                                />
                              </div>
                            </div>

                            {/* Render Session Tags Badges */}
                            {tags.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 mt-2 pt-2 border-t border-slate-100/80 dark:border-slate-800/80">
                                {tags.map((t) => (
                                  <span
                                    key={t}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTagFilter(selectedTagFilter === t ? null : t);
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/80 hover:scale-105 cursor-pointer transition-all"
                                  >
                                    <Tag className="w-2.5 h-2.5 text-cyan-500" />
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Inline Tag Manager Dropdown/Panel */}
                            {isEditingThisSession && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="mt-2.5 p-2.5 bg-slate-100/80 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                              >
                                <div className="flex items-center justify-between text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Tag className="w-3 h-3 text-cyan-500" />
                                    MANAGE SESSION TAGS
                                  </span>
                                  <button
                                    onClick={() => setEditingTagsSessionId(null)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Active tags list with delete buttons */}
                                {tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {tags.map((t) => (
                                      <span
                                        key={t}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                                      >
                                        {t}
                                        <button
                                          onClick={() => {
                                            if (onUpdateSessionTags) {
                                              onUpdateSessionTags(
                                                sess.id,
                                                tags.filter((tag) => tag !== t)
                                              );
                                            }
                                          }}
                                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                                        >
                                          <X className="w-2.5 h-2.5" />
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Add New Tag Input Form */}
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    if (newTagInput.trim() && onUpdateSessionTags) {
                                      const trimmed = newTagInput.trim();
                                      if (!tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
                                        onUpdateSessionTags(sess.id, [...tags, trimmed]);
                                      }
                                      setNewTagInput("");
                                    }
                                  }}
                                  className="flex items-center gap-1.5"
                                >
                                  <input
                                    type="text"
                                    value={newTagInput}
                                    onChange={(e) => setNewTagInput(e.target.value)}
                                    placeholder="Enter new tag..."
                                    className="flex-1 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-400"
                                  />
                                  <button
                                    type="submit"
                                    className="px-2.5 py-1 bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 font-bold text-[10px] rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                                  >
                                    Add
                                  </button>
                                </form>

                                {/* Quick suggestion pills */}
                                <div className="space-y-1">
                                  <span className="text-[8px] font-mono text-slate-400 uppercase block">Quick Suggestions:</span>
                                  <div className="flex flex-wrap gap-1 text-[9px]">
                                    {["Strategy", "Tech", "Idea", "Priority", "Research", "Design"].map((sug) => (
                                      <button
                                        key={sug}
                                        type="button"
                                        onClick={() => {
                                          if (onUpdateSessionTags && !tags.some((t) => t.toLowerCase() === sug.toLowerCase())) {
                                            onUpdateSessionTags(sess.id, [...tags, sug]);
                                          }
                                        }}
                                        className={`px-1.5 py-0.5 rounded border text-[8.5px] font-medium cursor-pointer transition-colors ${
                                          tags.includes(sug)
                                            ? "bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 border-cyan-300"
                                            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-cyan-400"
                                        }`}
                                      >
                                        +{sug}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer option */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">© 2026 CORE AI ENGINE</span>
              <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded">v1.2.0</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
