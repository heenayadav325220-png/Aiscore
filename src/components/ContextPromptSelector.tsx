import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PenTool,
  Lightbulb,
  Palette,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Check,
  Wand2,
  X,
  Zap,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { UIMode } from "../types";

export type ContextViewType = "writer" | "evaluator" | "visuals" | "chat";

export interface ContextPromptOption {
  id: string;
  label: string;
  instruction: string;
  description: string;
  icon?: string;
}

export interface ContextPromptGroup {
  viewId: ContextViewType;
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  prompts: ContextPromptOption[];
}

interface ContextPromptSelectorProps {
  activeView: "chat" | "evaluator" | "visuals" | "writer";
  activeMode?: UIMode;
  onSelectPrompt: (instruction: string) => void;
  accentColor?: string;
  onSwitchView?: (view: "chat" | "evaluator" | "visuals" | "writer") => void;
}

const CORE_CONTEXT_GROUPS: ContextPromptGroup[] = [
  {
    viewId: "writer",
    title: "Writer Assistant",
    icon: <PenTool className="w-3.5 h-3.5" />,
    accentColor: "#3b82f6",
    prompts: [
      {
        id: "w_tone",
        label: "Improve Tone",
        instruction: "Rewrite and polish the following text to have a professional, engaging, and clear tone:\n\n",
        description: "Enhance readability and professional engagement",
        icon: "✨",
      },
      {
        id: "w_sum",
        label: "Summarize",
        instruction: "Provide a concise, structured executive summary with key takeaways for the following content:\n\n",
        description: "Extract essential bullet points and takeaways",
        icon: "📝",
      },
      {
        id: "w_expand",
        label: "Expand Content",
        instruction: "Elaborate in detail with deeper explanations, supporting evidence, and concrete examples for:\n\n",
        description: "Add depth, context, and detailed examples",
        icon: "🔍",
      },
      {
        id: "w_grammar",
        label: "Fix Grammar",
        instruction: "Proofread and correct all grammatical, syntax, and punctuation errors in the following text:\n\n",
        description: "Fix typos, awkward phrasing, and grammar",
        icon: "✅",
      },
      {
        id: "w_markdown",
        label: "Format Markdown",
        instruction: "Structure and format the following text into clean Markdown with clear headings and bullet points:\n\n",
        description: "Organize into clean headers and Markdown blocks",
        icon: "📊",
      },
    ],
  },
  {
    viewId: "evaluator",
    title: "Idea Evaluator",
    icon: <Lightbulb className="w-3.5 h-3.5" />,
    accentColor: "#f59e0b",
    prompts: [
      {
        id: "e_feasibility",
        label: "Assess Feasibility",
        instruction: "Evaluate the market viability, technical feasibility, and key execution risks for this concept:\n\n",
        description: "Score market demand, tech stack, and execution risks",
        icon: "🎯",
      },
      {
        id: "e_swot",
        label: "SWOT Matrix",
        instruction: "Generate a comprehensive SWOT (Strengths, Weaknesses, Opportunities, Threats) matrix analysis for:\n\n",
        description: "Analyze internal strengths & external threats",
        icon: "⚖️",
      },
      {
        id: "e_monetize",
        label: "Monetization Models",
        instruction: "Propose 3 high-margin monetization models and unit economics strategies for:\n\n",
        description: "Revenue strategies, pricing tiers & CAC/LTV",
        icon: "💰",
      },
      {
        id: "e_moat",
        label: "Competitive Moat",
        instruction: "Identify defensible network effects, competitive moats, and unique positioning strategies for:\n\n",
        description: "Uncover moat, barriers to entry & differentiation",
        icon: "🛡️",
      },
    ],
  },
  {
    viewId: "visuals",
    title: "Visuals Generator",
    icon: <Palette className="w-3.5 h-3.5" />,
    accentColor: "#ec4899",
    prompts: [
      {
        id: "v_dash",
        label: "Dashboard Wireframe",
        instruction: "Generate a detailed dark mode dashboard UI wireframe component layout breakdown for:\n\n",
        description: "Widget layout, metrics grid, and color palette",
        icon: "🎨",
      },
      {
        id: "v_logo",
        label: "Logo Concept",
        instruction: "Design a clean, minimalist vector logo concept and visual brand identity representation for:\n\n",
        description: "Iconography, typography pairing & color system",
        icon: "📐",
      },
      {
        id: "v_hero",
        label: "Product Mockup",
        instruction: "Describe a sleek, modern landing page hero section visual mockup for:\n\n",
        description: "Hero layout, CTA placements, and light effects",
        icon: "🖼️",
      },
    ],
  },
  {
    viewId: "chat",
    title: "Chat Console",
    icon: <MessageSquare className="w-3.5 h-3.5" />,
    accentColor: "#00e5ff",
    prompts: [
      {
        id: "ch_critique",
        label: "Critique & Review",
        instruction: "Critically review the following thesis or decision, identifying blindspots, counter-arguments, and edge cases:\n\n",
        description: "Identify blindspots, risks, and counter-arguments",
        icon: "⚖️",
      },
      {
        id: "ch_action",
        label: "Action Plan",
        instruction: "Convert this objective into a step-by-step 7-day action plan with clear milestones and deliverables:\n\n",
        description: "Milestones, deadlines & structured steps",
        icon: "🚀",
      },
      {
        id: "ch_brainstorm",
        label: "Brainstorm 5 Ideas",
        instruction: "Brainstorm 5 creative, non-obvious, and highly effective solutions for:\n\n",
        description: "Out-of-the-box creative problem solving",
        icon: "💡",
      },
    ],
  },
];

export const ContextPromptSelector: React.FC<ContextPromptSelectorProps> = ({
  activeView,
  onSelectPrompt,
  onSwitchView,
}) => {
  const getMatchingGroup = (view: string): ContextViewType => {
    if (view === "writer") return "writer";
    if (view === "evaluator") return "evaluator";
    if (view === "visuals") return "visuals";
    return "chat";
  };

  const [selectedContext, setSelectedContext] = useState<ContextViewType>(() =>
    getMatchingGroup(activeView)
  );

  // Default is false so it remains cleanly at the bottom without taking space
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Auto-hide system: hides dock bar if inactive for 2 seconds
  const [isBarVisible, setIsBarVisible] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsBarVisible(true);
    // Auto hide after 2 seconds (2000ms) of inactivity
    timerRef.current = setTimeout(() => {
      setIsBarVisible(false);
    }, 2000);
  }, []);

  useEffect(() => {
    setSelectedContext(getMatchingGroup(activeView));
    resetInactivityTimer();
  }, [activeView, resetInactivityTimer]);

  useEffect(() => {
    if (isOpen) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsBarVisible(true);
    } else {
      resetInactivityTimer();
    }
  }, [isOpen, resetInactivityTimer]);

  // Click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const currentGroup = CORE_CONTEXT_GROUPS.find((g) => g.viewId === selectedContext) || CORE_CONTEXT_GROUPS[0];

  const handlePromptClick = (prompt: ContextPromptOption) => {
    setSelectedPromptId(prompt.id);
    onSelectPrompt(prompt.instruction);

    setTimeout(() => {
      setSelectedPromptId(null);
      setIsOpen(false);
    }, 600);
  };

  const handleIconClick = (viewId: ContextViewType) => {
    setSelectedContext(viewId);
    if (onSwitchView) {
      onSwitchView(viewId);
    }
    // Pull up options if closed or switching view
    setIsOpen(true);
  };

  return (
    <div className="relative select-none z-30 flex justify-start" ref={popoverRef}>
      {/* Pulled-Up Side Drawer / Popover Menu (Appears above on the left corner when opened) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="absolute bottom-full mb-2 left-0 w-80 sm:w-96 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div
                  className="p-1 rounded-lg"
                  style={{
                    backgroundColor: `${currentGroup.accentColor}20`,
                    color: currentGroup.accentColor,
                  }}
                >
                  {currentGroup.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {currentGroup.title}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    Select quick prompt
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Collapse Prompts"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Prompt Options List */}
            <div className="space-y-1 max-h-56 overflow-y-auto scrollbar-thin pr-1">
              {currentGroup.prompts.map((prompt) => {
                const isSelected = selectedPromptId === prompt.id;
                return (
                  <button
                    key={prompt.id}
                    type="button"
                    onClick={() => handlePromptClick(prompt)}
                    className={`w-full text-left p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? "bg-cyan-500/15 border-cyan-400 text-cyan-400 font-bold"
                        : "bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="text-base shrink-0">{prompt.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors truncate">
                          {prompt.label}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                          {prompt.description}
                        </div>
                      </div>
                    </div>

                    {isSelected ? (
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Docked Trigger: Auto-hides after 2s inactivity to show only a small arrow button */}
      <div
        className="flex items-center justify-start gap-1.5 py-0.5"
        onMouseEnter={resetInactivityTimer}
        onMouseMove={resetInactivityTimer}
        onTouchStart={resetInactivityTimer}
      >
        <AnimatePresence mode="wait">
          {!isBarVisible ? (
            /* Small Arrow Button displayed when collapsed */
            <motion.button
              key="collapsed-arrow-btn"
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                setIsBarVisible(true);
                resetInactivityTimer();
              }}
              className="p-1 px-2 rounded-full bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-slate-500 hover:text-cyan-400 dark:text-slate-400 dark:hover:text-cyan-400 transition-all cursor-pointer flex items-center gap-1 shadow-2xs hover:scale-105 active:scale-95 text-[10px] font-mono"
              title="Show Quick Tools"
            >
              <Sparkles className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
              <ChevronUp className="w-3 h-3 text-cyan-400" />
            </motion.button>
          ) : (
            /* Full Docked Icon Bar */
            <motion.div
              key="expanded-bar-container"
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-full p-1 shadow-2xs"
            >
              {CORE_CONTEXT_GROUPS.map((group) => {
                const isActive = selectedContext === group.viewId;
                return (
                  <button
                    key={group.viewId}
                    type="button"
                    onClick={() => {
                      resetInactivityTimer();
                      handleIconClick(group.viewId);
                    }}
                    className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center relative ${
                      isActive
                        ? "bg-white dark:bg-slate-800 shadow-2xs scale-105"
                        : "hover:bg-slate-200/60 dark:hover:bg-slate-800/60 opacity-60 hover:opacity-100"
                    }`}
                    title={`Open ${group.title} prompts`}
                  >
                    <span
                      className="transition-colors"
                      style={{ color: isActive ? group.accentColor : "inherit" }}
                    >
                      {group.icon}
                    </span>
                    {isActive && isOpen && (
                      <span
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-ping"
                        style={{ backgroundColor: group.accentColor }}
                      />
                    )}
                  </button>
                );
              })}

              {/* Open/Pull-Up Toggle Button on the right of the icon bar */}
              <button
                type="button"
                onClick={() => {
                  resetInactivityTimer();
                  setIsOpen(!isOpen);
                }}
                className={`p-1 px-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-0.5 ${
                  isOpen
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
                title={isOpen ? "Hide Prompts" : "Open Quick Ideas"}
              >
                <ChevronUp
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-cyan-400" : ""
                  }`}
                />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContextPromptSelector;
