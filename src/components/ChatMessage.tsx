import React, { useState } from "react";
import { motion } from "motion/react";
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
  Pin,
  Code2,
  Terminal,
  Sparkles,
  FileText,
  User,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { ChatMessage as ChatMessageType } from "../types";

interface ChatMessageProps {
  message: ChatMessageType;
  onCopyMessage: (id: string, text: string) => void;
  onSpeakText: (text: string) => void;
  onTogglePin: (id: string) => void;
  onToggleReaction: (id: string, emoji: string) => void;
  onTriggerEvaluation?: (idea: string) => void;
  onTriggerGuidance?: (idea: string, title?: string) => void;
  copiedMessageId: string | null;
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

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onCopyMessage,
  onSpeakText,
  onTogglePin,
  onToggleReaction,
  onTriggerEvaluation,
  onTriggerGuidance,
  copiedMessageId
}) => {
  const isUser = message.role === "user";
  const structuredSections = !isUser ? parseStructuredSections(message.text) : null;

  return (
    <div
      id={`msg-bubble-${message.id}`}
      className={`group flex gap-2.5 sm:gap-3 items-start my-2.5 transition-all ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center shrink-0 font-bold text-xs select-none transition-all ${
          isUser
            ? "bg-slate-900 dark:bg-cyan-950 text-white dark:text-cyan-200 border-slate-800 dark:border-cyan-800 shadow-xs"
            : "bg-slate-950 text-[#00e5ff] border-cyan-500/60 shadow-[0_0_12px_rgba(0,229,255,0.25)]"
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-4 h-4 text-[#00e5ff]" />}
      </div>

      {/* Message Container */}
      <div className="space-y-1.5 max-w-[90%] sm:max-w-[85%] min-w-0">
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
          <div className="p-3.5 rounded-2xl rounded-tr-none bg-slate-900 dark:bg-slate-800/95 border border-slate-800 dark:border-slate-700/80 text-white dark:text-slate-100 text-xs leading-relaxed shadow-sm font-sans">
            {message.imageAttached && (
              <div className="mb-2 max-w-xs rounded-xl overflow-hidden border border-slate-700 shadow-xs">
                <img
                  src={`data:${message.imageAttached.mimeType};base64,${message.imageAttached.base64}`}
                  alt="User uploaded attachment"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto max-h-[160px] object-cover"
                />
              </div>
            )}
            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>
        ) : (
          /* AI Response Message Layout - Intelligent Workspace Mode */
          <div className="space-y-2.5">
            {/* Header Tag for AI */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#00e5ff] flex items-center gap-1">
                CORE AI WORKSPACE
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                PRO
              </span>
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
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* Unstructured or Standard AI Response */
              <div className="p-3.5 sm:p-4 rounded-2xl rounded-tl-none bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/90 text-slate-800 dark:text-slate-100 text-xs leading-relaxed shadow-2xs font-sans">
                <FormattedTextContent text={message.text} />
                {message.isTyping && (
                  <span className="inline-block w-2 h-4 bg-[#00e5ff] animate-pulse ml-1 rounded-xs shadow-[0_0_8px_#00e5ff] align-middle" />
                )}
              </div>
            )}

            {/* Smart Action Shortcuts Bar (Evaluator, Blueprint, Writer shortcuts) */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
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

              {onTriggerGuidance && (
                <button
                  type="button"
                  onClick={() => onTriggerGuidance(message.text)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                  title="Generate step-by-step technical blueprint"
                >
                  <Code2 className="w-3 h-3 text-[#00e5ff]" />
                  <span>Build Blueprint</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Message Toolbar Footer */}
        <div className={`flex flex-wrap items-center gap-2 pt-0.5 ${isUser ? "justify-end" : "justify-start"}`}>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">{message.timestamp}</span>

          {/* User toolbar */}
          {isUser && (
            <button
              type="button"
              onClick={() => onTogglePin(message.id)}
              className={`p-1 hover:bg-slate-800 rounded transition-colors cursor-pointer flex items-center ${
                message.isPinned ? "text-cyan-400 bg-cyan-950/60 font-bold" : "text-slate-400 hover:text-cyan-400"
              }`}
              title={message.isPinned ? "Unpin message" : "Pin message"}
            >
              <Pin className={`w-3 h-3 ${message.isPinned ? "fill-cyan-400 text-cyan-400" : ""}`} />
            </button>
          )}

          {/* AI toolbar */}
          {!isUser && (
            <>
              {/* Quick Reactions */}
              <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-full px-1.5 py-0.5 shadow-2xs">
                {["👍", "❤️", "💡", "🔥", "👏"].map((emoji) => {
                  const isReacted = message.reactions?.includes(emoji);
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => onToggleReaction(message.id, emoji)}
                      className={`text-[11px] leading-none px-1 py-0.5 rounded-full transition-all cursor-pointer ${
                        isReacted
                          ? "bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-700 text-slate-900 dark:text-cyan-100 scale-110 font-bold shadow-2xs"
                          : "hover:bg-slate-200/60 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 opacity-60 hover:opacity-100"
                      }`}
                      title={isReacted ? `Remove ${emoji}` : `React with ${emoji}`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>

              {/* Speak Text */}
              <button
                type="button"
                onClick={() => onSpeakText(message.text)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 dark:text-slate-500 hover:text-[#00e5ff] transition-colors cursor-pointer"
                title="Speak Out Loud (TTS)"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>

              {/* Copy Message Text */}
              <button
                type="button"
                onClick={() => onCopyMessage(message.id, message.text)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 dark:text-slate-500 hover:text-[#00e5ff] transition-colors cursor-pointer flex items-center"
                title="Copy entire response text"
              >
                {copiedMessageId === message.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Pin Message */}
              <button
                type="button"
                onClick={() => onTogglePin(message.id)}
                className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer flex items-center ${
                  message.isPinned
                    ? "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 font-bold"
                    : "text-slate-400 dark:text-slate-500 hover:text-[#00e5ff]"
                }`}
                title={message.isPinned ? "Unpin message" : "Pin message"}
              >
                <Pin className={`w-3.5 h-3.5 ${message.isPinned ? "fill-cyan-500 text-cyan-500" : ""}`} />
              </button>
            </>
          )}
        </div>

        {/* Selected Reactions Badges */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {message.reactions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onToggleReaction(message.id, emoji)}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-50/90 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800 rounded-full text-xs font-semibold text-slate-700 dark:text-cyan-200 shadow-2xs hover:bg-cyan-100 dark:hover:bg-cyan-900 transition-colors cursor-pointer group"
                title="Click to remove reaction"
              >
                <span>{emoji}</span>
                <span className="text-[10px] text-cyan-700 dark:text-cyan-300 font-extrabold group-hover:text-cyan-900 dark:group-hover:text-cyan-100">
                  1
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
