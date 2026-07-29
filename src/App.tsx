import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "motion/react";
import {
  Menu,
  MoreVertical,
  Send,
  Mic,
  Paperclip,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  Sparkles,
  Lightbulb,
  Code,
  FileText,
  CheckCircle,
  X,
  MessageSquare,
  FileJson,
  Printer,
  Copy,
  Check,
  AlertTriangle,
  Keyboard,
  Sun,
  Moon,
  Tag,
  Pin,
  PinOff,
  ChevronDown,
  ChevronUp,
  Filter,
  LayoutList,
  LayoutGrid,
  GripVertical,
  Wand2,
  RotateCw,
  Search,
  Scale,
  Rocket,
  Cpu,
  Server,
  Zap,
  Globe,
  Trash2,
  Plus,
  Crown,
  UserCheck,
  UserCog,
  GraduationCap,
  User,
  AlertCircle,
  ArrowLeft,
  Download,
  Loader2
} from "lucide-react";
import Markdown from "react-markdown";
import { AppLanguage, OwnerProfile, UserProfile } from "./types";
import { LANGUAGE_OPTIONS, TRANSLATIONS, getLanguageInstruction } from "./lib/translations";


import { exportChatToPdf } from "./lib/exportUtils";
import {
  subscribeChatSessions,
  saveChatSessionToFirestore,
  deleteChatSessionFromFirestore,
  subscribeIdeas,
  saveIdeaToFirestore,
  subscribeGuidance,
  saveGuidanceToFirestore,
  subscribeCustomInstructions,
  saveCustomInstructionsToFirestore,
  subscribeThemeSettings,
  saveThemeSettingsToFirestore,
} from "./lib/firebase";

import {
  ChatMessage,
  IdeaEvaluation,
  PrototypeGuidance,
  UIMode,
  CustomInstructions,
  ThemeSettings,
  ChatSession,
  MarketAnalysisReport
} from "./types";

import Sidebar from "./components/Sidebar";
import IdeaEvaluator from "./components/IdeaEvaluator";
import PrototypeEngine from "./components/PrototypeEngine";
import WritingAssistant from "./components/WritingAssistant";
import ImageGenerator from "./components/ImageGenerator";
import ContextPromptSelector from "./components/ContextPromptSelector";
import { ChatMessage as ChatMessageComponent } from "./components/ChatMessage";
import { MarketAnalysisModal } from "./components/MarketAnalysisReportView";
import { CoreAiLogo } from "./components/CoreAiLogo";
import { VoiceVisualizer, SpeakingIndicatorWidget } from "./components/VoiceVisualizer";
import {
  ChatSkeleton,
  ScorecardSkeleton,
  BlueprintSkeleton,
  ImageGeneratorSkeleton,
  WritingAssistantSkeleton,
} from "./components/NeonSkeleton";

function formatApiErrorMessage(err: any): string {
  if (!err) return "Connection slow or API limit reached. Please try again!";
  const msg = typeof err === "string" ? err : err?.message || String(err);
  if (
    msg.includes("429") ||
    msg.toLowerCase().includes("quota") ||
    msg.toLowerCase().includes("rate limit") ||
    msg.toLowerCase().includes("resource_exhausted")
  ) {
    return "Connection slow or API limit reached. Please try again in a few moments!";
  }
  if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("networkerror") || msg.toLowerCase().includes("typeerror")) {
    return "Network connection slow or offline. Please check your network and retry!";
  }
  return msg || "Connection slow or API error occurred. Please try again!";
}

const playUiSound = (type: "pin" | "unpin" | "toggle" | "reorder" | "copy" | "expand", enabled: boolean = true) => {
  if (!enabled) return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === "pin") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === "unpin") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.12); // E4
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "toggle") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === "reorder") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(750, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === "copy") {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now);
      osc2.frequency.setValueAtTime(659.25, now + 0.06);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.2);
    } else if (type === "expand") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.09);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    }
  } catch (e) {
    // ignore
  }
};

interface OwnerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: OwnerProfile;
}

function OwnerInfoModal({ isOpen, onClose, profile }: OwnerInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-500/40 dark:border-amber-500/50 relative overflow-hidden select-none"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/15 rounded-2xl text-amber-500 border border-amber-500/30">
              <Crown className="w-5 h-5 text-amber-500 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  App Founder & Malik
                </h3>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                  Read-Only
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official founder & creator credentials.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 pt-4">
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-amber-500/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">OWNER / FOUNDER</span>
              <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">SYSTEM MEMORY</span>
            </div>
            <p className="text-base font-extrabold text-amber-300">{profile.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block">CLASS</span>
              <span className="text-xs font-bold text-cyan-300 block mt-0.5">{profile.className} Grade</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block">AGE</span>
              <span className="text-xs font-bold text-emerald-300 block mt-0.5">{profile.age} Years Old</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">APPLICATION</span>
            <span className="text-xs font-bold text-purple-300 block mt-0.5">{profile.appTitle}</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-300 text-[11px] leading-relaxed flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>The Owner Profile is permanently locked to Rohit (Class 11th, Age 15) as founder and creator.</span>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close Credentials
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (newProfile: UserProfile) => void;
}

function UserProfileModal({ isOpen, onClose, profile, onSave }: UserProfileModalProps) {
  const [name, setName] = useState(profile.name || "");
  const [occupation, setOccupation] = useState(profile.occupation || "");
  const [age, setAge] = useState(profile.age || "");
  const [details, setDetails] = useState(profile.details || "");

  useEffect(() => {
    setName(profile.name || "");
    setOccupation(profile.occupation || "");
    setAge(profile.age || "");
    setDetails(profile.details || "");
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      occupation: occupation.trim(),
      age: age.trim(),
      details: details.trim(),
      isSetupCompleted: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-cyan-500/40 dark:border-cyan-500/50 relative overflow-hidden select-none"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-500 shadow-[0_0_12px_rgba(0,229,255,0.5)]" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/15 rounded-2xl text-cyan-500 border border-cyan-500/30">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-display">
                  User Profile & AI Personalization
                </h3>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
                  AI Trained
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Save your background so CORE AI learns and adapts to you.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                What You Do (Occupation / Role)
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. 11th Grade Student, Developer"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                Age / Age Group
              </label>
              <input
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 17"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
              About You & AI Preferences
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Preparing for JEE / coding web apps. Prefer visual step-by-step code examples, practical analogies, and clear logical breakdowns."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              CORE AI learns from these details to personalize explanations, tone, and examples.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-slate-950" />
              Save Profile & Train AI
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function App() {
  // Navigation drawer
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Settings dropdown tab state
  const [activeView, setActiveView] = useState<"chat" | "evaluator" | "visuals" | "writer">("chat");
  const [prototypeIconRotation, setPrototypeIconRotation] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Core application data lists
  const [ideas, setIdeas] = useState<IdeaEvaluation[]>([]);
  const [guidanceList, setGuidanceList] = useState<PrototypeGuidance[]>([]);

  // Active items being focused in sub-views
  const [activeEvaluation, setActiveEvaluation] = useState<IdeaEvaluation | null>(null);
  const [activeGuidance, setActiveGuidance] = useState<PrototypeGuidance | null>(null);
  const [activeMarketReport, setActiveMarketReport] = useState<MarketAnalysisReport | null>(null);

  // Owner Profile state (Rohit / Creator) with persistence
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile>(() => {
    return {
      name: "Rohit",
      className: "11th",
      age: "15",
      appTitle: "ASCEND STUDY / CORE AI",
    };
  });

  // Active User Profile for AI personalization
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("core_ai_user_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed parsing user profile:", e);
      }
    }
    return {
      name: "",
      occupation: "",
      age: "",
      details: "",
      isSetupCompleted: false,
    };
  });

  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState<boolean>(false);
  const [profileSaveToast, setProfileSaveToast] = useState<boolean>(false);
  const [userProfileSaveToast, setUserProfileSaveToast] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("core_ai_owner_profile", JSON.stringify(ownerProfile));
  }, [ownerProfile]);

  useEffect(() => {
    localStorage.setItem("core_ai_user_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  const handleSaveOwnerProfile = (newProfile: OwnerProfile) => {
    setOwnerProfile(newProfile);
    localStorage.setItem("core_ai_owner_profile", JSON.stringify(newProfile));
    playUiSound("toggle", soundEffectsEnabled);
    setProfileSaveToast(true);
    setTimeout(() => setProfileSaveToast(false), 3500);
  };

  const handleSaveUserProfile = (newProfile: UserProfile) => {
    const updated = { ...newProfile, isSetupCompleted: true };
    setUserProfile(updated);
    localStorage.setItem("core_ai_user_profile", JSON.stringify(updated));
    playUiSound("toggle", soundEffectsEnabled);
    setUserProfileSaveToast(true);
    setTimeout(() => setUserProfileSaveToast(false), 3500);
  };

  // Custom Preferences
  const [customInstructions, setCustomInstructions] = useState<CustomInstructions>({
    targetDomain: "General Startup",
    forbiddenTopics: "none",
    personalityStyle: "objective",
    codePreference: "React 19 & Tailwind v4",
  });

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    neonGlowStrength: "vibrant",
    baseContrast: "normal",
    accentColor: "#00e5ff",
  });

  // Dark Mode state with persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("core_ai_dark_mode");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem("core_ai_dark_mode", isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Multilingual / App Language state with persistence
  const [currentLanguage, setCurrentLanguage] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem("core_ai_language");
    if (saved && (saved === "en" || saved === "hi" || saved === "hinglish" || saved === "es" || saved === "fr" || saved === "de" || saved === "ja")) {
      return saved as AppLanguage;
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("core_ai_language", currentLanguage);
  }, [currentLanguage]);

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;


  // Chat sessions state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");

  // Input states
  const [inputText, setInputText] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  // Loading/Processing flags
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isGeneratingGuidance, setIsGeneratingGuidance] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [isGeneratingMockup, setIsGeneratingMockup] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Auto-dismiss API error alerts after 8 seconds
  useEffect(() => {
    if (apiError) {
      const timer = setTimeout(() => {
        setApiError(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [apiError]);

  // Audio / Speech settings
  const [voicePlaybackEnabled, setVoicePlaybackEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [speechLoadingId, setSpeechLoadingId] = useState<string | null>(null);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const activeSpeakingMessageSnippet = useMemo(() => {
    if (!speakingMessageId) return undefined;
    const currentActiveMessages = getActiveMessages();
    const msg = currentActiveMessages.find((m) => m.id === speakingMessageId);
    return msg ? msg.text : undefined;
  }, [speakingMessageId, chatSessions, activeSessionId]);

  // Active Session Tag Editing state
  const [activeTagPopoverOpen, setActiveTagPopoverOpen] = useState(false);
  const [headerNewTagInput, setHeaderNewTagInput] = useState("");
  const [isPinnedSectionOpen, setIsPinnedSectionOpen] = useState<boolean>(true);
  const [copiedAllPinned, setCopiedAllPinned] = useState<boolean>(false);
  const [pinnedRoleFilter, setPinnedRoleFilter] = useState<"all" | "user" | "model">("all");
  const [pinnedSortOrder, setPinnedSortOrder] = useState<"oldest" | "newest">("oldest");
  const [pinnedViewMode, setPinnedViewMode] = useState<"list" | "grid">("list");
  const [customPinnedOrder, setCustomPinnedOrder] = useState<string[]>([]);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState<boolean>(true);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; sessionId: string; title: string } | null>(null);

  // Thread Summary State
  const [threadSummaryModalOpen, setThreadSummaryModalOpen] = useState(false);
  const [isSummarizingThread, setIsSummarizingThread] = useState(false);
  const [threadSummaryText, setThreadSummaryText] = useState("");
  const [threadSummarySession, setThreadSummarySession] = useState<{ id: string; title: string; messageCount: number } | null>(null);
  const [threadSummaryCopied, setThreadSummaryCopied] = useState(false);

  const handleSummarizeThread = async (targetSessionId?: string) => {
    const session = targetSessionId
      ? chatSessions.find((s) => s.id === targetSessionId)
      : getActiveSession();

    if (!session) return;

    playUiSound("toggle", soundEffectsEnabled);
    setThreadSummarySession({
      id: session.id,
      title: session.title,
      messageCount: session.messages.length,
    });
    setThreadSummaryText("");
    setThreadSummaryCopied(false);
    setThreadSummaryModalOpen(true);

    if (session.messages.length === 0) {
      setThreadSummaryText("📌 **Thread Summary**: This chat session has no messages yet. Start a conversation to generate an executive thread summary.");
      setIsSummarizingThread(false);
      return;
    }

    setIsSummarizingThread(true);
    try {
      const res = await fetch("/api/summarize-thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: session.messages,
          sessionTitle: session.title,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to summarize chat thread.");
      }

      const data = await res.json();
      setThreadSummaryText(data.summary || "Summary generated successfully.");
    } catch (e: any) {
      console.error(e);
      setThreadSummaryText(`⚠️ **Thread Summary Error**: ${formatApiErrorMessage(e)}`);
    } finally {
      setIsSummarizingThread(false);
    }
  };

  const handleCopyThreadSummary = () => {
    if (!threadSummaryText) return;
    navigator.clipboard.writeText(threadSummaryText).then(() => {
      playUiSound("copy", soundEffectsEnabled);
      setThreadSummaryCopied(true);
      setTimeout(() => setThreadSummaryCopied(false), 2000);
    });
  };

  const handleDownloadThreadSummary = () => {
    if (!threadSummaryText || !threadSummarySession) return;
    playUiSound("toggle", soundEffectsEnabled);
    const element = document.createElement("a");
    const file = new Blob([threadSummaryText], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `${threadSummarySession.title.replace(/[^a-zA-Z0-9]/g, "_")}_Executive_Summary.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleInsertSummaryIntoChat = () => {
    if (!threadSummarySession || !threadSummaryText) return;
    playUiSound("toggle", soundEffectsEnabled);

    const summaryMsg: ChatMessage = {
      id: "msg_summary_" + Date.now(),
      role: "model",
      text: `📌 **Executive Thread Summary** (Context Switching Note):\n\n${threadSummaryText}`,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatSessions((prev) =>
      prev.map((s) =>
        s.id === threadSummarySession.id
          ? { ...s, messages: [...s.messages, summaryMsg] }
          : s
      )
    );

    setActiveSessionId(threadSummarySession.id);
    setActiveView("chat");
    setThreadSummaryModalOpen(false);
  };

  const handleCopyAllPinnedMessages = (pinnedMsgs: ChatMessage[]) => {
    if (pinnedMsgs.length === 0) return;
    const formattedText = pinnedMsgs
      .map((m) => `[${m.role === "user" ? "You" : "CORE AI"} - ${m.timestamp}]\n${m.text}`)
      .join("\n\n---\n\n");

    navigator.clipboard.writeText(formattedText)
      .then(() => {
        playUiSound("copy", soundEffectsEnabled);
        setCopiedAllPinned(true);
        setTimeout(() => setCopiedAllPinned(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy pinned messages: ", err);
      });
  };

  const handleUpdateSessionTags = (sessionId: string, newTags: string[]) => {
    setChatSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId ? { ...session, tags: newTags } : session
      )
    );
  };

  const handleCopyMessage = useCallback((msgId: string, text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedMessageId(msgId);
        setTimeout(() => {
          setCopiedMessageId(null);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }, []);

  const handleToggleReaction = useCallback((messageId: string, emoji: string) => {
    setChatSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.id !== activeSessionId) return session;
        return {
          ...session,
          messages: session.messages.map((msg) => {
            if (msg.id !== messageId) return msg;
            const currentReactions = msg.reactions || [];
            const hasReaction = currentReactions.includes(emoji);
            const updatedReactions = hasReaction
              ? currentReactions.filter((r) => r !== emoji)
              : [...currentReactions, emoji];
            return {
              ...msg,
              reactions: updatedReactions,
            };
          }),
        };
      })
    );
  }, [activeSessionId]);

  const handleTogglePinMessage = useCallback((messageId: string) => {
    setChatSessions((prevSessions) => {
      const activeSession = prevSessions.find((s) => s.id === activeSessionId);
      const targetMsg = activeSession?.messages.find((m) => m.id === messageId);
      const willPin = !targetMsg?.isPinned;
      playUiSound(willPin ? "pin" : "unpin", soundEffectsEnabled);

      return prevSessions.map((session) => {
        if (session.id !== activeSessionId) return session;
        return {
          ...session,
          messages: session.messages.map((msg) => {
            if (msg.id !== messageId) return msg;
            return {
              ...msg,
              isPinned: !msg.isPinned,
            };
          }),
        };
      });
    });
  }, [activeSessionId, soundEffectsEnabled]);

  const handleScrollToMessage = (messageId: string) => {
    const el = document.getElementById(`msg-bubble-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-cyan-400", "rounded-2xl", "transition-all");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-cyan-400", "rounded-2xl");
      }, 2000);
    }
  };

  const applyFormatting = (style: "bold" | "italic" | "code") => {
    if (!chatInputRef.current) return;
    const input = chatInputRef.current;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const text = inputText;

    const selectedText = text.substring(start, end);
    let prefix = "";
    let suffix = "";
    let placeholder = "";

    if (style === "bold") {
      prefix = "**";
      suffix = "**";
      placeholder = "bold text";
    } else if (style === "italic") {
      prefix = "*";
      suffix = "*";
      placeholder = "italic text";
    } else if (style === "code") {
      prefix = "```\n";
      suffix = "\n```";
      placeholder = "code block";
    }

    const contentToWrap = selectedText || placeholder;
    const replacement = `${prefix}${contentToWrap}${suffix}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);
    setInputText(newText);

    // Focus and select the newly inserted placeholder text or wrapped text
    setTimeout(() => {
      input.focus();
      if (!selectedText) {
        // Select the placeholder text so user can just start typing to replace it
        const selStart = start + prefix.length;
        const selEnd = selStart + placeholder.length;
        input.setSelectionRange(selStart, selEnd);
      } else {
        // Put the cursor at the end of the formatted block
        const newPos = start + replacement.length;
        input.setSelectionRange(newPos, newPos);
      }
    }, 50);
  };

  const messageEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);
  const speechKeepAliveRef = useRef<any>(null);
  const speechRequestIdRef = useRef<number>(0);
  const activeAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const activeAudioCtxRef = useRef<AudioContext | null>(null);
  const activeFetchAbortRef = useRef<AbortController | null>(null);

  const activeSessionIdRef = useRef<string>(activeSessionId);
  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  const hasInitializedSessionsRef = useRef<boolean>(false);

  // Snapshot tracking refs to eliminate infinite write feedback loops & stream exhaustion
  const lastRemoteSessionsJsonRef = useRef<string>("");
  const lastRemoteIdeasJsonRef = useRef<string>("");
  const lastRemoteGuidanceJsonRef = useRef<string>("");
  const lastRemoteInstructionsJsonRef = useRef<string>("");
  const lastRemoteThemeJsonRef = useRef<string>("");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto Chat Name Selector state
  const [autoNameModalOpen, setAutoNameModalOpen] = useState<boolean>(false);
  const [autoNameSessionId, setAutoNameSessionId] = useState<string>("");
  const [autoNameOptions, setAutoNameOptions] = useState<string[]>([]);
  const [isFetchingAutoNames, setIsFetchingAutoNames] = useState<boolean>(false);
  const [customTitleInput, setCustomTitleInput] = useState<string>("");

  // Prototype button long press ref
  const prototypeLongPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPrototypeLongPressRef = useRef<boolean>(false);

  const handleResetPrototypeView = () => {
    playUiSound("toggle", soundEffectsEnabled);
    setPrototypeIconRotation(0);
    setActiveView("chat");
  };

  const handlePrototypePointerDown = () => {
    isPrototypeLongPressRef.current = false;
    if (prototypeLongPressTimerRef.current) clearTimeout(prototypeLongPressTimerRef.current);
    prototypeLongPressTimerRef.current = setTimeout(() => {
      isPrototypeLongPressRef.current = true;
      handleResetPrototypeView();
    }, 500);
  };

  const handlePrototypePointerUpOrLeave = () => {
    if (prototypeLongPressTimerRef.current) {
      clearTimeout(prototypeLongPressTimerRef.current);
      prototypeLongPressTimerRef.current = null;
    }
  };

  // User details
  const userEmail = "heenayadav325220@gmail.com";

  // Initialize first chat session on load - ensure default view is always "chat" with a clean "New Chat" active session
  useEffect(() => {
    setActiveView("chat");

    // Load state from localStorage if available
    const cachedSessions = localStorage.getItem("core_ai_sessions");
    const cachedIdeas = localStorage.getItem("core_ai_ideas");
    const cachedGuidance = localStorage.getItem("core_ai_guidance");

    if (cachedSessions) {
      try {
        const parsed: ChatSession[] = JSON.parse(cachedSessions);
        if (parsed.length > 0) {
          // Check if there is an existing empty session (messages.length === 0)
          const emptySession = parsed.find((s) => s.messages.length === 0);
          if (emptySession) {
            // Keep empty session at the top and activate it for default screen: New Chat
            const rest = parsed.filter((s) => s.id !== emptySession.id);
            const reordered = [emptySession, ...rest];
            setChatSessions(reordered);
            setActiveSessionId(emptySession.id);
          } else {
            // All existing sessions contain messages -> prepend a new empty session for default New Chat screen
            const brandNewSession: ChatSession = {
              id: "session_" + Date.now(),
              title: "New Conversation",
              messages: [],
              activeMode: "automatic",
              timestamp: new Date().toLocaleTimeString(),
            };
            setChatSessions([brandNewSession, ...parsed]);
            setActiveSessionId(brandNewSession.id);
          }
        } else {
          // No sessions exist yet -> create initial new session
          const initialSession: ChatSession = {
            id: "session_" + Date.now(),
            title: "New Conversation",
            messages: [],
            activeMode: "automatic",
            timestamp: new Date().toLocaleTimeString(),
          };
          setChatSessions([initialSession]);
          setActiveSessionId(initialSession.id);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // First time app launch -> initialize with clean new conversation
      const firstSession: ChatSession = {
        id: "session_" + Date.now(),
        title: "New Conversation",
        messages: [],
        activeMode: "automatic",
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatSessions([firstSession]);
      setActiveSessionId(firstSession.id);
    }

    if (cachedIdeas) {
      try {
        setIdeas(JSON.parse(cachedIdeas));
      } catch (e) {
        console.error(e);
      }
    }

    if (cachedGuidance) {
      try {
        setGuidanceList(JSON.parse(cachedGuidance));
      } catch (e) {
        console.error(e);
      }
    }

    const cachedTheme = localStorage.getItem("core_ai_theme");
    if (cachedTheme) {
      try {
        setThemeSettings(JSON.parse(cachedTheme));
      } catch (e) {
        console.error(e);
      }
    }

    // Set up Web Speech Recognition if supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListeningVoice(true);
      };

      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInputText((prev) => (prev ? prev + " " + transcript : transcript));
      };

      rec.onerror = (err: any) => {
        console.error("Speech Recognition Error:", err);
        setIsListeningVoice(false);
      };

      rec.onend = () => {
        setIsListeningVoice(false);
      };

      speechRecognitionRef.current = rec;
    }
  }, []);

  // Subscribe to real-time Cloud Firestore database updates
  useEffect(() => {
    const unsubSessions = subscribeChatSessions((firestoreSessions) => {
      if (firestoreSessions && firestoreSessions.length > 0) {
        lastRemoteSessionsJsonRef.current = JSON.stringify(firestoreSessions);

        if (!hasInitializedSessionsRef.current) {
          hasInitializedSessionsRef.current = true;
          // Initial app load: Ensure we land on a new clean chat session
          const existingEmpty = firestoreSessions.find((s) => s.messages.length === 0);
          if (existingEmpty) {
            const rest = firestoreSessions.filter((s) => s.id !== existingEmpty.id);
            setActiveSessionId(existingEmpty.id);
            setChatSessions([existingEmpty, ...rest]);
          } else {
            const newEmpty: ChatSession = {
              id: "session_" + Date.now(),
              title: "New Conversation",
              messages: [],
              activeMode: "automatic",
              timestamp: new Date().toLocaleTimeString(),
            };
            setActiveSessionId(newEmpty.id);
            setChatSessions([newEmpty, ...firestoreSessions]);
          }
        } else {
          // Live updates: update messages while preserving active conversation selection
          setChatSessions((prevSessions) => {
            const unsavedEmptySessions = prevSessions.filter(
              (p) => p.messages.length === 0 && !firestoreSessions.some((f) => f.id === p.id)
            );
            const combined = [...unsavedEmptySessions, ...firestoreSessions];
            if (combined.length === 0) {
              const fallback: ChatSession = {
                id: "session_" + Date.now(),
                title: "New Conversation",
                messages: [],
                activeMode: "automatic",
                timestamp: new Date().toLocaleTimeString(),
              };
              setActiveSessionId(fallback.id);
              return [fallback];
            }
            return combined;
          });
        }
      } else {
        if (!hasInitializedSessionsRef.current) {
          hasInitializedSessionsRef.current = true;
          const newEmpty: ChatSession = {
            id: "session_" + Date.now(),
            title: "New Conversation",
            messages: [],
            activeMode: "automatic",
            timestamp: new Date().toLocaleTimeString(),
          };
          setActiveSessionId(newEmpty.id);
          setChatSessions([newEmpty]);
        } else {
          setChatSessions((prevSessions) => {
            const unsavedEmptySessions = prevSessions.filter(
              (p) => p.messages.length === 0
            );
            if (unsavedEmptySessions.length === 0) {
              const fallback: ChatSession = {
                id: "session_" + Date.now(),
                title: "New Conversation",
                messages: [],
                activeMode: "automatic",
                timestamp: new Date().toLocaleTimeString(),
              };
              setActiveSessionId(fallback.id);
              return [fallback];
            }
            return unsavedEmptySessions;
          });
        }
      }
    });

    const unsubIdeas = subscribeIdeas((firestoreIdeas) => {
      if (firestoreIdeas && firestoreIdeas.length > 0) {
        lastRemoteIdeasJsonRef.current = JSON.stringify(firestoreIdeas);
        setIdeas(firestoreIdeas);
      }
    });

    const unsubGuidance = subscribeGuidance((firestoreGuidance) => {
      if (firestoreGuidance && firestoreGuidance.length > 0) {
        lastRemoteGuidanceJsonRef.current = JSON.stringify(firestoreGuidance);
        setGuidanceList(firestoreGuidance);
      }
    });

    const unsubInstructions = subscribeCustomInstructions((inst) => {
      if (inst) {
        lastRemoteInstructionsJsonRef.current = JSON.stringify(inst);
        setCustomInstructions(inst);
      }
    });

    const unsubTheme = subscribeThemeSettings((th) => {
      if (th) {
        lastRemoteThemeJsonRef.current = JSON.stringify(th);
        setThemeSettings(th);
      }
    });

    return () => {
      unsubSessions();
      unsubIdeas();
      unsubGuidance();
      unsubInstructions();
      unsubTheme();
    };
  }, []);

  // Sync sessions to Firestore real database and localStorage as offline cache with debouncing & loop guards
  useEffect(() => {
    if (chatSessions.length > 0) {
      const currentJson = JSON.stringify(chatSessions);

      try {
        localStorage.setItem("core_ai_sessions", currentJson);
      } catch (err) {
        console.warn("Storage quota limit reached; applying auto-pruning to preserve storage scalability:", err);
        const prunedSessions = chatSessions.map((session, idx) => {
          if (idx < chatSessions.length - 1) {
            return {
              ...session,
              messages: session.messages.map((m) =>
                m.imageAttached ? { ...m, imageAttached: undefined } : m
              ),
            };
          }
          return session;
        });
        try {
          localStorage.setItem("core_ai_sessions", JSON.stringify(prunedSessions));
        } catch (fallbackErr) {
          console.error("Failed to save even after pruning:", fallbackErr);
        }
      }

      // Guard: Skip if data came from remote snapshot or hasn't changed
      if (currentJson === lastRemoteSessionsJsonRef.current) {
        return;
      }

      // Debounce writing to Firestore to prevent write stream exhaustion during rapid typing/streaming
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        lastRemoteSessionsJsonRef.current = currentJson;
        chatSessions.forEach((session) => {
          saveChatSessionToFirestore(session);
        });
      }, 1200);
    }
  }, [chatSessions]);

  // Sync ideas to Firestore real database and localStorage safely
  useEffect(() => {
    if (ideas.length > 0) {
      const currentJson = JSON.stringify(ideas);
      try {
        localStorage.setItem("core_ai_ideas", currentJson);
      } catch (e) {
        console.warn("Unable to persist ideas to localStorage:", e);
      }

      if (currentJson !== lastRemoteIdeasJsonRef.current) {
        lastRemoteIdeasJsonRef.current = currentJson;
        ideas.forEach((idea) => {
          saveIdeaToFirestore(idea);
        });
      }
    }
  }, [ideas]);

  // Sync guidance list to Firestore real database and localStorage safely
  useEffect(() => {
    if (guidanceList.length > 0) {
      const currentJson = JSON.stringify(guidanceList);
      try {
        localStorage.setItem("core_ai_guidance", currentJson);
      } catch (e) {
        console.warn("Unable to persist guidance to localStorage:", e);
      }

      if (currentJson !== lastRemoteGuidanceJsonRef.current) {
        lastRemoteGuidanceJsonRef.current = currentJson;
        guidanceList.forEach((guidance) => {
          saveGuidanceToFirestore(guidance);
        });
      }
    }
  }, [guidanceList]);

  // Sync custom instructions to Firestore real database
  useEffect(() => {
    const currentJson = JSON.stringify(customInstructions);
    if (currentJson !== lastRemoteInstructionsJsonRef.current) {
      lastRemoteInstructionsJsonRef.current = currentJson;
      saveCustomInstructionsToFirestore(customInstructions);
    }
  }, [customInstructions]);

  // Sync themeSettings to Firestore real database and CSS variables dynamically
  useEffect(() => {
    const currentJson = JSON.stringify(themeSettings);
    if (currentJson !== lastRemoteThemeJsonRef.current) {
      lastRemoteThemeJsonRef.current = currentJson;
      saveThemeSettingsToFirestore(themeSettings);
    }
    localStorage.setItem("core_ai_theme", JSON.stringify(themeSettings));
    
    const { accentColor, neonGlowStrength } = themeSettings;
    document.documentElement.style.setProperty("--color-neon-blue", accentColor);
    
    let opacityMultiplier = 1.0;
    let blurMultiplier = 1.0;
    if (neonGlowStrength === "soft") {
      opacityMultiplier = 0.4;
      blurMultiplier = 0.6;
    } else if (neonGlowStrength === "extreme") {
      opacityMultiplier = 2.0;
      blurMultiplier = 1.5;
    }
    
    document.documentElement.style.setProperty("--neon-glow-opacity-multiplier", opacityMultiplier.toString());
    document.documentElement.style.setProperty("--neon-glow-blur-multiplier", blurMultiplier.toString());
  }, [themeSettings]);

  // Get active session
  const getActiveSession = (): ChatSession | undefined => {
    return chatSessions.find((s) => s.id === activeSessionId);
  };

  const getActiveMessages = (): ChatMessage[] => {
    const session = getActiveSession();
    return session ? session.messages : [];
  };

  const getActiveMode = (): UIMode => {
    const session = getActiveSession();
    return session ? session.activeMode : "automatic";
  };

  const activeMessagesLength = getActiveMessages().length;
  const allPinnedMessages = getActiveMessages().filter((m) => m.isPinned);
  const pinnedMessages = useMemo(() => {
    let list = [...allPinnedMessages];
    if (pinnedRoleFilter !== "all") {
      list = list.filter((m) => m.role === pinnedRoleFilter);
    }
    if (customPinnedOrder.length > 0) {
      const orderMap = new Map<string, number>(customPinnedOrder.map((id, index) => [id, index]));
      list.sort((a, b) => {
        const indexA: number = orderMap.get(a.id) ?? 9999;
        const indexB: number = orderMap.get(b.id) ?? 9999;
        return indexA - indexB;
      });
    }
    if (pinnedSortOrder === "newest") {
      list.reverse();
    }
    return list;
  }, [allPinnedMessages, pinnedRoleFilter, pinnedSortOrder, customPinnedOrder]);

  // Handle auto-scroll to latest chat message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessagesLength, activeSessionId]);

  // Auto-generate session title based on first three messages of a new session
  const activeSession = chatSessions.find((s) => s.id === activeSessionId);
  const activeSessionMessagesCount = activeSession?.messages.length || 0;
  const activeSessionTitleAutoGenerated = activeSession?.titleAutoGenerated || false;

  useEffect(() => {
    if (!activeSessionId) return;

    if (activeSessionMessagesCount >= 1 && !activeSessionTitleAutoGenerated) {
      // Instantly mark as auto-generating to avoid duplicate requests
      setChatSessions((prev) => {
        const targetSession = prev.find((s) => s.id === activeSessionId);
        if (!targetSession || targetSession.titleAutoGenerated) return prev;

        fetch("/api/generate-title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: targetSession.messages }),
        })
          .then((res) => {
            if (!res.ok) throw new Error("Title generation failed");
            return res.json();
          })
          .then((data) => {
            if (data.title) {
              setChatSessions((currentSessions) =>
                currentSessions.map((s) =>
                  s.id === targetSession.id ? { ...s, title: data.title, titleAutoGenerated: true } : s
                )
              );
            }
          })
          .catch((err) => {
            console.warn("Auto title generation failed:", err);
          });

        return prev.map((s) =>
          s.id === activeSessionId ? { ...s, titleAutoGenerated: true } : s
        );
      });
    }
  }, [activeSessionId, activeSessionMessagesCount, activeSessionTitleAutoGenerated]);

  // Auto Chat Name Selector Helper Functions
  const handleOpenAutoNameSelector = (sessionId?: string) => {
    const targetId = sessionId || activeSessionId;
    if (!targetId) return;
    setAutoNameSessionId(targetId);
    const targetSession = chatSessions.find((s) => s.id === targetId);
    const initialTitle = targetSession ? targetSession.title : "";
    setCustomTitleInput(initialTitle);
    setAutoNameModalOpen(true);

    if (targetSession && targetSession.messages.length > 0) {
      fetchAutoNameOptions(targetSession.messages);
    } else {
      setAutoNameOptions([
        "Core Strategy Session",
        "Technical Architecture Spec",
        "Venture Prototyping Canvas",
        "Startup Evaluation Thread"
      ]);
    }
  };

  const fetchAutoNameOptions = async (messages: ChatMessage[]) => {
    setIsFetchingAutoNames(true);
    try {
      const res = await fetch("/api/generate-title-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      if (!res.ok) throw new Error("Title options error");
      const data = await res.json();
      if (data.options && Array.isArray(data.options) && data.options.length > 0) {
        setAutoNameOptions(data.options);
      } else {
        throw new Error("Empty options array");
      }
    } catch (err) {
      console.warn("Failed to fetch auto name options:", err);
      setAutoNameOptions([
        "Core AI Strategy Thread",
        "Technical Architecture Plan",
        "Rapid Prototyping Workspace",
        "Interactive AI Canvas"
      ]);
    } finally {
      setIsFetchingAutoNames(false);
    }
  };

  const handleApplySessionTitle = (targetSessionId: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    playUiSound("toggle", soundEffectsEnabled);
    setChatSessions((prev) =>
      prev.map((s) => (s.id === targetSessionId ? { ...s, title: trimmed, titleAutoGenerated: true } : s))
    );
    setAutoNameModalOpen(false);
  };



  // Create a brand new chat thread
  const handleCreateNewSession = () => {
    const newSession: ChatSession = {
      id: "session_" + Date.now(),
      title: "New Conversation",
      messages: [],
      activeMode: "automatic",
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  // Open delete confirm modal
  const handleOpenDeleteModal = (sessionId?: string) => {
    const targetId = sessionId || activeSessionId;
    const session = chatSessions.find((s) => s.id === targetId);
    if (!session) return;
    setDeleteConfirmModal({
      isOpen: true,
      sessionId: session.id,
      title: session.title || "Conversation",
    });
  };

  // Delete a chat thread
  const handleDeleteSession = (sessionId: string) => {
    playUiSound("toggle", soundEffectsEnabled);
    setChatSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const newSession: ChatSession = {
          id: "session_" + Date.now(),
          title: "New Conversation",
          messages: [],
          activeMode: "automatic",
          timestamp: new Date().toLocaleTimeString(),
        };
        setActiveSessionId(newSession.id);
        return [newSession];
      }
      if (sessionId === activeSessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });

    try {
      const saved = localStorage.getItem("core_ai_sessions");
      if (saved) {
        const parsed: ChatSession[] = JSON.parse(saved);
        const remaining = parsed.filter((s) => s.id !== sessionId);
        localStorage.setItem("core_ai_sessions", JSON.stringify(remaining));
      }
    } catch (e) {
      console.warn("Storage update error on session delete:", e);
    }

    deleteChatSessionFromFirestore(sessionId);
  };

  // Ensure there's always at least one active session
  const chatSessionsCount = chatSessions.length;
  useEffect(() => {
    if (chatSessionsCount === 0) {
      handleCreateNewSession();
    }
  }, [chatSessionsCount]);

  // Toggle active mode (Guider, Companion, Automatic)
  const handleUpdateActiveMode = (mode: UIMode) => {
    setChatSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, activeMode: mode } : s))
    );
  };

  // Image attachment loader
  const handleTriggerAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Only image attachments (PNG, JPEG, WebP) are currently supported.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage({
          base64: (reader.result as string).split(",")[1],
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Speech Recognition control
  const handleToggleVoiceInput = () => {
    if (!speechRecognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use Chrome, Safari, or Edge.");
      return;
    }

    if (isListeningVoice) {
      speechRecognitionRef.current.stop();
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      
      // Set speech recognition language dynamically based on active app language
      if (currentLanguage === "hi" || currentLanguage === "hinglish") {
        speechRecognitionRef.current.lang = "hi-IN";
      } else if (currentLanguage === "es") {
        speechRecognitionRef.current.lang = "es-ES";
      } else if (currentLanguage === "fr") {
        speechRecognitionRef.current.lang = "fr-FR";
      } else if (currentLanguage === "de") {
        speechRecognitionRef.current.lang = "de-DE";
      } else if (currentLanguage === "ja") {
        speechRecognitionRef.current.lang = "ja-JP";
      } else {
        speechRecognitionRef.current.lang = "en-US";
      }

      speechRecognitionRef.current.start();
    }
  };

  // Helper to sanitize markdown, code blocks, and emojis out of speech synthesis text
  const sanitizeTextForSpeech = (rawText: string): string => {
    return rawText
      .replace(/```[\s\S]*?```/g, " [कोड या डेटा] ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*#_~>]/g, " ")
      .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Emoji_Component}]/gu, "")
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{FE0F}]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Stop any active speech synthesis or Web Audio playback cleanly and invalidate request token
  const handleStopSpeaking = useCallback(() => {
    speechRequestIdRef.current += 1;
    if (activeFetchAbortRef.current) {
      activeFetchAbortRef.current.abort();
      activeFetchAbortRef.current = null;
    }
    if (speechKeepAliveRef.current) {
      clearInterval(speechKeepAliveRef.current);
      speechKeepAliveRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    try {
      if (activeAudioSourceRef.current) {
        activeAudioSourceRef.current.stop();
        activeAudioSourceRef.current = null;
      }
      if (activeAudioCtxRef.current && activeAudioCtxRef.current.state !== "closed") {
        activeAudioCtxRef.current.close();
        activeAudioCtxRef.current = null;
      }
    } catch (err) {
      console.warn("Error stopping active AudioContext audio source:", err);
    }
    setIsSpeaking(false);
    setSpeakingMessageId(null);
    setSpeechLoadingId(null);
  }, []);

  // Speak response out loud using high-fidelity Gemini AI TTS (natural Kore voice) with fallback
  const handleSpeakText = async (text: string, msgId?: string) => {
    // Toggle off if currently speaking or loading for this same message
    if (
      (isSpeaking || speechLoadingId) &&
      msgId &&
      (speakingMessageId === msgId || speechLoadingId === msgId)
    ) {
      handleStopSpeaking();
      return;
    }

    // Always stop any current speech cleanly and increment request ID
    handleStopSpeaking();

    const currentReqId = speechRequestIdRef.current;
    if (msgId) {
      setSpeechLoadingId(msgId);
    }

    const cleanSpeechText = sanitizeTextForSpeech(text);
    if (!cleanSpeechText.trim()) {
      setSpeechLoadingId(null);
      return;
    }

    // Limit text snippet for sub-second Gemini TTS processing
    let speechPayload = cleanSpeechText;
    if (speechPayload.length > 900) {
      const truncated = speechPayload.slice(0, 900);
      const lastBoundary = Math.max(
        truncated.lastIndexOf(". "),
        truncated.lastIndexOf("! "),
        truncated.lastIndexOf("? "),
        truncated.lastIndexOf("। ")
      );
      if (lastBoundary > 200) {
        speechPayload = truncated.slice(0, lastBoundary + 1);
      } else {
        speechPayload = truncated;
      }
    }

    const controller = new AbortController();
    activeFetchAbortRef.current = controller;

    try {
      const response = await fetch("/api/generate-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: speechPayload,
          mode: getActiveMode() === "guider" ? "robotic" : "human",
          language: currentLanguage,
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`TTS endpoint returned status ${response.status}`);

      const data = await response.json();
      if (speechRequestIdRef.current !== currentReqId) return;

      const base64Audio = data.audio;
      if (base64Audio) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        activeAudioCtxRef.current = audioCtx;

        const binary = atob(base64Audio);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }

        const handlePlaybackEnded = () => {
          activeAudioSourceRef.current = null;
          if (activeAudioCtxRef.current) {
            try {
              if (activeAudioCtxRef.current.state !== "closed") {
                activeAudioCtxRef.current.close();
              }
            } catch (e) {}
            activeAudioCtxRef.current = null;
          }
          if (speechRequestIdRef.current === currentReqId) {
            setIsSpeaking(false);
            setSpeakingMessageId(null);
          }
        };

        const wrapPcmWithWavHeader = (pcmBytes: Uint8Array, sampleRate: number): Uint8Array => {
          const buffer = new ArrayBuffer(44 + pcmBytes.length);
          const view = new DataView(buffer);
          const writeString = (v: DataView, offset: number, str: string) => {
            for (let i = 0; i < str.length; i++) {
              v.setUint8(offset + i, str.charCodeAt(i));
            }
          };
          writeString(view, 0, "RIFF");
          view.setUint32(4, 36 + pcmBytes.length, true);
          writeString(view, 8, "WAVE");
          writeString(view, 12, "fmt ");
          view.setUint32(16, 16, true);
          view.setUint16(20, 1, true); // Raw PCM = 1
          view.setUint16(22, 1, true); // Mono = 1
          view.setUint32(24, sampleRate, true);
          view.setUint32(28, sampleRate * 2, true);
          view.setUint16(32, 2, true);
          view.setUint16(34, 16, true);
          writeString(view, 36, "data");
          view.setUint32(40, pcmBytes.length, true);

          const wavBytes = new Uint8Array(buffer);
          wavBytes.set(pcmBytes, 44);
          return wavBytes;
        };

        const wavBytes = wrapPcmWithWavHeader(bytes, 24000);

        audioCtx.decodeAudioData(
          wavBytes.buffer,
          (buffer) => {
            if (speechRequestIdRef.current !== currentReqId) return;
            setSpeechLoadingId(null);
            setIsSpeaking(true);
            if (msgId) setSpeakingMessageId(msgId);

            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.onended = handlePlaybackEnded;
            activeAudioSourceRef.current = source;
            source.start();
          },
          (err) => {
            console.warn("WAV decode failed, trying PCM-16 decoding fallback:", err);
            if (speechRequestIdRef.current !== currentReqId) return;
            try {
              const numSamples = Math.floor(bytes.length / 2);
              const dataView = new DataView(bytes.buffer);
              const audioBuffer = audioCtx.createBuffer(1, numSamples, 24000);
              const channelData = audioBuffer.getChannelData(0);
              for (let i = 0; i < numSamples; i++) {
                channelData[i] = dataView.getInt16(i * 2, true) / 32768.0;
              }
              setSpeechLoadingId(null);
              setIsSpeaking(true);
              if (msgId) setSpeakingMessageId(msgId);

              const source = audioCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioCtx.destination);
              source.onended = handlePlaybackEnded;
              activeAudioSourceRef.current = source;
              source.start();
            } catch (pcmErr) {
              console.error("PCM playback failed, falling back to Web Speech:", pcmErr);
              speakWebFallback(text, msgId, currentReqId);
            }
          }
        );
      } else {
        speakWebFallback(text, msgId, currentReqId);
      }
    } catch (e: any) {
      if (e?.name === "AbortError") {
        return;
      }
      console.warn("Gemini TTS fetch failed, falling back to Web Speech Synthesis:", e);
      if (speechRequestIdRef.current === currentReqId) {
        speakWebFallback(text, msgId, currentReqId);
      }
    }
  };

  const speakWebFallback = (text: string, msgId?: string, reqId?: number) => {
    const currentReqId = reqId ?? speechRequestIdRef.current;

    if (speechKeepAliveRef.current) {
      clearInterval(speechKeepAliveRef.current);
      speechKeepAliveRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const clean = sanitizeTextForSpeech(text);
    if (!clean.trim()) {
      if (speechRequestIdRef.current === currentReqId) {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      }
      return;
    }

    const mode = getActiveMode();
    const isHindi = /[\u0900-\u097F]/.test(clean) || currentLanguage === "hi" || currentLanguage === "hinglish";

    // Split text into distinct complete sentence/clause chunks
    const rawChunks = clean.match(/[^.!?\n]+[.!?\n]*/g) || [clean];
    const sentenceChunks: string[] = [];

    for (const raw of rawChunks) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      if (trimmed.length > 220) {
        const clauses = trimmed.split(/(?<=[,;:।])/g);
        for (const clause of clauses) {
          if (clause.trim()) sentenceChunks.push(clause.trim());
        }
      } else {
        sentenceChunks.push(trimmed);
      }
    }

    if (sentenceChunks.length === 0) {
      if (speechRequestIdRef.current === currentReqId) {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      }
      return;
    }

    const getMatchingVoice = (): SpeechSynthesisVoice | null => {
      if (typeof window === "undefined" || !window.speechSynthesis) return null;
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return null;

      if (isHindi) {
        return (
          voices.find(
            (v) =>
              v.lang.startsWith("hi") ||
              v.lang.includes("HI") ||
              v.name.toLowerCase().includes("hindi") ||
              v.name.toLowerCase().includes("kalpana") ||
              v.name.toLowerCase().includes("hemant") ||
              v.name.toLowerCase().includes("lekha")
          ) ||
          voices.find((v) => v.lang.includes("IN") || v.lang.includes("in")) ||
          null
        );
      } else {
        const langCode =
          currentLanguage === "es"
            ? "es"
            : currentLanguage === "fr"
            ? "fr"
            : currentLanguage === "de"
            ? "de"
            : currentLanguage === "ja"
            ? "ja"
            : "en";
        return voices.find((v) => v.lang.startsWith(langCode)) || null;
      }
    };

    let selectedVoice = getMatchingVoice();

    // Keep-alive heartbeat interval to prevent Chromium speech engine from timing out mid-speech
    speechKeepAliveRef.current = setInterval(() => {
      if (speechRequestIdRef.current !== currentReqId) {
        if (speechKeepAliveRef.current) clearInterval(speechKeepAliveRef.current);
        return;
      }
      if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 9000);

    const speakChunkAtIndex = (index: number) => {
      if (speechRequestIdRef.current !== currentReqId) return;

      if (index >= sentenceChunks.length) {
        if (speechKeepAliveRef.current) {
          clearInterval(speechKeepAliveRef.current);
          speechKeepAliveRef.current = null;
        }
        if (speechRequestIdRef.current === currentReqId) {
          setIsSpeaking(false);
          setSpeakingMessageId(null);
        }
        return;
      }

      if (!selectedVoice) {
        selectedVoice = getMatchingVoice();
      }

      const chunkText = sentenceChunks[index];
      const utterance = new SpeechSynthesisUtterance(chunkText);

      if (isHindi) {
        utterance.lang = "hi-IN";
      } else {
        utterance.lang =
          currentLanguage === "es"
            ? "es-ES"
            : currentLanguage === "fr"
            ? "fr-FR"
            : currentLanguage === "de"
            ? "de-DE"
            : currentLanguage === "ja"
            ? "ja-JP"
            : "en-US";
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      if (mode === "guider") {
        utterance.pitch = 0.9;
        utterance.rate = 1.0;
      } else if (mode === "companion") {
        utterance.pitch = 1.05;
        utterance.rate = 0.92;
      } else {
        utterance.pitch = 1.0;
        utterance.rate = 0.95;
      }

      utterance.onend = () => {
        if (speechRequestIdRef.current === currentReqId) {
          speakChunkAtIndex(index + 1);
        }
      };

      utterance.onerror = (err) => {
        console.warn(`Speech chunk ${index} error:`, err);
        if (speechRequestIdRef.current === currentReqId) {
          speakChunkAtIndex(index + 1);
        }
      };

      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.speak(utterance);
      } else {
        if (speechRequestIdRef.current === currentReqId) {
          setIsSpeaking(false);
          setSpeakingMessageId(null);
        }
      }
    };

    speakChunkAtIndex(0);
  };

  // Generate AI response for a message thread
  const generateAiResponseForThread = async (
    messages: ChatMessage[],
    sessionId: string,
    imagePayload?: { base64: string; mimeType: string }
  ) => {
    setIsAiProcessing(true);

    try {
      let endpoint = "/api/chat";
      let requestPayload: any = {
        messages: messages,
        activeMode: getActiveMode(),
        customInstructions: `APP OWNER & CREATOR (MALIK): Name: ${ownerProfile.name} | Class: ${ownerProfile.className} | Age: ${ownerProfile.age} | App: ${ownerProfile.appTitle} | Domain: ${customInstructions.targetDomain} | style: ${customInstructions.personalityStyle} | coding: ${customInstructions.codePreference} | Language instruction: ${getLanguageInstruction(currentLanguage)}`,
        userProfile: userProfile,
      };

      const lastMsg = messages[messages.length - 1];
      if (imagePayload) {
        endpoint = "/api/analyze-image";
        requestPayload = {
          base64Data: imagePayload.base64,
          mimeType: imagePayload.mimeType,
          prompt: lastMsg?.text || "Analyze this wireframe layout sketch and suggest user stories or tech implementation.",
        };
      } else if (lastMsg?.imageAttached) {
        endpoint = "/api/analyze-image";
        requestPayload = {
          base64Data: lastMsg.imageAttached.base64,
          mimeType: lastMsg.imageAttached.mimeType,
          prompt: lastMsg.text || "Analyze this wireframe layout sketch and suggest user stories or tech implementation.",
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Synthesis failed (HTTP ${res.status}).`);
      }

      const data = await res.json();
      const aiResponseText = data.text || data.analysis || "I've processed your input.";

      const aiMsgId = "msg_ai_" + Date.now();
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        role: "model",
        text: "",
        timestamp: new Date().toLocaleTimeString(),
        isTyping: true,
      };

      setChatSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, messages: [...s.messages, aiMsg] } : s))
      );

      let currentText = "";
      let currentIndex = 0;
      const totalLength = aiResponseText.length;
      const step = Math.max(1, Math.ceil(totalLength / 180));
      const intervalMs = 24;

      const typingTimer = setInterval(() => {
        if (currentIndex < totalLength) {
          const nextIndex = Math.min(currentIndex + step, totalLength);
          currentText += aiResponseText.substring(currentIndex, nextIndex);
          currentIndex = nextIndex;

          setChatSessions((prev) =>
            prev.map((s) => {
              if (s.id === sessionId) {
                return {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === aiMsgId ? { ...m, text: currentText } : m
                  ),
                };
              }
              return s;
            })
          );
        } else {
          clearInterval(typingTimer);
          setChatSessions((prev) =>
            prev.map((s) => {
              if (s.id === sessionId) {
                return {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === aiMsgId ? { ...m, text: aiResponseText, isTyping: false } : m
                  ),
                };
              }
              return s;
            })
          );
        }
      }, intervalMs);

      // Trigger automatic TTS if enabled
      if (voicePlaybackEnabled) {
        handleSpeakText(aiResponseText, aiMsgId);
      }
    } catch (err: any) {
      console.error(err);
      const friendlyAlert = formatApiErrorMessage(err);
      setApiError(friendlyAlert);
      const errorMsg: ChatMessage = {
        id: "msg_err_" + Date.now(),
        role: "model",
        text: `⚠️ **System Integration Alert**: ${friendlyAlert}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, messages: [...s.messages, errorMsg] } : s))
      );
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Handle general chat message submission
  const handleSendMessage = async (e?: React.FormEvent, forcedText?: string) => {
    if (e) e.preventDefault();
    const textToSend = forcedText || inputText;
    if (!textToSend.trim() && !attachedImage) return;

    // Reset input fields
    setInputText("");
    const imagePayload = attachedImage;
    setAttachedImage(null);

    const userMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
      ...(imagePayload ? { imageAttached: imagePayload } : {}),
    };

    // Append to messages list
    let updatedMessages = [...getActiveMessages(), userMsg];
    setChatSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: s.title === "New Conversation" ? textToSend.slice(0, 24) + "..." : s.title,
              messages: updatedMessages,
            }
          : s
      )
    );

    await generateAiResponseForThread(updatedMessages, activeSessionId, imagePayload || undefined);
  };

  // Handle user editing a previous message & re-generating response
  const handleEditMessage = useCallback(async (messageId: string, newText: string) => {
    const activeSession = chatSessions.find((s) => s.id === activeSessionId);
    if (!activeSession) return;

    const msgIndex = activeSession.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    const targetMsg = activeSession.messages[msgIndex];
    if (targetMsg.role !== "user") return;

    const updatedUserMsg: ChatMessage = {
      ...targetMsg,
      text: newText,
      timestamp: new Date().toLocaleTimeString(),
    };

    // Keep all messages before this edited user message, then add updated user message
    const trimmedMessages = [...activeSession.messages.slice(0, msgIndex), updatedUserMsg];

    setChatSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: trimmedMessages,
            }
          : s
      )
    );

    playUiSound("toggle", soundEffectsEnabled);

    await generateAiResponseForThread(trimmedMessages, activeSessionId, targetMsg.imageAttached || undefined);
  }, [chatSessions, activeSessionId, soundEffectsEnabled]);

  const activeViewRef = useRef(activeView);
  const handleSendMessageRef = useRef(handleSendMessage);
  const applyFormattingRef = useRef(applyFormatting);

  useEffect(() => {
    activeViewRef.current = activeView;
  }, [activeView]);

  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  useEffect(() => {
    applyFormattingRef.current = applyFormatting;
  }, [applyFormatting]);

  // Global keyboard shortcuts listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Ctrl + K / Cmd + K -> Focus chat input & Switch to chat view if not active
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (activeViewRef.current !== "chat") {
          setActiveView("chat");
        }
        setTimeout(() => {
          chatInputRef.current?.focus();
        }, 80);
      }

      // 2. Ctrl + Enter / Cmd + Enter -> Send chat message if input is focused
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (activeViewRef.current === "chat" && document.activeElement === chatInputRef.current) {
          e.preventDefault();
          handleSendMessageRef.current();
        }
      }

      // 3. Alt + 1 to 5 -> Switch Synthesizer Views
      if (e.altKey) {
        if (e.key === "1") {
          e.preventDefault();
          setActiveView("chat");
        } else if (e.key === "2") {
          e.preventDefault();
          setActiveView("evaluator");
        } else if (e.key === "3") {
          e.preventDefault();
          setActiveView("writer");
        }
      }

      // 4. Ctrl + B / Cmd + B -> Bold Selection
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        if (document.activeElement === chatInputRef.current) {
          e.preventDefault();
          applyFormattingRef.current("bold");
        }
      }

      // 5. Ctrl + I / Cmd + I -> Italic Selection
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
        if (document.activeElement === chatInputRef.current) {
          e.preventDefault();
          applyFormattingRef.current("italic");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleOpenMarketReportModal = useCallback((rep: MarketAnalysisReport) => {
    setActiveMarketReport(rep);
  }, []);

  // Direct Idea evaluation triggers
  const handleTriggerEvaluation = async (conceptText: string) => {
    setActiveView("chat");
    setIsAiProcessing(true);

    try {
      const res = await fetch("/api/analyze-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: conceptText,
          context: {
            domain: customInstructions.targetDomain,
            style: customInstructions.personalityStyle,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }

      const data = await res.json();
      const newEval: IdeaEvaluation = {
        ...data,
        id: "eval_" + Date.now(),
        idea: conceptText,
        title: data.title || "Project evaluation",
        timestamp: new Date().toLocaleDateString(),
      };

      setIdeas((prev) => [newEval, ...prev]);
      setActiveEvaluation(newEval);
      setActiveView("evaluator");

      // Log success inside chat as a confirmation message
      const systemConfirm: ChatMessage = {
        id: "msg_sys_" + Date.now(),
        role: "model",
        text: `📊 **CORE Evaluation Completed!** I have analyzed your concept: **"${newEval.title}"**. Viability Verdict assigned: **${newEval.overallScore}%**. You can view the full scorecard, strengths matrix, and technical recommendations inside the *Viability Evaluator*.`,
        timestamp: new Date().toLocaleTimeString(),
      };

      setChatSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, systemConfirm] } : s))
      );
    } catch (err: any) {
      console.error(err);
      setApiError(formatApiErrorMessage(err));
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Direct Step-by-step guidance timeline generation
  const handleTriggerGuidance = async (ideaText: string, titleText: string) => {
    setIsGeneratingGuidance(true);

    try {
      const res = await fetch("/api/generate-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: ideaText,
          title: titleText,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }

      const data = await res.json();
      const newGuidance: PrototypeGuidance = {
        ...data,
        id: "guidance_" + Date.now(),
        ideaId: activeEvaluation?.id || "manual",
        timestamp: new Date().toLocaleDateString(),
      };

      setGuidanceList((prev) => [newGuidance, ...prev]);
      setActiveGuidance(newGuidance);
      setActiveView("evaluator");

      // Send a follow-up chat log
      const systemConfirm: ChatMessage = {
        id: "msg_sys_guidance_" + Date.now(),
        role: "model",
        text: `🛠️ **Implementation Roadmap Generated!** Strategic execution milestones and technical guidance have been compiled for your concept.`,
        timestamp: new Date().toLocaleTimeString(),
      };

      setChatSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, systemConfirm] } : s))
      );
    } catch (err: any) {
      console.error(err);
      setApiError(formatApiErrorMessage(err));
    } finally {
      setIsGeneratingGuidance(false);
    }
  };

  // Direct Full Market Analysis PDF Report Generation
  const handleTriggerMarketAnalysis = async (ideaText: string) => {
    setIsAiProcessing(true);
    playUiSound("toggle", soundEffectsEnabled);

    const loadingMsgId = "msg_mkt_load_" + Date.now();
    const loadingMsg: ChatMessage = {
      id: loadingMsgId,
      role: "model",
      text: "📊 **Generating Full Market Analysis PDF Report**...\n\nAnalyzing Market Size (TAM/SAM/SOM), Target Audience, Competitor Moats, Unit Economics, SWOT Matrix, and Go-To-Market Strategy...",
      timestamp: new Date().toLocaleTimeString(),
      isTyping: true,
    };

    setChatSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, loadingMsg] } : s))
    );

    try {
      const res = await fetch("/api/market-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: ideaText }),
      });

      if (!res.ok) {
        throw new Error("Market analysis generation failed.");
      }

      const reportData: MarketAnalysisReport = await res.json();

      const aiText = `📊 **Full Market Analysis Report Ready!**\n\nI have completed the deep market feasibility analysis for **"${reportData.ideaTitle}"**.\n\n- **Viability Score**: ${reportData.viabilityScore}/100\n- **Estimated TAM**: ${reportData.tamEstimate}\n- **Risk Level**: ${reportData.riskLevel}\n\nYou can view the full institutional analysis or download the formatted PDF directly below on your chat screen:`;

      setChatSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === loadingMsgId
                  ? {
                      ...m,
                      text: aiText,
                      isTyping: false,
                      marketReport: reportData,
                    }
                  : m
              ),
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      console.error(err);
      const friendlyAlert = formatApiErrorMessage(err);
      setApiError(friendlyAlert);

      setChatSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === loadingMsgId
                  ? {
                      ...m,
                      text: `⚠️ **Market Analysis Alert**: Could not synthesize market report. ${friendlyAlert}`,
                      isTyping: false,
                    }
                  : m
              ),
            };
          }
          return s;
        })
      );
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSelectContextPrompt = useCallback((instruction: string) => {
    playUiSound("toggle", soundEffectsEnabled);
    setInputText((prev) => {
      if (!prev.trim()) {
        return instruction;
      }
      if (!prev.startsWith(instruction)) {
        return `${instruction}${prev}`;
      }
      return prev;
    });
    setActiveView("chat");
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 100);
  }, [soundEffectsEnabled]);

  // Modular helper functions passed into sub-views
  const handleDraftFromAssistant = async (payload: {
    prompt: string;
    documentType: string;
    tone: string;
    targetAudience: string;
  }) => {
    setIsWriting(true);
    try {
      const res = await fetch("/api/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Document drafting error.");
      }

      const data = await res.json();
      return data.content;
    } catch (e: any) {
      console.error(e);
      setApiError(formatApiErrorMessage(e));
      return "";
    } finally {
      setIsWriting(false);
    }
  };

  const handleGenerateImageFromMockup = async (prompt: string, ratio: string) => {
    setIsGeneratingMockup(true);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio: ratio }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Mockup synthesis failed.");
      }

      const data = await res.json();
      return data.imageUrl;
    } catch (e: any) {
      console.error(e);
      setApiError(formatApiErrorMessage(e));
      return "";
    } finally {
      setIsGeneratingMockup(false);
    }
  };

  const handleAnalyzeImageFromEngine = async (payload: { base64Data: string; mimeType: string; prompt: string }) => {
    setIsAiProcessing(true);
    try {
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Image assessment error.");
      }

      const data = await res.json();
      return data.analysis;
    } catch (e: any) {
      console.error(e);
      setApiError(formatApiErrorMessage(e));
      return "";
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col justify-between relative font-sans overflow-x-hidden select-none pb-2 transition-colors">
      {/* Top Navigation Header (Organized: Strictly 4 Clean Items) */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-30 flex items-center justify-between px-3 sm:px-5 shadow-xs select-none transition-colors">
        {/* Left Side: 2 Items (1. Sidebar Toggle, 2. CORE AI Logo with Mode) */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* ITEM 1: Sidebar Toggle Button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition-all cursor-pointer shrink-0 active:scale-95 border border-slate-200/50 dark:border-slate-700/50"
            title="Open Main Navigation Sidebar"
            aria-label="Open Sidebar Menu"
          >
            <Menu className="w-5 h-5 text-slate-800 dark:text-slate-100" />
          </button>

          {/* ITEM 2: Brand Logo & Integrated Mode Pill */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => {
                playUiSound("toggle", soundEffectsEnabled);
                setActiveView("chat");
              }}
              className="cursor-pointer hover:opacity-90 transition-opacity flex items-center shrink-0"
              title="Return to CORE AI Chat"
            >
              <CoreAiLogo size="sm" showText={true} glow={true} />
            </button>

            {/* Compact Active Mode Badge */}
            <div className="hidden xs:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700/80 shrink-0">
              <div className="w-1.5 h-1.5 bg-[#00e5ff] rounded-full shadow-[0_0_8px_#00e5ff] shrink-0" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">
                {getActiveMode()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: 2 Items (3. Context Action [New Chat / Back to Chat], 4. Quick Options Menu) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* ITEM 3: Primary Context Action Button */}
          {activeView !== "chat" ? (
            <button
              type="button"
              onClick={() => {
                playUiSound("toggle", soundEffectsEnabled);
                setActiveView("chat");
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-600 dark:text-cyan-300 border border-cyan-400/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0 shadow-xs"
              title="Return directly to Chat Screen"
            >
              <ArrowLeft className="w-4 h-4 text-[#00e5ff]" />
              <span className="font-sans font-bold text-xs">Back to Chat</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                playUiSound("toggle", soundEffectsEnabled);
                handleCreateNewSession();
                setActiveView("chat");
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-cyan-950/80 hover:bg-slate-800 text-white dark:text-cyan-200 border border-slate-800 dark:border-cyan-500/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0 shadow-xs"
              title="Start New Chat Thread"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-xs font-bold">New Chat</span>
            </button>
          )}

          {/* ITEM 4: Quick Options & Settings Hub Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shrink-0 active:scale-95 border border-slate-200/50 dark:border-slate-700/50"
              title="Quick Options & Controls"
              aria-label="Quick Options Menu"
            >
              <MoreVertical className="w-5 h-5 text-slate-800 dark:text-slate-200" />
            </button>

            {/* Quick options dropdown overlay */}
            <AnimatePresence>
              {settingsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl rounded-2xl p-3 z-50 overflow-hidden max-h-[85vh] overflow-y-auto space-y-3"
                  >
                    {/* Header Quick Toggles Bar (Theme, Voice Mute, PDF Export) */}
                    <div className="p-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-800 rounded-xl space-y-2">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold block px-1">
                        Quick Controls
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {/* Theme Switcher Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsDarkMode(!isDarkMode);
                            playUiSound("toggle", soundEffectsEnabled);
                          }}
                          className="flex flex-col items-center justify-center p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700 transition-all cursor-pointer text-center"
                          title="Toggle Light / Dark Mode"
                        >
                          {isDarkMode ? (
                            <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20 mb-1" />
                          ) : (
                            <Moon className="w-4 h-4 text-slate-700 mb-1" />
                          )}
                          <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-200">
                            {isDarkMode ? "Light" : "Dark"}
                          </span>
                        </button>

                        {/* Voice Speech Mute Button */}
                        <button
                          type="button"
                          onClick={() => {
                            playUiSound("toggle", soundEffectsEnabled);
                            if (isSpeaking) {
                              handleStopSpeaking();
                            }
                            setVoicePlaybackEnabled(!voicePlaybackEnabled);
                          }}
                          className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer text-center ${
                            isSpeaking
                              ? "bg-rose-500/20 border-rose-500/50 text-rose-400"
                              : voicePlaybackEnabled
                              ? "bg-cyan-500/10 border-cyan-400/30 text-cyan-600 dark:text-cyan-400"
                              : "bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-700 text-slate-400"
                          }`}
                          title="Toggle AI Audio Voice Playback"
                        >
                          {isSpeaking ? (
                            <VolumeX className="w-4 h-4 text-rose-400 mb-1 animate-pulse" />
                          ) : voicePlaybackEnabled ? (
                            <Volume2 className="w-4 h-4 text-cyan-500 mb-1" />
                          ) : (
                            <VolumeX className="w-4 h-4 text-slate-400 mb-1" />
                          )}
                          <span className="text-[10px] font-mono font-bold">
                            {voicePlaybackEnabled ? "Voice On" : "Muted"}
                          </span>
                        </button>

                        {/* Quick PDF Export Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const currentSession = getActiveSession();
                            if (currentSession) {
                              playUiSound("toggle", soundEffectsEnabled);
                              exportChatToPdf(currentSession);
                              setSettingsOpen(false);
                            }
                          }}
                          className="flex flex-col items-center justify-center p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700 transition-all cursor-pointer text-center"
                          title="Export Current Chat as PDF"
                        >
                          <FileText className="w-4 h-4 text-cyan-500 mb-1" />
                          <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-200">
                            Export PDF
                          </span>
                        </button>
                      </div>

                      {/* Firestore DB Status */}
                      <div className="flex items-center justify-between px-2 py-1 bg-emerald-500/10 dark:bg-emerald-950/40 rounded-lg border border-emerald-500/20 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                          <span>Firestore Cloud Database</span>
                        </div>
                        <span className="text-[9px] uppercase tracking-wider text-emerald-500 font-extrabold">Live</span>
                      </div>
                    </div>

                  {/* User Profile & Founder Info Section */}
                  <div className="p-2.5 mb-2 bg-gradient-to-br from-cyan-500/10 via-slate-900/90 to-blue-950/40 border border-cyan-500/35 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        User Profile & Personalization
                      </span>
                      <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        AI Trained
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <div className="min-w-0 pr-2">
                        <h4 className="font-extrabold text-slate-100 truncate text-xs">
                          {userProfile.name || "Set Your Name"}
                        </h4>
                        <p className="text-[10px] text-slate-300 font-medium truncate mt-0.5">
                          {userProfile.occupation || "Add your occupation/role"} {userProfile.age ? `• Age ${userProfile.age}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUserProfileModalOpen(true);
                          setSettingsOpen(false);
                          playUiSound("toggle", soundEffectsEnabled);
                        }}
                        className="px-2.5 py-1 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-[10px] rounded-lg transition-all cursor-pointer shadow-xs shrink-0 flex items-center gap-1 active:scale-95"
                      >
                        <UserCog className="w-3 h-3 text-slate-950" />
                        {userProfile.isSetupCompleted ? "Edit Profile" : "Set Profile"}
                      </button>
                    </div>

                    <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-400" /> App Founder: <strong className="text-amber-300">Rohit</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileModalOpen(true);
                          setSettingsOpen(false);
                          playUiSound("toggle", soundEffectsEnabled);
                        }}
                        className="text-amber-400 hover:underline font-mono text-[9px]"
                      >
                        View Credentials
                      </button>
                    </div>
                  </div>

                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold px-3 py-1.5 block">
                    Synthesizer Views
                  </span>
                  {[
                    { id: "chat", label: "Core Chat Console", icon: MessageSquare, shortcut: "Alt+1" },
                    { id: "evaluator", label: "Viability Evaluator", icon: Lightbulb, shortcut: "Alt+2" },
                    { id: "writer", label: "Writing Canvas", icon: FileText, shortcut: "Alt+3" },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isSelected = activeView === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveView(tab.id as any);
                          setSettingsOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#00e5ff]/10 text-slate-900 dark:text-slate-100 border border-[#00e5ff]/30"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isSelected ? "text-[#00e5ff]" : "text-slate-400 dark:text-slate-500"}`} />
                          {tab.label}
                        </div>
                        <kbd className="hidden sm:inline-block px-1 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 text-slate-400 dark:text-slate-400 text-[8px] font-mono rounded font-medium shrink-0">
                          {tab.shortcut}
                        </kbd>
                      </button>
                    );
                  })}

                  <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

                  {/* Chat Controls & Export Options */}
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold px-3 py-1 block">
                    Chat & Export Controls
                  </span>
                  <button
                    onClick={() => {
                      playUiSound("toggle", soundEffectsEnabled);
                      handleCreateNewSession();
                      setActiveView("chat");
                      setSettingsOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-cyan-500" />
                    <span>New Chat Thread</span>
                  </button>
                  <button
                    onClick={() => {
                      const currentSession = getActiveSession();
                      if (currentSession) {
                        playUiSound("toggle", soundEffectsEnabled);
                        handleSummarizeThread(currentSession.id);
                        setSettingsOpen(false);
                      }
                    }}
                    className="w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span>Summarize Thread (AI Context)</span>
                  </button>
                  <button
                    onClick={() => {
                      const currentSession = getActiveSession();
                      if (currentSession) {
                        playUiSound("toggle", soundEffectsEnabled);
                        exportChatToPdf(currentSession);
                        setSettingsOpen(false);
                      }
                    }}
                    className="w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-cyan-500" />
                    <span>Export Chat as PDF Report</span>
                  </button>
                  <button
                    onClick={() => {
                      const currentSession = getActiveSession();
                      if (currentSession) {
                        handleOpenDeleteModal(currentSession.id);
                        setSettingsOpen(false);
                      }
                    }}
                    className="w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <span>Delete Current Chat</span>
                  </button>

                  <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

                  {/* Language Selection inside Three-Dot Menu */}
                  <div className="px-2 py-1">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold block mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-500" /> Language / भाषा
                    </span>
                    <div className="grid grid-cols-2 gap-1">
                      {LANGUAGE_OPTIONS.map((lang) => {
                        const isSelected = currentLanguage === lang.code;
                        return (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setCurrentLanguage(lang.code);
                              playUiSound("toggle", soundEffectsEnabled);
                            }}
                            className={`px-2 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer border ${
                              isSelected
                                ? "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 font-bold border-cyan-300 dark:border-cyan-700"
                                : "bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-sm">{lang.flag}</span>
                              <span className="truncate text-[11px]">{lang.nativeName}</span>
                            </div>
                            {isSelected && <Check className="w-3 h-3 text-cyan-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

                  {/* Keyboard Instructions & Shortcuts */}
                  <button
                    onClick={() => {
                      setShortcutsOpen(true);
                      setSettingsOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Keyboard className="w-4 h-4 text-cyan-500" />
                      <span>{t.keyboardShortcuts}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      Cheatsheet
                    </span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>

      {/* Main Container Stage */}
      <main className="flex-1 pt-14 pb-24 overflow-x-hidden max-w-7xl w-full mx-auto select-none">
        {/* Central API / Quota Error Notification Banner */}
        <AnimatePresence>
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mx-4 my-3 p-5 rounded-2xl flex items-start gap-4 shadow-md border ${
                apiError.includes("RESOURCE_EXHAUSTED") || apiError.includes("quota") || apiError.includes("Quota") || apiError.includes("429")
                  ? "bg-rose-50/95 border-rose-200 text-rose-950"
                  : "bg-amber-50 border-amber-200 text-amber-950"
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                apiError.includes("RESOURCE_EXHAUSTED") || apiError.includes("quota") || apiError.includes("Quota") || apiError.includes("429")
                  ? "bg-rose-100 text-rose-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className={`text-xs font-extrabold uppercase tracking-wider font-display ${
                  apiError.includes("RESOURCE_EXHAUSTED") || apiError.includes("quota") || apiError.includes("Quota") || apiError.includes("429")
                    ? "text-rose-900"
                    : "text-amber-900"
                }`}>
                  {apiError.includes("RESOURCE_EXHAUSTED") || apiError.includes("quota") || apiError.includes("Quota") || apiError.includes("429")
                    ? "Gemini API Quota Exceeded (RESOURCE_EXHAUSTED)"
                    : "Gemini API Connection Note"}
                </h3>
                
                {apiError.includes("RESOURCE_EXHAUSTED") || apiError.includes("quota") || apiError.includes("Quota") || apiError.includes("429") ? (
                  <div className="mt-2 space-y-3">
                    <p className="text-xs text-rose-800 leading-relaxed font-medium">
                      The shared free-tier workspace developer key has hit its request limit. You can resolve this instantly:
                    </p>
                    <div className="bg-white/90 border border-rose-100 rounded-xl p-3.5 space-y-2.5 text-xs text-rose-900 shadow-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold shrink-0 mt-0.5">1</span>
                        <span>Open the <strong>Settings &gt; Secrets</strong> panel in the AI Studio menu (top right of your screen).</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold shrink-0 mt-0.5">2</span>
                        <span>Add your personal key with the name <strong>PERSONAL_GEMINI_API_KEY</strong> (or <strong>GEMINI_API_KEY</strong>) as a secure environment secret.</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold shrink-0 mt-0.5">3</span>
                        <span>The application will instantly prioritize your custom key name with high-speed limits!</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-amber-800 leading-relaxed mt-1 font-medium whitespace-pre-line">
                    {apiError}
                  </p>
                )}
              </div>
              <button
                onClick={() => setApiError(null)}
                className={`p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  apiError.includes("RESOURCE_EXHAUSTED") || apiError.includes("quota") || apiError.includes("Quota") || apiError.includes("429")
                    ? "hover:bg-rose-100 text-rose-600 hover:text-rose-900"
                    : "hover:bg-amber-100 text-amber-600 hover:text-amber-900"
                }`}
                title="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeView === "chat" && (
            <motion.div
              key="chat-view"
              initial={{ opacity: 0, y: 12, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="h-full flex flex-col justify-between"
            >
              {/* CORE AI Redesigned Home Screen State */}
              {getActiveMessages().length === 0 ? (
                <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 sm:py-8 flex flex-col items-center justify-center space-y-6 sm:space-y-8 select-none">
                  {/* Central CORE Engine Header & Classic Emblem Logo */}
                  <div className="flex flex-col items-center text-center space-y-3">
                    <motion.div
                      initial={{ scale: 0.85, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col items-center"
                    >
                      <CoreAiLogo size="lg" showText={true} glow={true} />
                    </motion.div>

                    <div className="space-y-1.5 max-w-lg mt-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[#00e5ff] text-[10px] font-mono font-bold uppercase tracking-widest">
                        <Zap className="w-3 h-3 text-[#00e5ff]" />
                        CORE Engine v3.6 Active
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed pt-1">
                        Bring an idea, problem, decision, or project. CORE helps you think, analyze, and build.
                      </p>
                    </div>
                  </div>

                  {/* Useful Quick Action Pillars (4 Action Cards) */}
                  <div className="w-full space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#00e5ff]" />
                        Quick Actions
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">Select template to start</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {/* 1. Analyze Problem */}
                      <button
                        type="button"
                        onClick={() => {
                          setInputText("Analyze problem: ");
                          chatInputRef.current?.focus();
                        }}
                        className="group p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all cursor-pointer text-left flex flex-col justify-between h-24 relative overflow-hidden"
                      >
                        <div className="p-1.5 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 w-fit group-hover:scale-110 transition-transform">
                          <Search className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                            Analyze Problem
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                            Debug & resolve issues
                          </p>
                        </div>
                      </button>

                      {/* 2. Develop Idea */}
                      <button
                        type="button"
                        onClick={() => {
                          setInputText("Develop idea: ");
                          chatInputRef.current?.focus();
                        }}
                        className="group p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all cursor-pointer text-left flex flex-col justify-between h-24 relative overflow-hidden"
                      >
                        <div className="p-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 w-fit group-hover:scale-110 transition-transform">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                            Develop Idea
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                            Explore market viability
                          </p>
                        </div>
                      </button>

                      {/* 3. Analyze Decision */}
                      <button
                        type="button"
                        onClick={() => {
                          setInputText("Analyze decision: ");
                          chatInputRef.current?.focus();
                        }}
                        className="group p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all cursor-pointer text-left flex flex-col justify-between h-24 relative overflow-hidden"
                      >
                        <div className="p-1.5 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-purple-500 w-fit group-hover:scale-110 transition-transform">
                          <Scale className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                            Analyze Decision
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                            Compare trade-offs
                          </p>
                        </div>
                      </button>

                      {/* 4. Build Project */}
                      <button
                        type="button"
                        onClick={() => {
                          setInputText("Build project blueprint for: ");
                          chatInputRef.current?.focus();
                        }}
                        className="group p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all cursor-pointer text-left flex flex-col justify-between h-24 relative overflow-hidden"
                      >
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 w-fit group-hover:scale-110 transition-transform">
                          <Rocket className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                            Build Project
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                            Specs, wireframes & code
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Your Systems / Recent Projects Section */}
                  <div className="w-full space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5">
                        <Server className="w-3 h-3 text-[#00e5ff]" />
                        Your Systems & Recent Projects
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">2 Frameworks</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* IoT Micro-Farming */}
                      <button
                        type="button"
                        onClick={() =>
                          handleTriggerEvaluation(
                            "A smart micro-farming system that uses soil sensors and localized weather APIs to automate drip irrigation cycles."
                          )
                        }
                        className="group p-3.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(0,229,255,0.12)] transition-all cursor-pointer text-left flex items-start gap-3"
                      >
                        <div className="p-2 rounded-lg bg-cyan-500/10 text-[#00e5ff] shrink-0 group-hover:scale-105 transition-transform">
                          <Cpu className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                              IoT Micro-Farming
                            </h4>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                              System Spec
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2 leading-tight">
                            Automated drip irrigation & soil sensor telemetry engine with weather API integration.
                          </p>
                        </div>
                      </button>

                      {/* Mesh Hotspot Network */}
                      <button
                        type="button"
                        onClick={() =>
                          handleTriggerEvaluation(
                            "A localized hyper-casual mobile network where users exchange spare battery power and hotspot mesh credentials."
                          )
                        }
                        className="group p-3.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(0,229,255,0.12)] transition-all cursor-pointer text-left flex items-start gap-3"
                      >
                        <div className="p-2 rounded-lg bg-cyan-500/10 text-[#00e5ff] shrink-0 group-hover:scale-105 transition-transform">
                          <Code className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                              Mesh Hotspot Network
                            </h4>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                              Network Spec
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2 leading-tight">
                            Localized peer-to-peer battery exchange & encrypted hotspot mesh credential protocol.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Compact Active Chat Message Thread */
                <div className="flex-1 overflow-y-auto px-3 pt-3 pb-40 sm:pb-48 space-y-3.5 max-w-3xl w-full mx-auto select-none">
                  {/* Sticky Pinned Messages Bar with Framer Motion slide animation */}
                  <AnimatePresence mode="wait">
                    {allPinnedMessages.length > 0 ? (
                      <motion.div
                        key="pinned-messages-active-bar"
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 dark:border-cyan-500/40 rounded-xl p-2.5 shadow-md space-y-2 my-2 transition-all overflow-hidden"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <motion.div
                            key={`pinned-header-title-${allPinnedMessages.length}`}
                            initial={{ backgroundColor: "rgba(6, 182, 212, 0)" }}
                            animate={{
                              backgroundColor: [
                                "rgba(6, 182, 212, 0)",
                                "rgba(6, 182, 212, 0.18)",
                                "rgba(6, 182, 212, 0)",
                              ],
                            }}
                            transition={{ duration: 0.7, ease: "easeInOut" }}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 px-1.5 py-0.5 rounded-lg"
                          >
                            <Pin className="w-3.5 h-3.5 text-cyan-500 fill-cyan-500/30" />
                            <span>Pinned Messages</span>
                            <motion.span
                              key={`pinned-badge-${allPinnedMessages.length}`}
                              initial={{ scale: 1 }}
                              animate={{
                                scale: [1, 1.25, 1],
                                backgroundColor: [
                                  "rgba(6, 182, 212, 0.2)",
                                  "rgba(6, 182, 212, 0.65)",
                                  "rgba(6, 182, 212, 0.2)",
                                ],
                                boxShadow: [
                                  "0 0 0px rgba(6, 182, 212, 0)",
                                  "0 0 10px rgba(6, 182, 212, 0.7)",
                                  "0 0 0px rgba(6, 182, 212, 0)",
                                ],
                              }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-extrabold text-cyan-600 dark:text-cyan-300"
                            >
                              {pinnedMessages.length}
                              {pinnedMessages.length !== allPinnedMessages.length && ` / ${allPinnedMessages.length}`}
                            </motion.span>
                          </motion.div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Filter & Sort Controls */}
                            <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-lg px-2 py-0.5">
                              <Filter className="w-3 h-3 text-cyan-500 shrink-0" />
                              <select
                                value={pinnedRoleFilter}
                                onChange={(e) => setPinnedRoleFilter(e.target.value as "all" | "user" | "model")}
                                className="bg-transparent text-slate-700 dark:text-slate-200 text-[10px] font-medium focus:outline-none cursor-pointer"
                                title="Filter pinned messages by Role"
                              >
                                <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">All Roles</option>
                                <option value="user" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">You</option>
                                <option value="model" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">CORE AI</option>
                              </select>
                              <span className="text-slate-300 dark:text-slate-700 font-mono text-[10px]">|</span>
                              <select
                                value={pinnedSortOrder}
                                onChange={(e) => setPinnedSortOrder(e.target.value as "oldest" | "newest")}
                                className="bg-transparent text-slate-700 dark:text-slate-200 text-[10px] font-medium focus:outline-none cursor-pointer"
                                title="Sort pinned messages by Date"
                              >
                                <option value="oldest" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Oldest First</option>
                                <option value="newest" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Newest First</option>
                              </select>
                            </div>

                            {/* View Mode Toggle & Sound Toggle */}
                            <div className="flex items-center gap-1">
                              <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-0.5">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.92 }}
                                  onClick={() => {
                                    if (pinnedViewMode !== "list") {
                                      setPinnedViewMode("list");
                                      playUiSound("toggle", soundEffectsEnabled);
                                    }
                                  }}
                                  className={`p-1 rounded text-[10px] cursor-pointer transition-all ${
                                    pinnedViewMode === "list"
                                      ? "bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-300 shadow-sm font-bold"
                                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                                  }`}
                                  title="List View"
                                >
                                  <LayoutList className="w-3 h-3" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.92 }}
                                  onClick={() => {
                                    if (pinnedViewMode !== "grid") {
                                      setPinnedViewMode("grid");
                                      playUiSound("toggle", soundEffectsEnabled);
                                    }
                                  }}
                                  className={`p-1 rounded text-[10px] cursor-pointer transition-all ${
                                    pinnedViewMode === "grid"
                                      ? "bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-300 shadow-sm font-bold"
                                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                                  }`}
                                  title="Grid View"
                                >
                                  <LayoutGrid className="w-3 h-3" />
                                </motion.button>
                              </div>

                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.92 }}
                                onClick={() => {
                                  const nextState = !soundEffectsEnabled;
                                  setSoundEffectsEnabled(nextState);
                                  if (nextState) playUiSound("toggle", true);
                                }}
                                className={`p-1 rounded-lg border text-[10px] cursor-pointer transition-all ${
                                  soundEffectsEnabled
                                    ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/30"
                                    : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-400 border-slate-200/80 dark:border-slate-700/80"
                                }`}
                                title={soundEffectsEnabled ? "Sound Effects Enabled (Click to Mute)" : "Sound Effects Muted (Click to Enable)"}
                              >
                                {soundEffectsEnabled ? <Volume2 className="w-3 h-3 text-cyan-500" /> : <VolumeX className="w-3 h-3 text-slate-400" />}
                              </motion.button>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCopyAllPinnedMessages(pinnedMessages)}
                              className="px-2 py-0.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                              title="Copy pinned messages to clipboard"
                            >
                              {copiedAllPinned ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy All</span>
                                </>
                              )}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                playUiSound("expand", soundEffectsEnabled);
                                setIsPinnedSectionOpen(!isPinnedSectionOpen);
                              }}
                              className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <span>{isPinnedSectionOpen ? "Collapse" : "Expand"}</span>
                              {isPinnedSectionOpen ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </motion.button>
                          </div>
                        </div>

                        <AnimatePresence initial={false}>
                          {isPinnedSectionOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="pt-1">
                                {pinnedMessages.length === 0 ? (
                                  <div className="p-2 text-center text-[11px] text-slate-400 font-mono italic col-span-full">
                                    No pinned messages match the selected filter.
                                  </div>
                                ) : (
                                  <Reorder.Group
                                    axis={pinnedViewMode === "grid" ? "x" : "y"}
                                    values={pinnedMessages}
                                    onReorder={(newOrder) => {
                                      setCustomPinnedOrder(newOrder.map((m) => m.id));
                                      playUiSound("reorder", soundEffectsEnabled);
                                    }}
                                    className={
                                      pinnedViewMode === "grid"
                                        ? "grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1"
                                        : "space-y-1.5 max-h-40 overflow-y-auto pr-1"
                                    }
                                  >
                                    <AnimatePresence mode="popLayout">
                                      {pinnedMessages.map((pm) => (
                                        <Reorder.Item
                                          key={pm.id}
                                          value={pm}
                                          layoutId={`pinned-card-${pm.id}`}
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                                          transition={{
                                            layout: { type: "spring", stiffness: 350, damping: 30 },
                                            opacity: { duration: 0.2 },
                                          }}
                                          className={
                                            pinnedViewMode === "grid"
                                              ? "flex flex-col justify-between gap-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 hover:border-cyan-400/50 rounded-xl p-2.5 transition-colors text-xs group relative shadow-sm cursor-grab active:cursor-grabbing select-none"
                                              : "flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 hover:border-cyan-400/50 rounded-lg p-2 transition-colors text-xs group cursor-grab active:cursor-grabbing select-none"
                                          }
                                        >
                                          {pinnedViewMode === "grid" ? (
                                            <>
                                              <div className="flex items-center justify-between gap-1.5">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                  <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-cyan-500 transition-colors shrink-0" />
                                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase shrink-0 ${
                                                    pm.role === "user"
                                                      ? "bg-slate-800 text-slate-200"
                                                      : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                                  }`}>
                                                    {pm.role === "user" ? "You" : "CORE AI"}
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                  <span className="text-[10px] text-slate-400 font-mono">{pm.timestamp}</span>
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleTogglePinMessage(pm.id);
                                                    }}
                                                    className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                                                    title="Unpin message"
                                                  >
                                                    <PinOff className="w-3.5 h-3.5" />
                                                  </button>
                                                </div>
                                              </div>

                                              <button
                                                onClick={() => handleScrollToMessage(pm.id)}
                                                className="text-left flex-1 cursor-pointer min-w-0"
                                                title="Click to jump to message in thread"
                                              >
                                                <p className="text-slate-700 dark:text-slate-200 text-xs font-medium line-clamp-2 leading-snug">
                                                  {pm.text || (pm.imageAttached ? "[Image attached]" : "")}
                                                </p>
                                              </button>
                                            </>
                                          ) : (
                                            <>
                                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-cyan-500 transition-colors shrink-0" />
                                                <button
                                                  onClick={() => handleScrollToMessage(pm.id)}
                                                  className="flex items-center gap-2 min-w-0 text-left flex-1 cursor-pointer"
                                                  title="Click to jump to message in thread"
                                                >
                                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase shrink-0 ${
                                                    pm.role === "user"
                                                      ? "bg-slate-800 text-slate-200"
                                                      : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                                  }`}>
                                                    {pm.role === "user" ? "You" : "CORE AI"}
                                                  </span>
                                                  <p className="text-slate-700 dark:text-slate-200 text-xs truncate font-medium">
                                                    {pm.text || (pm.imageAttached ? "[Image attached]" : "")}
                                                  </p>
                                                </button>
                                              </div>

                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleTogglePinMessage(pm.id);
                                                }}
                                                className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                                                title="Unpin message"
                                              >
                                                <PinOff className="w-3.5 h-3.5" />
                                              </button>
                                            </>
                                          )}
                                        </Reorder.Item>
                                      ))}
                                    </AnimatePresence>
                                  </Reorder.Group>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="pinned-messages-empty-placeholder"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-100/50 dark:bg-slate-950/40 border border-dashed border-slate-200/80 dark:border-slate-800/80 rounded-lg text-slate-400 dark:text-slate-500 text-[11px] font-mono my-1.5"
                      >
                        <div className="flex items-center gap-1.5">
                          <Pin className="w-3 h-3 text-cyan-500/60" />
                          <span className="font-medium text-slate-500 dark:text-slate-400">No pinned messages</span>
                        </div>
                        <span className="text-[10px] text-slate-400/80 italic flex items-center gap-1">
                          Pin key insights with <Pin className="w-2.5 h-2.5 text-cyan-500 inline" /> for quick reference
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* CORE AI Workspace Paradigm Bar */}
                  <div className="flex items-center justify-between px-3 py-2 my-2 rounded-xl bg-slate-900/90 dark:bg-slate-950 border border-slate-800 text-white shadow-xs">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-slate-300 overflow-x-auto whitespace-nowrap py-0.5 scrollbar-none">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-[#00e5ff] border border-cyan-500/30">1. THINK</span>
                      <span className="text-slate-600">→</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">2. UNDERSTAND</span>
                      <span className="text-slate-600">→</span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">3. ANALYZE</span>
                      <span className="text-slate-600">→</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">4. DECIDE</span>
                      <span className="text-slate-600">→</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">5. BUILD</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-cyan-400 shrink-0 ml-2">
                      <Sparkles className="w-3 h-3 animate-pulse text-[#00e5ff]" />
                      <span>Workspace Active</span>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {getActiveMessages().map((msg, idx) => (
                      <ChatMessageComponent
                        key={msg.id}
                        index={idx}
                        message={msg}
                        onCopyMessage={handleCopyMessage}
                        onSpeakText={(text, id) => handleSpeakText(text, id || msg.id)}
                        onStopSpeaking={handleStopSpeaking}
                        isSpeaking={isSpeaking && speakingMessageId === msg.id}
                        isSpeechLoading={speechLoadingId === msg.id}
                        onTogglePin={handleTogglePinMessage}
                        onToggleReaction={handleToggleReaction}
                        onEditMessage={handleEditMessage}
                        onTriggerEvaluation={handleTriggerEvaluation}
                        onTriggerGuidance={handleTriggerGuidance}
                        onTriggerMarketAnalysis={handleTriggerMarketAnalysis}
                        onOpenMarketReportModal={handleOpenMarketReportModal}
                        copiedMessageId={copiedMessageId}
                      />
                    ))}
                  </AnimatePresence>

                  {/* AI Synthesizing Loader */}
                  {isAiProcessing && <ChatSkeleton />}

                  <div ref={messageEndRef} />
                  {/* Extra scrollable space below last message so user can scroll past the message end comfortably */}
                  <div className="h-20 sm:h-28 shrink-0 pointer-events-none" />
                </div>
              )}
            </motion.div>
          )}

          {activeView === "evaluator" && (
            <motion.div
              key="evaluator-view"
              initial={{ opacity: 0, y: 12, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {isAiProcessing ? (
                <ScorecardSkeleton />
              ) : activeEvaluation ? (
                <IdeaEvaluator
                  evaluation={activeEvaluation}
                  onGenerateGuidance={handleTriggerGuidance}
                  isGeneratingGuidance={isGeneratingGuidance}
                  onBackToChat={() => setActiveView("chat")}
                />
              ) : (
                <div className="text-center p-12 max-w-md mx-auto space-y-4">
                  <Lightbulb className="w-12 h-12 text-[#00e5ff] mx-auto animate-pulse" />
                  <h3 className="text-base font-bold font-display text-slate-800 dark:text-slate-100">No active concept evaluation</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400 font-medium font-sans">
                    Submit any raw idea on the conversational chat console, and CORE AI will assess its feasibility and market size, generating a comprehensive scorecard here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveView("chat")}
                    className="mt-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 font-bold text-xs rounded-xl cursor-pointer transition-all inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#00e5ff]" />
                    <span>Return to Chat</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeView === "visuals" && (
            <motion.div
              key="visuals-view"
              initial={{ opacity: 0, y: 12, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {isGeneratingMockup ? (
                <ImageGeneratorSkeleton />
              ) : (
                <ImageGenerator
                  onGenerateImage={handleGenerateImageFromMockup}
                  onAnalyzeImage={handleAnalyzeImageFromEngine}
                  isGenerating={isGeneratingMockup}
                  isAnalyzing={isAiProcessing}
                  onBackToChat={() => setActiveView("chat")}
                />
              )}
            </motion.div>
          )}

          {activeView === "writer" && (
            <motion.div
              key="writer-view"
              initial={{ opacity: 0, y: 12, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {isWriting ? (
                <WritingAssistantSkeleton />
              ) : (
                <WritingAssistant
                  onDraftDocument={handleDraftFromAssistant}
                  isDrafting={isWriting}
                  onBackToChat={() => setActiveView("chat")}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Console Input Area */}
      {activeView === "chat" && (
        <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-[#0b0f19] dark:via-[#0b0f19]/95 dark:to-transparent z-20 select-none pointer-events-none">
          <div className="max-w-3xl w-full mx-auto relative space-y-2 pointer-events-auto">
            {/* Dynamic Animated Neon Light Wave Accent indicating active listener */}
            <div className="h-[2.5px] w-[95%] mx-auto overflow-hidden rounded-full mb-1.5 transition-all">
              <div
                className={`h-full w-full rounded-full transition-all duration-300 ${
                  isAiProcessing || isListeningVoice || isInputFocused || inputText.length > 0
                    ? "neon-light-accent opacity-100"
                    : "opacity-40"
                }`}
                style={{
                  backgroundColor: !(isAiProcessing || isListeningVoice || isInputFocused || inputText.length > 0)
                    ? (isDarkMode ? "#1e293b" : "#cbd5e1")
                    : undefined
                }}
              />
            </div>

            {/* Context-Aware Prompt Selector Pill & TTS Toggle on Top Bar Above Input Box */}
            <div className="flex items-center justify-between px-1 mb-1">
              <ContextPromptSelector
                activeView={activeView}
                activeMode={getActiveSession()?.activeMode || "automatic"}
                onSelectPrompt={handleSelectContextPrompt}
                accentColor={themeSettings.accentColor}
                onSwitchView={(v) => {
                  setActiveView(v);
                  playUiSound("toggle", soundEffectsEnabled);
                }}
              />

              <button
                type="button"
                onClick={() => setVoicePlaybackEnabled(!voicePlaybackEnabled)}
                className={`p-1 px-2.5 rounded-full border text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs hover:scale-105 active:scale-95 shrink-0 ${
                  isSpeaking
                    ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                    : voicePlaybackEnabled
                    ? "bg-slate-100/90 dark:bg-slate-900/90 border-cyan-500/30 text-cyan-400"
                    : "bg-slate-100/90 dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                }`}
                title={voicePlaybackEnabled ? "Disable Auto Voice Synthesis" : "Enable Auto Voice Synthesis"}
              >
                {isSpeaking ? (
                  <>
                    <VoiceVisualizer barCount={8} size="xs" accentColor="#00e5ff" state="speaking" />
                    <span className="text-cyan-300 font-extrabold uppercase">Speaking</span>
                  </>
                ) : voicePlaybackEnabled ? (
                  <>
                    <Volume2 className="w-3 h-3 text-cyan-400 animate-pulse" />
                    <span className="text-cyan-400 font-extrabold">TTS On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3 h-3 text-slate-400" />
                    <span>TTS Off</span>
                  </>
                )}
              </button>
            </div>

            {/* Bottom Input Box Container with Dynamic Illuminating Surrounding Halo */}
            <div className="relative group">
              {/* Surrounding Illuminating Backlight Halo */}
              <div
                className={`input-surrounding-halo ${
                  isInputFocused || isAiProcessing || isListeningVoice || inputText.length > 0
                    ? "input-surrounding-halo-active"
                    : ""
                }`}
                style={{
                  boxShadow: `0 0 calc(28px * var(--neon-glow-blur-multiplier)) ${themeSettings.accentColor}${themeSettings.neonGlowStrength === 'extreme' ? '75' : themeSettings.neonGlowStrength === 'vibrant' ? '45' : '20'}`
                }}
              />

              {/* Console Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-full transition-all border select-text"
                style={{
                  borderColor: isInputFocused || inputText.length > 0 || isListeningVoice || isAiProcessing
                    ? themeSettings.accentColor
                    : isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
                  boxShadow: isInputFocused || isAiProcessing
                    ? `0 0 calc(20px * var(--neon-glow-blur-multiplier)) ${themeSettings.accentColor}50, inset 0 0 calc(8px * var(--neon-glow-blur-multiplier)) ${themeSettings.accentColor}20`
                    : `0 8px 32px rgba(0,0,0,0.08), 0 0 calc(12px * var(--neon-glow-blur-multiplier)) ${themeSettings.accentColor}20`
                }}
              >
                {/* Quick Actions Suggestions Trigger Inside Input Box */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                    className="p-1 px-2 rounded-full border text-[9px] font-extrabold font-mono transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                    style={{
                      borderColor: `${themeSettings.accentColor}70`,
                      color: themeSettings.accentColor,
                      backgroundColor: quickActionsOpen ? `${themeSettings.accentColor}25` : `${themeSettings.accentColor}10`,
                      boxShadow: quickActionsOpen ? `0 0 10px ${themeSettings.accentColor}40` : undefined
                    }}
                    title="Quick Actions & Suggestions"
                  >
                    <Sparkles className="w-3 h-3 animate-pulse" style={{ color: themeSettings.accentColor }} />
                    <span className="hidden sm:inline">{t.tryButton}</span>
                    <ChevronUp className={`w-2.5 h-2.5 transition-transform duration-200 ${quickActionsOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Quick Actions Popover */}
                  <AnimatePresence>
                    {quickActionsOpen && (
                      <>
                        {/* Backdrop to dismiss on click outside */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setQuickActionsOpen(false)}
                        />

                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full mb-3 left-0 z-50 w-72 sm:w-80 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl"
                        >
                          <div className="flex items-center justify-between px-2 py-1 mb-1.5 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: themeSettings.accentColor }}>
                              <Sparkles className="w-3.5 h-3.5" style={{ color: themeSettings.accentColor }} /> {t.quickTry}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQuickActionsOpen(false)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1">
                            {[
                              { icon: "🔍", label: "Analyze Problem", desc: "Debug, trace root cause & resolve technical issues", prompt: "Analyze problem: ", type: "prefix" },
                              { icon: "💡", label: "Develop Idea", desc: "Explore market viability & feasibility matrix", prompt: "Develop idea: ", type: "prefix" },
                              { icon: "⚖️", label: "Analyze Decision", desc: "Compare trade-offs & risk matrix", prompt: "Analyze decision: ", type: "prefix" },
                              { icon: "🚀", label: "Build Project Blueprint", desc: "Specs, wireframes & code architecture", prompt: "Build project blueprint for: ", type: "prefix" },
                              { icon: "📊", label: "Analyze AI Study SaaS", desc: "Monetization, viral loops & target domain analysis", prompt: "Analyze micro-SaaS idea for AI study planner with viral loops and revenue model", type: "send" },
                              { icon: "🎨", label: "Generate UI Spec", desc: "Modern UI wireframe & layout component breakdown", prompt: "Generate UI wireframe layout for dark mode dashboard with metrics analytics", type: "send" },
                            ].map((item, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setQuickActionsOpen(false);
                                  if (item.type === "send") {
                                    handleSendMessage(undefined, item.prompt);
                                  } else {
                                    setInputText(item.prompt);
                                    setTimeout(() => {
                                      chatInputRef.current?.focus();
                                    }, 50);
                                  }
                                }}
                                className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer group flex items-start gap-2.5"
                              >
                                <span className="text-sm p-1 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">{item.icon}</span>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-cyan-500 transition-colors">
                                    {item.label}
                                  </div>
                                  <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                    {item.desc}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Attachment Button (+) */}
                <button
                  type="button"
                  onClick={handleTriggerAttachment}
                  className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                  title="Attach Sketch / Image"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAttachmentChange}
                  className="hidden"
                />

                {/* Text input */}
                <input
                  ref={chatInputRef}
                  type="text"
                  value={inputText}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t.inputPlaceholder}
                  className="flex-1 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:ring-0 bg-transparent py-1 min-w-0"
                />

                {/* Float Thumbnail of loaded attachment if any */}
                {attachedImage && (
                  <div className="relative shrink-0 pr-1.5">
                    <div className="w-8 h-8 rounded border overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center" style={{ borderColor: themeSettings.accentColor }}>
                      <img
                        src={`data:${attachedImage.mimeType};base64,${attachedImage.base64}`}
                        alt="Thumbnail attachment"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedImage(null)}
                      className="absolute -top-1.5 -right-1.5 p-0.5 bg-rose-500 rounded-full text-white cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}

                {/* Voice record action icon with live visualizer */}
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  className={`p-1.5 px-2.5 rounded-full transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5 ${
                    isListeningVoice
                      ? "bg-rose-500 text-white shadow-[0_0_18px_rgba(244,63,94,0.8)]"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                  title={isListeningVoice ? "Listening... Click to stop" : "Voice Input (Speech-to-Text)"}
                >
                  <Mic className={`w-4 h-4 ${isListeningVoice ? "animate-pulse text-white" : ""}`} />
                  {isListeningVoice && (
                    <VoiceVisualizer barCount={6} size="xs" accentColor="#ffffff" state="listening" />
                  )}
                </button>

                {/* Illuminated Send button matching active theme */}
                <button
                  type="submit"
                  disabled={!inputText.trim() && !attachedImage}
                  className="p-2 rounded-full text-slate-950 font-black hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 cursor-pointer shrink-0 flex items-center justify-center"
                  style={{
                    backgroundColor: themeSettings.accentColor,
                    boxShadow: !inputText.trim() && !attachedImage ? undefined : `0 0 16px ${themeSettings.accentColor}90`
                  }}
                  title="Send to CORE (Enter)"
                >
                  <Send className="w-3.5 h-3.5 text-slate-950" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Floating Speaking Indicator Widget */}
      <AnimatePresence>
        {(isSpeaking || isListeningVoice) && (
          <SpeakingIndicatorWidget
            isSpeaking={isSpeaking}
            isListening={isListeningVoice}
            spokenTextSnippet={activeSpeakingMessageSnippet}
            onStopSpeaking={() => {
              if (isListeningVoice) {
                handleToggleVoiceInput();
              } else {
                handleStopSpeaking();
              }
            }}
            accentColor={themeSettings.accentColor}
          />
        )}
      </AnimatePresence>

      {/* Slides-out Sidebar drawer menu */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeMode={getActiveMode()}
        onChangeMode={handleUpdateActiveMode}
        ideas={ideas}
        onSelectIdea={(idea) => {
          setActiveEvaluation(idea);
          // Auto load matching guidance if any
          const matchingGuidance = guidanceList.find((g) => g.ideaId === idea.id);
          if (matchingGuidance) {
            setActiveGuidance(matchingGuidance);
          } else {
            setActiveGuidance(null);
          }
          setActiveView("evaluator");
        }}
        customInstructions={customInstructions}
        onSaveInstructions={(inst) => {
          setCustomInstructions(inst);
          // Send system warning
          const alertMsg: ChatMessage = {
            id: "msg_rule_" + Date.now(),
            role: "model",
            text: `⚙️ **Persona Customizer Updated**: Target Domain: \`${inst.targetDomain}\` | Persona Style: \`${inst.personalityStyle}\` | Coding Stack: \`${inst.codePreference}\`. CORE AI behavior matrices recalibrated successfully.`,
            timestamp: new Date().toLocaleTimeString(),
          };
          setChatSessions((prev) =>
            prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, alertMsg] } : s))
          );
        }}
        themeSettings={themeSettings}
        onSaveTheme={(th) => {
          setThemeSettings(th);
        }}
        chatSessions={chatSessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          setActiveView("chat");
        }}
        onNewSession={handleCreateNewSession}
        onDeleteSession={handleOpenDeleteModal}
        userEmail={userEmail}
        onUpdateSessionTags={handleUpdateSessionTags}
        onOpenAutoNameSelector={handleOpenAutoNameSelector}
        onSummarizeThread={handleSummarizeThread}
        currentLanguage={currentLanguage}
        onChangeLanguage={setCurrentLanguage}
        ownerProfile={ownerProfile}
        onSaveOwnerProfile={handleSaveOwnerProfile}
        userProfile={userProfile}
        onSaveUserProfile={handleSaveUserProfile}
      />

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {shortcutsOpen && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-[92vw] p-5 sm:p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#00e5ff]/10 rounded-lg text-[#00e5ff]">
                    <Keyboard className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 font-display">Keyboard Shortcuts</h3>
                </div>
                <button
                  onClick={() => setShortcutsOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs font-medium pb-2 border-b border-slate-100">
                  <span className="text-slate-600">Focus Chat Input</span>
                  <div className="flex gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded shadow-xs">Ctrl</kbd>
                    <span className="text-slate-300 font-mono text-[10px]">+</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded shadow-xs">K</kbd>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-medium pb-2 border-b border-slate-100">
                  <span className="text-slate-600">Send Message</span>
                  <div className="flex gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded shadow-xs">Ctrl</kbd>
                    <span className="text-slate-300 font-mono text-[10px]">+</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded shadow-xs">Enter</kbd>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Switch Views</h4>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 font-sans">1. Chat Console</span>
                    <div className="flex gap-1">
                      <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded">Alt</kbd>
                      <span className="text-slate-300 font-mono text-[10px]">+</span>
                      <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded">1</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 font-sans">2. Viability Scorecard</span>
                    <div className="flex gap-1">
                      <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded">Alt</kbd>
                      <span className="text-slate-300 font-mono text-[10px]">+</span>
                      <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded">2</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 font-sans">3. Writing Canvas</span>
                    <div className="flex gap-1">
                      <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded">Alt</kbd>
                      <span className="text-slate-300 font-mono text-[10px]">+</span>
                      <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded">3</kbd>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Text Formatting</h4>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 font-sans">Bold Text</span>
                    <div className="flex gap-1">
                      <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded">Ctrl</kbd>
                      <span className="text-slate-300 font-mono text-[10px]">+</span>
                      <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded">B</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 font-sans">Italic Text</span>
                    <div className="flex gap-1">
                      <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded">Ctrl</kbd>
                      <span className="text-slate-300 font-mono text-[10px]">+</span>
                      <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded">I</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auto Chat Name Selector Modal */}
      <AnimatePresence>
        {autoNameModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cyan-500/30 dark:border-cyan-500/40 relative overflow-hidden select-none"
            >
              {/* Decorative cyan top glow bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-[#00e5ff] to-cyan-500 shadow-[0_0_12px_#00e5ff]" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-500 border border-cyan-400/20">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-display tracking-tight">
                      Auto Chat Name Selector
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      CORE AI Smart Title Synthesis
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAutoNameModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {/* AI Suggestions Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Wand2 className="w-3.5 h-3.5 text-cyan-500" />
                      AI Title Choices (Click to select)
                    </span>
                    <button
                      type="button"
                      disabled={isFetchingAutoNames}
                      onClick={() => {
                        const targetSession = chatSessions.find((s) => s.id === autoNameSessionId);
                        fetchAutoNameOptions(targetSession?.messages || []);
                      }}
                      className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                    >
                      <RotateCw className={`w-3 h-3 ${isFetchingAutoNames ? "animate-spin text-cyan-400" : ""}`} />
                      Re-generate Ideas
                    </button>
                  </div>

                  {isFetchingAutoNames ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-150 dark:border-slate-800/80">
                      <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">
                        Synthesizing smart title options...
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {autoNameOptions.map((option, idx) => (
                        <motion.button
                          key={option + idx}
                          whileHover={{ scale: 1.015, x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setCustomTitleInput(option);
                            handleApplySessionTitle(autoNameSessionId, option);
                          }}
                          className="p-3 bg-slate-50 dark:bg-slate-950/70 hover:bg-cyan-500/10 dark:hover:bg-cyan-950/60 border border-slate-200/80 dark:border-slate-800 hover:border-cyan-400/60 dark:hover:border-cyan-500/60 rounded-2xl text-left flex items-center justify-between group transition-all cursor-pointer shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-mono font-extrabold text-[10px] flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                              0{idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                              {option}
                            </span>
                          </div>
                          <CheckCircle className="w-4 h-4 text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 group-hover:text-cyan-500 transition-all" />
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom Title Input Section */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Or Type Custom Chat Title
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customTitleInput}
                      onChange={(e) => setCustomTitleInput(e.target.value)}
                      placeholder="Type custom name..."
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />
                    <button
                      type="button"
                      disabled={!customTitleInput.trim()}
                      onClick={() => handleApplySessionTitle(autoNameSessionId, customTitleInput)}
                      className="px-4 py-2 bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 dark:hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-40 border border-slate-800 shrink-0 shadow-2xs"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Quick One-Click Magic Auto-Pick Button */}
                {autoNameOptions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleApplySessionTitle(autoNameSessionId, autoNameOptions[0])}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl hover:from-cyan-400 hover:to-cyan-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Magic One-Click Auto-Pick: "{autoNameOptions[0]}"</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Chat Session Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmModal && deleteConfirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Delete Conversation?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Is chat thread ko delete karne se yeh hamesha ke liye hat jayega.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                  "{deleteConfirmModal.title}"
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmModal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  Cancel / Cancel Karein
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteSession(deleteConfirmModal.sessionId);
                    setDeleteConfirmModal(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-600/20 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete / Haataien
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Market Analysis Report Full View Modal */}
      {activeMarketReport && (
        <MarketAnalysisModal
          report={activeMarketReport}
          onClose={() => setActiveMarketReport(null)}
        />
      )}

      {/* Executive Thread Summary Modal */}
      <AnimatePresence>
        {threadSummaryModalOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-amber-500/30 dark:border-amber-500/40 relative overflow-hidden flex flex-col max-h-[88vh]"
            >
              {/* Gold glow top bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 shadow-[0_0_14px_#f59e0b]" />

              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 shrink-0 shadow-sm">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-2">
                      <span>Executive Thread Summary</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        AI CONTEXT
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-md">
                      {threadSummarySession?.title || "Active Chat Thread"} • {threadSummarySession?.messageCount || 0} messages
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setThreadSummaryModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content Body */}
              <div className="my-4 flex-1 overflow-y-auto pr-1 space-y-4">
                {isSummarizingThread ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-150 dark:border-slate-800/80">
                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-full animate-bounce">
                      <Sparkles className="w-6 h-6 text-amber-500" />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      <span>Synthesizing Executive Chat Thread Summary with Gemini AI...</span>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center max-w-xs">
                      Extracting key takeaways, technical decisions, and action items for instant context switching.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-950/70 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed font-sans select-text">
                    <div className="markdown-body">
                      <Markdown>{threadSummaryText}</Markdown>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              {!isSummarizingThread && threadSummaryText && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyThreadSummary}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {threadSummaryCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied Summary!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Summary</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadThreadSummary}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>Download .md</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleInsertSummaryIntoChat}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-950" />
                      <span>Insert Summary into Chat</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Owner Info Modal (Read-Only) */}
      <OwnerInfoModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profile={ownerProfile}
      />

      {/* User Profile Personalization Modal */}
      <UserProfileModal
        isOpen={userProfileModalOpen}
        onClose={() => setUserProfileModalOpen(false)}
        profile={userProfile}
        onSave={handleSaveUserProfile}
      />

      {/* Profile Save Toast Notification */}
      <AnimatePresence>
        {profileSaveToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-amber-500/50 shadow-2xl text-slate-100 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-400">Founder Info Loaded!</h4>
              <p className="text-[10px] text-slate-300">
                {ownerProfile.name}'s class ({ownerProfile.className}) & age ({ownerProfile.age}) verified in system memory.
              </p>
            </div>
          </motion.div>
        )}

        {userProfileSaveToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-cyan-500/50 shadow-2xl text-slate-100 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-400 text-slate-950 font-black flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-cyan-400">User Profile Saved!</h4>
              <p className="text-[10px] text-slate-300">
                CORE AI learned your details ({userProfile.name || "User"}) & updated personalization settings.
              </p>
            </div>
          </motion.div>
        )}

        {/* Global Floating AI Speaking Indicator & Mute Control Widget */}
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            className="fixed top-16 sm:top-18 right-3 sm:right-6 z-50 flex items-center gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-2xl border border-cyan-400/60 rounded-2xl shadow-2xl shadow-cyan-500/25 max-w-[calc(100vw-1.5rem)] select-none ring-1 ring-cyan-500/30"
          >
            {/* Animated Equalizer Waveform */}
            <div className="flex items-center gap-1 h-5 px-1 shrink-0">
              <motion.span
                animate={{ height: ["4px", "18px", "6px", "16px", "4px"] }}
                transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut" }}
                className="w-1 bg-[#00e5ff] rounded-full shadow-[0_0_8px_#00e5ff]"
              />
              <motion.span
                animate={{ height: ["14px", "4px", "18px", "8px", "14px"] }}
                transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.1 }}
                className="w-1 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"
              />
              <motion.span
                animate={{ height: ["6px", "16px", "4px", "18px", "6px"] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0.2 }}
                className="w-1 bg-[#00e5ff] rounded-full shadow-[0_0_8px_#00e5ff]"
              />
              <motion.span
                animate={{ height: ["16px", "6px", "12px", "4px", "16px"] }}
                transition={{ repeat: Infinity, duration: 0.65, ease: "easeInOut", delay: 0.15 }}
                className="w-1 bg-cyan-300 rounded-full"
              />
            </div>

            {/* Speaking Info Label */}
            <div className="flex flex-col min-w-0 pr-1">
              <span className="text-[11px] font-mono font-bold text-[#00e5ff] flex items-center gap-1.5 leading-tight">
                <Volume2 className="w-3.5 h-3.5 text-[#00e5ff] animate-pulse" />
                <span>AI Speaking...</span>
              </span>
              <span className="text-[10px] text-slate-300 font-sans truncate max-w-[110px] sm:max-w-[170px]">
                Audio voice active
              </span>
            </div>

            {/* Direct Mute / Stop Button */}
            <button
              type="button"
              onClick={() => {
                playUiSound("toggle", soundEffectsEnabled);
                handleStopSpeaking();
              }}
              className="px-3 py-1.5 bg-rose-500/25 hover:bg-rose-500/40 text-rose-100 border border-rose-500/60 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md shrink-0"
              title="Click to Mute AI Voice (Stop Audio)"
            >
              <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-mono text-xs font-bold text-rose-100">Mute Voice</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
