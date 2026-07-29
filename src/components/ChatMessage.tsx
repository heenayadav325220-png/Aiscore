import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  Search,
  Target,
  Lightbulb,
  AlertTriangle,
  Rocket,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Loader2,
  Pin,
  Code2,
  Terminal,
  Sparkles,
  User,
  BarChart3,
  FileText,
  Pencil,
  Smile,
  CheckCheck
} from "lucide-react";
import { ChatMessage as ChatMessageType, MarketAnalysisReport, UserProfile, ThemeSettings } from "../types";
import { CoreAiLogo } from "./CoreAiLogo";
import { MarketAnalysisCard } from "./MarketAnalysisReportView";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { UserAvatar } from "./UserAvatar";

interface ChatMessageProps {
  message: ChatMessageType;
  userProfile?: UserProfile;
  themeSettings?: ThemeSettings;
  onCopyMessage: (id: string, text: string) => void;
  onSpeakText: (text: string, id?: string) => void;
  onStopSpeaking?: () => void;
  isSpeaking?: boolean;
  isSpeechLoading?: boolean;
  onTogglePin: (id: string) => void;
  onToggleReaction: (id: string, emoji: string) => void;
  onEditMessage?: (id: string, newText: string) => void;
  onTriggerEvaluation?: (idea: string) => void;
  onTriggerGuidance?: (idea: string, title?: string) => void;
  onTriggerMarketAnalysis?: (idea: string) => void;
  onOpenMarketReportModal?: (report: MarketAnalysisReport) => void;
  copiedMessageId: string | null;
  index?: number;
}

// Section definitions and matching keywords
const SECTION_CONFIGS = [
  {
    key: "UNDERSTANDING",
    matchRegex: /(?:🧠\s*)?UNDERSTANDING/i,
    title: "Understanding",
    icon: Brain,
    badgeBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/20",
    cardStyle: "bg-cyan-500/5 dark:bg-cyan-950/20 border-cyan-500/20 dark:border-cyan-500/30"
  },
  {
    key: "ANALYSIS",
    matchRegex: /(?:🔍\s*)?ANALYSIS/i,
    title: "Analysis",
    icon: Search,
    badgeBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20",
    cardStyle: "bg-indigo-500/5 dark:bg-indigo-950/20 border-indigo-500/20 dark:border-indigo-500/30"
  },
  {
    key: "ROOT PROBLEM",
    matchRegex: /(?:🎯\s*)?ROOT\s+PROBLEM/i,
    title: "Root Problem",
    icon: Target,
    badgeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20",
    cardStyle: "bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/20 dark:border-rose-500/30"
  },
  {
    key: "OPTIONS",
    matchRegex: /(?:💡\s*)?OPTIONS/i,
    title: "Options & Alternatives",
    icon: Lightbulb,
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20",
    cardStyle: "bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/20 dark:border-amber-500/30"
  },
  {
    key: "RISKS",
    matchRegex: /(?:⚠️\s*)?RISKS/i,
    title: "Risks & Trade-offs",
    icon: AlertTriangle,
    badgeBg: "bg-orange-500/10 text-orange-600 dark:text-orange-300 border-orange-500/20",
    cardStyle: "bg-orange-500/5 dark:bg-orange-950/20 border-orange-500/20 dark:border-orange-500/30"
  },
  {
    key: "NEXT STEP",
    matchRegex: /(?:🚀\s*)?NEXT\s+STEP/i,
    title: "Next Step",
    icon: Rocket,
    badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20",
    cardStyle: "bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20 dark:border-emerald-500/30"
  }
];

/**
 * Helper to render code blocks with syntax styling and one-click copy button
 */
function CodeBlock({ code, language }: { code: string; language: string; key?: React.Key }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanLang = (language || "code").toLowerCase();

  return (
    <div className="my-2.5 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-md text-xs font-mono">
      {/* Code Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider">
          <Terminal className="w-3 h-3 text-[#00e5ff]" />
          <span className="text-[#00e5ff]">{cleanLang}</span>
        </div>
        <button
          type="button"
          onClick={handleCopyCode}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>
      {/* Code Content */}
      <pre className="p-3 overflow-x-auto text-slate-200 text-[11px] leading-relaxed selection:bg-cyan-500/30">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}

/**
 * Helper to parse markdown text into formatted blocks (code, bold, lists, sections)
 */
function FormattedTextContent({ text }: { text: string }) {
  if (!text) return null;

  // Split content by code blocks ```...```
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "code", language: match[1], content: match[2] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (part.type === "code") {
          return <CodeBlock key={i} code={part.content} language={part.language} />;
        }

        // Process text block line by line for bullet points, bolding, etc.
        const lines = part.content.split("\n");
        return (
          <div key={i} className="space-y-1.5 text-xs leading-relaxed text-slate-800 dark:text-slate-100">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1" />;

              // Headers
              if (trimmed.startsWith("### ")) {
                return (
                  <h4 key={lIdx} className="text-xs font-extrabold text-slate-900 dark:text-white mt-2 mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]" />
                    {trimmed.replace(/^###\s+/, "")}
                  </h4>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h3 key={lIdx} className="text-sm font-black text-slate-950 dark:text-white mt-2.5 mb-1 tracking-tight">
                    {trimmed.replace(/^##\s+/, "")}
                  </h3>
                );
              }

              // Bullet points
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                const bulletText = trimmed.replace(/^[-*]\s+/, "");
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1 my-0.5">
                    <span className="text-[#00e5ff] font-bold text-sm leading-none shrink-0">•</span>
                    <span className="flex-1">{renderInlineFormatting(bulletText)}</span>
                  </div>
                );
              }

              // Numbered items
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1 my-0.5">
                    <span className="text-xs font-mono font-bold text-[#00e5ff] shrink-0">{numMatch[1]}.</span>
                    <span className="flex-1">{renderInlineFormatting(numMatch[2])}</span>
                  </div>
                );
              }

              return <p key={lIdx}>{renderInlineFormatting(trimmed)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Render inline formatting like **bold** or `inline code`
 */
function renderInlineFormatting(text: string) {
  // Regex to split **bold** and `code`
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-bold text-slate-950 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={idx} className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#00e5ff] text-[11px] font-mono border border-slate-200 dark:border-slate-700">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/**
 * Parse structured sections from an AI response text if present
 */
function parseStructuredSections(fullText: string) {
  // Check if any section headers exist
  const hasStructuredSections = SECTION_CONFIGS.some((cfg) => cfg.matchRegex.test(fullText));
  if (!hasStructuredSections) {
    return null; // Regular text
  }

  // Create regex pattern matching all section headers
  const sectionKeysPattern = SECTION_CONFIGS.map((c) => c.matchRegex.source).join("|");
  const regex = new RegExp(`(?=^|\\n)(?:${sectionKeysPattern})`, "i");

  const rawChunks = fullText.split(regex);
  const parsedSections: { config: (typeof SECTION_CONFIGS)[0] | null; content: string }[] = [];

  for (const chunk of rawChunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    // Find matching section config
    const matchedConfig = SECTION_CONFIGS.find((cfg) => cfg.matchRegex.test(trimmed));
    if (matchedConfig) {
      // Remove the header line from content
      const contentWithoutHeader = trimmed.replace(matchedConfig.matchRegex, "").trim();
      parsedSections.push({ config: matchedConfig, content: contentWithoutHeader });
    } else {
      parsedSections.push({ config: null, content: trimmed });
    }
  }

  return parsedSections.length > 0 ? parsedSections : null;
}

const PRESET_EMOJIS = ["👍", "❤️", "💡", "🔥", "👏"];
const POPULAR_EMOJIS = PRESET_EMOJIS;

const ChatMessageComponent: React.FC<ChatMessageProps> = ({
  message,
  userProfile,
  themeSettings,
  onCopyMessage,
  onSpeakText,
  onStopSpeaking,
  isSpeaking,
  isSpeechLoading,
  onTogglePin,
  onToggleReaction,
  onEditMessage,
  onTriggerEvaluation,
  onTriggerGuidance,
  onTriggerMarketAnalysis,
  onOpenMarketReportModal,
  copiedMessageId,
  index
}) => {
  const isUser = message.role === "user";

  // Computed dynamic styling based on user Theme & UI Redesign Settings
  const bubbleStyle = themeSettings?.chatBubbleStyle || "glass";
  const fontFamilyClass =
    themeSettings?.fontFamily === "tech_mono"
      ? "font-mono"
      : themeSettings?.fontFamily === "serif_editorial"
      ? "font-serif"
      : themeSettings?.fontFamily === "space_grotesk"
      ? "font-display"
      : "font-sans";

  const cornerRadiusClass =
    themeSettings?.cornerRadius === "sharp"
      ? "rounded-md"
      : themeSettings?.cornerRadius === "soft"
      ? "rounded-2xl"
      : themeSettings?.cornerRadius === "pill"
      ? "rounded-3xl"
      : "rounded-xl";

  const showAvatars = themeSettings?.showAvatars !== false;
  const showTimestamps = themeSettings?.showTimestamps !== false;

  const userBubbleStyleClass = useMemo(() => {
    switch (bubbleStyle) {
      case "minimal":
        return `bg-slate-800 dark:bg-slate-800 text-white border-none shadow-none ${cornerRadiusClass} ${fontFamilyClass}`;
      case "rounded_pill":
        return `bg-slate-900 dark:bg-slate-800/95 border border-slate-700/80 text-white shadow-sm rounded-3xl ${fontFamilyClass}`;
      case "retro_card":
        return `bg-slate-950 border-2 border-slate-700 dark:border-cyan-400 text-white shadow-[3px_3px_0px_0px_rgba(0,229,255,0.3)] ${cornerRadiusClass} ${fontFamilyClass}`;
      case "cyber_border":
        return `bg-slate-950 border border-[#00e5ff] text-slate-100 shadow-[0_0_12px_rgba(0,229,255,0.25)] ${cornerRadiusClass} ${fontFamilyClass}`;
      case "glass":
      default:
        return `bg-slate-900/90 dark:bg-slate-800/95 backdrop-blur-md border border-slate-800 dark:border-slate-700/80 text-white dark:text-slate-100 shadow-sm ${cornerRadiusClass} ${fontFamilyClass}`;
    }
  }, [bubbleStyle, cornerRadiusClass, fontFamilyClass]);

  const structuredSections = useMemo(
    () => (!isUser ? parseStructuredSections(message.text) : null),
    [isUser, message.text]
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [floatingBurst, setFloatingBurst] = useState<{ id: number; emoji: string }[]>([]);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerReactionAnimation = useCallback((emoji: string) => {
    const burstId = Date.now() + Math.random();
    setFloatingBurst((prev) => [...prev, { id: burstId, emoji }]);
    setTimeout(() => {
      setFloatingBurst((prev) => prev.filter((item) => item.id !== burstId));
    }, 900);
  }, []);

  const handleReactionToggle = useCallback(
    (emoji: string) => {
      const isAdding = !message.reactions?.includes(emoji);
      if (isAdding) {
        triggerReactionAnimation(emoji);
      }
      onToggleReaction(message.id, emoji);
    },
    [message.id, message.reactions, onToggleReaction, triggerReactionAnimation]
  );

  // Compute aggregated reaction counts for display beneath message bubble
  const reactionCounts = useMemo(() => {
    if (!message.reactions || message.reactions.length === 0) return [];
    const countsMap = new Map<string, number>();
    for (const emoji of message.reactions) {
      countsMap.set(emoji, (countsMap.get(emoji) || 0) + 1);
    }
    return Array.from(countsMap.entries()).map(([emoji, count]) => ({
      emoji,
      count,
      isReacted: message.reactions?.includes(emoji) ?? false,
    }));
  }, [message.reactions]);

  useEffect(() => {
    if (!contextMenu) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContextMenu(null);
    };
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("click", handleClickOutside);
    window.addEventListener("scroll", handleClickOutside, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleClickOutside);
      window.removeEventListener("scroll", handleClickOutside, true);
    };
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handlePressStart = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setShowReactionPicker(true);
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        try {
          window.navigator.vibrate(35);
        } catch (e) {
          // ignore
        }
      }
    }, 450);
  };

  const handlePressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleSaveEdit = () => {
    if (editText.trim() && onEditMessage) {
      onEditMessage(message.id, editText.trim());
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      id={`msg-bubble-${message.id}`}
      initial={
        isUser
          ? { opacity: 0, y: 16, x: 12, scale: 0.98 }
          : { opacity: 0, y: 20, scale: 0.96, filter: "blur(6px)" }
      }
      animate={{
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      exit={
        isUser
          ? { opacity: 0, y: -10, scale: 0.96 }
          : { opacity: 0, y: -12, scale: 0.96, filter: "blur(4px)" }
      }
      transition={{
        type: "spring",
        stiffness: isUser ? 420 : 360,
        damping: isUser ? 28 : 26,
        mass: isUser ? 0.6 : 0.75,
        delay: index !== undefined ? Math.min(index * 0.02, 0.18) : 0,
      }}
      className={`group flex gap-2.5 sm:gap-3 items-start my-2.5 transition-all ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar Icon */}
      {showAvatars && (
        isUser ? (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 22,
              delay: index !== undefined ? Math.min(index * 0.02 + 0.04, 0.22) : 0.04,
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border bg-slate-900 dark:bg-cyan-950 text-white dark:text-cyan-200 border-slate-800 dark:border-cyan-800 shadow-xs flex items-center justify-center shrink-0 font-bold text-xs select-none"
          >
            <User className="w-3.5 h-3.5" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.5, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 22,
              delay: index !== undefined ? Math.min(index * 0.02 + 0.04, 0.22) : 0.04,
            }}
            className="shrink-0 cursor-pointer"
            title="CORE AI Assistant"
          >
            <CoreAiLogo size="xs" showText={false} glow={true} />
          </motion.div>
        )
      )}

      {/* Message Container */}
      <div
        className="relative space-y-1.5 max-w-[90%] sm:max-w-[85%] min-w-0"
        onContextMenu={handleContextMenu}
      >
        {/* Right-Click Custom Context Menu Popover */}
        <AnimatePresence>
          {contextMenu && (
            <>
              <div
                className="fixed inset-0 z-40 bg-transparent cursor-default"
                onClick={(e) => {
                  e.stopPropagation();
                  setContextMenu(null);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setContextMenu(null);
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -4 }}
                transition={{ duration: 0.12 }}
                style={{
                  top: Math.min(contextMenu.y, (typeof window !== "undefined" ? window.innerHeight : 800) - 260),
                  left: Math.min(contextMenu.x, (typeof window !== "undefined" ? window.innerWidth : 1200) - 210),
                }}
                className="fixed z-50 w-52 bg-slate-900/95 dark:bg-slate-800/95 border border-slate-700/80 dark:border-slate-600/80 text-slate-100 rounded-xl shadow-2xl backdrop-blur-xl p-1.5 text-xs select-none space-y-1 font-sans"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Quick Reaction Bar Header */}
                <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800 dark:border-slate-700/60 mb-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Quick React</span>
                  <div className="flex items-center gap-1">
                    {PRESET_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReactionToggle(emoji);
                          setContextMenu(null);
                        }}
                        className="hover:scale-135 transition-transform p-0.5 cursor-pointer text-xs"
                        title={`React with ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Copy Text */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopyMessage(message.id, message.text);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-200 transition-colors cursor-pointer text-left"
                >
                  {copiedMessageId === message.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                  <span>{copiedMessageId === message.id ? "Copied!" : "Copy Text"}</span>
                </button>

                {/* Pin / Unpin Insight */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(message.id);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-200 transition-colors cursor-pointer text-left"
                >
                  <Pin className={`w-3.5 h-3.5 ${message.isPinned ? "fill-cyan-400 text-cyan-400" : "text-slate-400"}`} />
                  <span>{message.isPinned ? "Unpin Insight" : "Pin Insight"}</span>
                </button>

                {/* Edit & Re-generate (if user message) */}
                {isUser && onEditMessage && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                      setEditText(message.text);
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-200 transition-colors cursor-pointer text-left"
                  >
                    <Pencil className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit & Re-generate</span>
                  </button>
                )}

                {/* Read Aloud (TTS) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSpeakText(message.text);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-200 transition-colors cursor-pointer text-left"
                >
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Read Aloud (TTS)</span>
                </button>

                {/* AI Workflows */}
                {!isUser && (onTriggerEvaluation || onTriggerMarketAnalysis) && (
                  <>
                    <div className="border-t border-slate-800 dark:border-slate-700/60 my-1" />
                    {onTriggerEvaluation && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTriggerEvaluation(message.text);
                          setContextMenu(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-200 transition-colors cursor-pointer text-left"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Evaluate Concept</span>
                      </button>
                    )}
                    {onTriggerMarketAnalysis && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTriggerMarketAnalysis(message.text);
                          setContextMenu(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-200 transition-colors cursor-pointer text-left"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Market PDF Analysis</span>
                      </button>
                    )}
                  </>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
        {/* Floating Quick Reaction Picker Popover */}
        <AnimatePresence>
          {showReactionPicker && (
            <>
              <div
                className="fixed inset-0 z-20 bg-transparent cursor-default"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReactionPicker(false);
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.75, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.75, y: 8 }}
                transition={{ type: "spring", stiffness: 500, damping: 24 }}
                className={`absolute -top-12 ${
                  isUser ? "right-0" : "left-0"
                } z-30 flex items-center gap-1.5 bg-slate-900/95 dark:bg-slate-800/95 border border-cyan-500/40 rounded-full px-2.5 py-1.5 shadow-2xl backdrop-blur-md select-none`}
              >
                {PRESET_EMOJIS.map((emoji, idx) => {
                  const isReacted = message.reactions?.includes(emoji);
                  return (
                    <motion.button
                      key={emoji}
                      type="button"
                      initial={{ scale: 0, y: 8 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 550,
                        damping: 20,
                        delay: idx * 0.03,
                      }}
                      whileHover={{ scale: 1.4, y: -4 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReactionToggle(emoji);
                        setShowReactionPicker(false);
                      }}
                      className={`text-base sm:text-lg leading-none p-1 rounded-full transition-all cursor-pointer ${
                        isReacted
                          ? "bg-cyan-500/30 ring-2 ring-cyan-400 scale-110 shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                          : "hover:bg-slate-700/80"
                      }`}
                      title={isReacted ? `Remove ${emoji}` : `React with ${emoji}`}
                    >
                      {emoji}
                    </motion.button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Floating Burst Pop-up Animation for Emoji Reactions */}
        <AnimatePresence>
          {floatingBurst.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.3, y: 10 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.3, 1.8, 1.4, 0.9],
                y: [10, -35, -65],
                x: isUser ? [-5, -20, -12] : [5, 20, 12],
                rotate: [0, -12, 12, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: [0.175, 0.885, 0.32, 1.275] }}
              className="absolute z-50 pointer-events-none text-3xl sm:text-4xl drop-shadow-[0_4px_16px_rgba(0,229,255,0.5)]"
              style={{
                top: "-10px",
                left: isUser ? "auto" : "16px",
                right: isUser ? "16px" : "auto",
              }}
            >
              <span className="inline-block transform-gpu">{item.emoji}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pinned Badge */}
        {message.isPinned && (
          <div
            className={`flex items-center gap-1 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-400/30 px-2 py-0.5 rounded-full w-max ${
              isUser ? "ml-auto" : ""
            }`}
          >
            <Pin className="w-2.5 h-2.5 fill-cyan-400 text-cyan-400" />
            <span>Pinned Insight</span>
          </div>
        )}

        {/* User Message Bubble */}
        {isUser ? (
          <div className="space-y-1.5 flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-0.5 select-none">
              <span className="text-[10px] font-mono font-bold text-slate-300 dark:text-slate-400">
                {userProfile?.name || "You"}
              </span>
              <UserAvatar avatar={userProfile?.avatar} name={userProfile?.name} size="xs" />
            </div>
            {isEditing ? (
            <div className="p-3 rounded-2xl rounded-tr-none bg-slate-900 dark:bg-slate-800 border border-cyan-500/50 text-white shadow-md font-sans space-y-2">
              {message.imageAttached && (
                message.imageAttached.mimeType === "application/pdf" || message.imageAttached.fileName?.endsWith(".pdf") ? (
                  <div className="mb-2 max-w-xs p-2 rounded-xl bg-slate-950/90 border border-cyan-500/40 flex items-center gap-2 text-xs text-cyan-300 font-mono">
                    <FileText className="w-5 h-5 text-[#00e5ff] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate text-slate-100">{message.imageAttached.fileName || "Attached Document (PDF)"}</div>
                      <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">PDF Document • Analysed by AI</div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-2 max-w-xs rounded-xl overflow-hidden border border-slate-700 shadow-xs">
                    <img
                      src={`data:${message.imageAttached.mimeType};base64,${message.imageAttached.base64}`}
                      alt="User uploaded attachment"
                      referrerPolicy="no-referrer"
                      className="w-full h-auto max-h-[160px] object-cover"
                    />
                  </div>
                )
              )}
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  } else if (e.key === "Escape") {
                    setIsEditing(false);
                    setEditText(message.text);
                  }
                }}
                className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none resize-none font-sans min-h-[60px]"
                rows={2}
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(message.text);
                  }}
                  className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!editText.trim()}
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Save & Re-generate</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              onTouchMove={handlePressEnd}
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              className={`p-3.5 leading-relaxed font-sans select-none sm:select-text ${userBubbleStyleClass}`}
            >
              {message.imageAttached && (
                message.imageAttached.mimeType === "application/pdf" || message.imageAttached.fileName?.endsWith(".pdf") ? (
                  <div className="mb-2 max-w-xs p-2 rounded-xl bg-slate-950/90 border border-cyan-500/40 flex items-center gap-2 text-xs text-cyan-300 font-mono">
                    <FileText className="w-5 h-5 text-[#00e5ff] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate text-slate-100">{message.imageAttached.fileName || "Attached Document (PDF)"}</div>
                      <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">PDF Document • Analysed by AI</div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-2 max-w-xs rounded-xl overflow-hidden border border-slate-700 shadow-xs">
                    <img
                      src={`data:${message.imageAttached.mimeType};base64,${message.imageAttached.base64}`}
                      alt="User uploaded attachment"
                      referrerPolicy="no-referrer"
                      className="w-full h-auto max-h-[160px] object-cover"
                    />
                  </div>
                )
              )}
              <p className="whitespace-pre-wrap">{message.text}</p>
            </div>
          )}
          </div>
        ) : (
          /* AI Response Message Layout - Intelligent Workspace Mode */
          <div className="space-y-2.5">
            {/* Header Tag for AI */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#00e5ff] flex items-center gap-1">
                CORE AI WORKSPACE
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                PRO
              </span>
              {isSpeaking && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00e5ff] text-[9px] font-mono font-bold animate-pulse">
                  <VoiceVisualizer barCount={10} size="xs" accentColor="#00e5ff" state="speaking" />
                  <span>SPEAKING</span>
                </div>
              )}
            </div>

            {/* If Structured Sections Present */}
            {structuredSections ? (
              <div className="space-y-2.5">
                {structuredSections.map((sec, idx) => {
                  if (!sec.config) {
                    return (
                      <div
                        key={idx}
                        className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xs"
                      >
                        <FormattedTextContent text={sec.content} />
                      </div>
                    );
                  }

                  const ConfigIcon = sec.config.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.04 }}
                      className={`p-3.5 sm:p-4 rounded-xl border ${sec.config.cardStyle} shadow-2xs transition-all`}
                    >
                      {/* Section Header */}
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/50 dark:border-slate-800/60">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded-lg border ${sec.config.badgeBg}`}>
                            <ConfigIcon className="w-3.5 h-3.5" />
                          </div>
                          <h4 className="text-xs font-extrabold tracking-wide uppercase font-mono text-slate-900 dark:text-slate-100">
                            {sec.config.title}
                          </h4>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase">
                          Phase {idx + 1}
                        </span>
                      </div>

                      {/* Section Body */}
                      <FormattedTextContent text={sec.content} />
                      {message.isTyping && idx === structuredSections.length - 1 && (
                        <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00e5ff] align-middle select-none">
                          <motion.span
                            animate={{ scale: [0.75, 1.35, 0.75], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.75, repeat: Infinity, delay: 0 }}
                            className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]"
                          />
                          <motion.span
                            animate={{ scale: [0.75, 1.35, 0.75], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.75, repeat: Infinity, delay: 0.2 }}
                            className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]"
                          />
                          <motion.span
                            animate={{ scale: [0.75, 1.35, 0.75], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.75, repeat: Infinity, delay: 0.4 }}
                            className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]"
                          />
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* Unstructured or Standard AI Response */
              <div className="p-3.5 sm:p-4 rounded-2xl rounded-tl-none bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/90 text-slate-800 dark:text-slate-100 text-xs leading-relaxed shadow-2xs font-sans">
                <FormattedTextContent text={message.text} />
                {message.isTyping && (
                  <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00e5ff] align-middle select-none">
                    <motion.span
                      animate={{ scale: [0.75, 1.35, 0.75], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.75, repeat: Infinity, delay: 0 }}
                      className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]"
                    />
                    <motion.span
                      animate={{ scale: [0.75, 1.35, 0.75], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.75, repeat: Infinity, delay: 0.2 }}
                      className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]"
                    />
                    <motion.span
                      animate={{ scale: [0.75, 1.35, 0.75], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.75, repeat: Infinity, delay: 0.4 }}
                      className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]"
                    />
                  </span>
                )}
              </div>
            )}

            {/* Smart Action Shortcuts Bar (Evaluator, Blueprint, Market Analysis shortcuts) */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {onTriggerMarketAnalysis && (
                <button
                  type="button"
                  onClick={() => onTriggerMarketAnalysis(message.text)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-[10px] font-bold text-cyan-400 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                  title="Generate Full Market Analysis PDF Report"
                >
                  <BarChart3 className="w-3 h-3 text-[#00e5ff]" />
                  <span>📊 Full Market PDF Analysis</span>
                </button>
              )}

              {onTriggerEvaluation && (
                <button
                  type="button"
                  onClick={() => onTriggerEvaluation(message.text)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                  title="Evaluate this concept with CORE Evaluator"
                >
                  <Lightbulb className="w-3 h-3 text-[#00e5ff]" />
                  <span>Evaluate Concept</span>
                </button>
              )}
            </div>

            {/* Embedded Market Analysis Report Card directly in the Chat Thread */}
            {message.marketReport && (
              <MarketAnalysisCard
                report={message.marketReport}
                onOpenModal={(rep) => onOpenMarketReportModal && onOpenMarketReportModal(rep)}
              />
            )}
          </div>
        )}

        {/* Message Toolbar Footer */}
        <div className={`flex flex-wrap items-center gap-2 pt-0.5 ${isUser ? "justify-end" : "justify-start"}`}>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 dark:text-slate-500 font-mono">
            {showTimestamps && <span>{message.timestamp}</span>}
            {!isUser && (
              message.isTyping ? (
                <span className="inline-flex items-center gap-1.5 text-[9px] text-cyan-400 font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40">
                  <span className="flex items-center gap-1">
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-1 h-1 rounded-full bg-cyan-400"
                    />
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.18 }}
                      className="w-1 h-1 rounded-full bg-cyan-400"
                    />
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.36 }}
                      className="w-1 h-1 rounded-full bg-cyan-400"
                    />
                  </span>
                  <span>Streaming...</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-[9px] text-cyan-400 font-mono font-medium px-1.5 py-0.2 rounded bg-cyan-950/40 border border-cyan-500/30" title="AI response fully generated & rendered in view">
                  <CheckCheck className="w-3 h-3 text-[#00e5ff]" />
                  Read
                </span>
              )
            )}
          </div>

          {/* User toolbar */}
          {isUser && (
            <div className="flex items-center gap-1 transition-all duration-200 ease-out opacity-100 sm:opacity-0 group-hover:opacity-100 -translate-x-1 sm:-translate-x-2 group-hover:translate-x-0">
              <button
                type="button"
                onClick={() => setShowReactionPicker((prev) => !prev)}
                className={`p-1 hover:bg-slate-800 rounded transition-colors cursor-pointer flex items-center ${
                  showReactionPicker ? "text-cyan-400 bg-slate-800" : "text-slate-400 hover:text-cyan-400"
                }`}
                title="Add quick reaction (or long press)"
              >
                <Smile className="w-3 h-3" />
              </button>
              {onEditMessage && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setEditText(message.text);
                  }}
                  className="p-1 hover:bg-slate-800 rounded transition-colors cursor-pointer flex items-center text-slate-400 hover:text-cyan-400"
                  title="Edit message & re-generate response"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onTogglePin(message.id)}
                className={`p-1 hover:bg-slate-800 rounded transition-colors cursor-pointer flex items-center ${
                  message.isPinned ? "text-cyan-400 bg-cyan-950/60 font-bold opacity-100" : "text-slate-400 hover:text-cyan-400"
                }`}
                title={message.isPinned ? "Unpin message" : "Pin message"}
              >
                <Pin className={`w-3 h-3 ${message.isPinned ? "fill-cyan-400 text-cyan-400" : ""}`} />
              </button>
            </div>
          )}

          {/* AI toolbar */}
          {!isUser && (
            <div className="flex items-center gap-1.5 transition-all duration-200 ease-out opacity-100 sm:opacity-0 group-hover:opacity-100 translate-x-1 sm:translate-x-2 group-hover:translate-x-0">
              {/* Quick Reaction Button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowReactionPicker((prev) => !prev)}
                className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer flex items-center ${
                  showReactionPicker || (message.reactions && message.reactions.length > 0)
                    ? "text-cyan-500 font-bold bg-cyan-50 dark:bg-cyan-950/60"
                    : "text-slate-400 dark:text-slate-500 hover:text-[#00e5ff]"
                }`}
                title="React with 5 preset emojis"
              >
                <Smile className="w-3.5 h-3.5 text-cyan-500" />
              </motion.button>

              {/* Speak Text / Mute Voice */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if ((isSpeaking || isSpeechLoading) && onStopSpeaking) {
                    onStopSpeaking();
                  } else {
                    onSpeakText(message.text, message.id);
                  }
                }}
                className={`p-1 px-1.5 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                  isSpeaking
                    ? "bg-rose-500/20 text-rose-400 dark:text-rose-300 font-bold border border-rose-500/30"
                    : isSpeechLoading
                    ? "bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-[#00e5ff]"
                }`}
                title={
                  isSpeaking
                    ? "Mute Voice (Stop Audio)"
                    : isSpeechLoading
                    ? "Generating AI Voice... (Click to Cancel)"
                    : "Speak Out Loud with Gemini AI Voice"
                }
              >
                {isSpeechLoading ? (
                  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                ) : isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <VoiceVisualizer barCount={8} size="xs" accentColor="#f43f5e" state="speaking" />
                  </>
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </motion.button>

              {/* Copy Message Text */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onCopyMessage(message.id, message.text)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 dark:text-slate-500 hover:text-[#00e5ff] transition-colors cursor-pointer flex items-center"
                title="Copy entire response text"
              >
                {copiedMessageId === message.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </motion.button>

              {/* Pin Message */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onTogglePin(message.id)}
                className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer flex items-center ${
                  message.isPinned
                    ? "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 font-bold"
                    : "text-slate-400 dark:text-slate-500 hover:text-[#00e5ff]"
                }`}
                title={message.isPinned ? "Unpin message" : "Pin message"}
              >
                <Pin className={`w-3.5 h-3.5 ${message.isPinned ? "fill-cyan-500 text-cyan-500" : ""}`} />
              </motion.button>
            </div>
          )}
        </div>

        {/* Selected Reactions Badges with Aggregated Emoji Counts */}
        {reactionCounts.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 select-none">
            {reactionCounts.map(({ emoji, count, isReacted }) => (
              <motion.button
                key={emoji}
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleReactionToggle(emoji)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-2xs transition-all cursor-pointer border ${
                  isReacted
                    ? "bg-cyan-50 dark:bg-cyan-950/80 border-cyan-300 dark:border-cyan-700 text-slate-800 dark:text-cyan-200 hover:bg-cyan-100 dark:hover:bg-cyan-900"
                    : "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
                title={isReacted ? `Click to remove ${emoji}` : `Click to add ${emoji}`}
              >
                <span className="text-sm leading-none">{emoji}</span>
                <span
                  className={`text-[11px] font-mono font-bold ${
                    isReacted ? "text-cyan-700 dark:text-cyan-300" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const ChatMessage = React.memo(ChatMessageComponent);
