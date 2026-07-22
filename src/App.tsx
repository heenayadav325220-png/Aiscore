import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Menu,
  MoreVertical,
  Send,
  Mic,
  Paperclip,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  PlayCircle,
  Sparkles,
  Lightbulb,
  Code,
  FileText,
  User,
  CheckCircle,
  X,
  Trash2,
  MessageSquare,
  Download,
  FileJson,
  Printer,
  Copy,
  Check,
  AlertTriangle,
  Keyboard,
  Bold,
  Italic,
  Sun,
  Moon,
  Tag
} from "lucide-react";

import { exportChatToHtml, exportChatToJson } from "./lib/exportUtils";
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
  ChatSession
} from "./types";

import Sidebar from "./components/Sidebar";
import IdeaEvaluator from "./components/IdeaEvaluator";
import PrototypeEngine from "./components/PrototypeEngine";
import WritingAssistant from "./components/WritingAssistant";
import ImageGenerator from "./components/ImageGenerator";
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
  if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("networkerror")) {
    return "Network connection slow or offline. Please check your network and retry!";
  }
  return msg || "Connection slow or API error occurred. Please try again!";
}

export default function App() {
  // Navigation drawer
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Settings dropdown tab state
  const [activeView, setActiveView] = useState<"chat" | "evaluator" | "blueprint" | "visuals" | "writer">("chat");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Core application data lists
  const [ideas, setIdeas] = useState<IdeaEvaluation[]>([]);
  const [guidanceList, setGuidanceList] = useState<PrototypeGuidance[]>([]);

  // Active items being focused in sub-views
  const [activeEvaluation, setActiveEvaluation] = useState<IdeaEvaluation | null>(null);
  const [activeGuidance, setActiveGuidance] = useState<PrototypeGuidance | null>(null);

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

  // Chat sessions state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");

  // Input states
  const [inputText, setInputText] = useState("");
  const [attachedImage, setAttachedImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

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
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Active Session Tag Editing state
  const [activeTagPopoverOpen, setActiveTagPopoverOpen] = useState(false);
  const [headerNewTagInput, setHeaderNewTagInput] = useState("");

  const handleUpdateSessionTags = (sessionId: string, newTags: string[]) => {
    setChatSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId ? { ...session, tags: newTags } : session
      )
    );
  };

  const handleCopyMessage = (msgId: string, text: string) => {
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
  };

  const handleToggleReaction = (messageId: string, emoji: string) => {
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
  const activeAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const activeAudioCtxRef = useRef<AudioContext | null>(null);

  // Snapshot tracking refs to eliminate infinite write feedback loops & stream exhaustion
  const lastRemoteSessionsJsonRef = useRef<string>("");
  const lastRemoteIdeasJsonRef = useRef<string>("");
  const lastRemoteGuidanceJsonRef = useRef<string>("");
  const lastRemoteInstructionsJsonRef = useRef<string>("");
  const lastRemoteThemeJsonRef = useRef<string>("");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // User details
  const userEmail = "heenayadav325220@gmail.com";

  // Initialize first chat session on load
  useEffect(() => {
    // Load state from localStorage if available
    const cachedSessions = localStorage.getItem("core_ai_sessions");
    const cachedIdeas = localStorage.getItem("core_ai_ideas");
    const cachedGuidance = localStorage.getItem("core_ai_guidance");

    if (cachedSessions) {
      try {
        const parsed = JSON.parse(cachedSessions);
        setChatSessions(parsed);
        if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error(e);
      }
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
        setChatSessions(firestoreSessions);
        setActiveSessionId((curr) => {
          if (!curr || !firestoreSessions.some((s) => s.id === curr)) {
            return firestoreSessions[0].id;
          }
          return curr;
        });
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

    if (activeSessionMessagesCount >= 3 && !activeSessionTitleAutoGenerated) {
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
                  s.id === activeSessionId ? { ...s, title: data.title, titleAutoGenerated: true } : s
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
      speechRecognitionRef.current.start();
    }
  };

  // Speak response out loud using Gemini TTS if enabled, or browser SpeechSynthesis as fallback
  const handleSpeakText = async (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
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
      return;
    }

    setIsSpeaking(true);

    try {
      // Lazy attempt to use Gemini high-fidelity TTS route
      const response = await fetch("/api/generate-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.slice(0, 300), // Limit text payload size for faster latency
          mode: getActiveMode() === "guider" ? "robotic" : "human",
        }),
      });

      if (!response.ok) throw new Error("TTS route error");

      const data = await response.json();
      const audioBytes = data.audio;
      if (audioBytes) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        activeAudioCtxRef.current = audioCtx;

        const binary = atob(audioBytes);
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
          setIsSpeaking(false);
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
          view.setUint32(28, sampleRate * 2, true); // byte rate (sampleRate * blockAlign)
          view.setUint16(32, 2, true); // block align
          view.setUint16(34, 16, true); // 16 bits per sample
          writeString(view, 36, "data");
          view.setUint32(40, pcmBytes.length, true);

          const wavBytes = new Uint8Array(buffer);
          wavBytes.set(pcmBytes, 44);
          return wavBytes;
        };

        const wavBytes = wrapPcmWithWavHeader(bytes, 24000);

        // Try standard decodeAudioData first with WAV container
        audioCtx.decodeAudioData(
          wavBytes.buffer,
          (buffer) => {
            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.onended = handlePlaybackEnded;
            activeAudioSourceRef.current = source;
            source.start();
          },
          (err) => {
            console.warn("WAV decodeAudioData failed, trying raw PCM-16 decoding fallback:", err);
            try {
              const bufferLength = bytes.length;
              // Each sample is 2 bytes (16-bit)
              const numSamples = Math.floor(bufferLength / 2);
              const dataView = new DataView(bytes.buffer);
              
              const audioBuffer = audioCtx.createBuffer(1, numSamples, 24000); // 24kHz as per Gemini TTS spec
              const channelData = audioBuffer.getChannelData(0);
              
              for (let i = 0; i < numSamples; i++) {
                // Read 16-bit signed integer, little endian (true)
                const sample = dataView.getInt16(i * 2, true);
                // Scale to float32 [-1.0, 1.0]
                channelData[i] = sample / 32768.0;
              }
              
              const source = audioCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioCtx.destination);
              source.onended = handlePlaybackEnded;
              activeAudioSourceRef.current = source;
              source.start();
            } catch (pcmErr) {
              console.error("Raw PCM playback failed, falling back to Web Speech Synthesis:", pcmErr);
              speakWebFallback(text);
            }
          }
        );
      } else {
        speakWebFallback(text);
      }
    } catch (e) {
      console.warn("Express TTS not responsive, falling back to Web Speech Synthesis:", e);
      speakWebFallback(text);
    }
  };

  const speakWebFallback = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 500));
    const mode = getActiveMode();

    if (mode === "guider") {
      utterance.pitch = 0.8;
      utterance.rate = 1.1; // precise robotic feel
    } else if (mode === "companion") {
      utterance.pitch = 1.1;
      utterance.rate = 0.95; // warm, natural conversational feel
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
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

    setIsAiProcessing(true);

    try {
      let endpoint = "/api/chat";
      let requestPayload: any = {
        messages: updatedMessages,
        activeMode: getActiveMode(),
        customInstructions: `${customInstructions.targetDomain} | style: ${customInstructions.personalityStyle} | coding: ${customInstructions.codePreference}`,
      };

      // Check if this is a direct instruction to evaluate an idea, or if an image is attached (multimodal)
      if (imagePayload) {
        endpoint = "/api/analyze-image";
        requestPayload = {
          base64Data: imagePayload.base64,
          mimeType: imagePayload.mimeType,
          prompt: textToSend || "Analyze this wireframe layout sketch and suggest user stories or tech implementation.",
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Synthesis failed.");
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
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, aiMsg] } : s))
      );

      let currentText = "";
      let currentIndex = 0;
      const totalLength = aiResponseText.length;
      const step = Math.max(1, Math.ceil(totalLength / 250));
      const intervalMs = 15;

      const typingTimer = setInterval(() => {
        if (currentIndex < totalLength) {
          const nextIndex = Math.min(currentIndex + step, totalLength);
          currentText += aiResponseText.substring(currentIndex, nextIndex);
          currentIndex = nextIndex;

          setChatSessions((prev) =>
            prev.map((s) => {
              if (s.id === activeSessionId) {
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
              if (s.id === activeSessionId) {
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
        handleSpeakText(aiResponseText);
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
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s))
      );
    } finally {
      setIsAiProcessing(false);
    }
  };

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
          setActiveView("blueprint");
        } else if (e.key === "4") {
          e.preventDefault();
          setActiveView("visuals");
        } else if (e.key === "5") {
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
        text: `📊 **CORE Evaluation Completed!** I have analyzed your concept: **"${newEval.title}"**. Viability Verdict assigned: **${newEval.overallScore}%**. You can view the full scorecard, strengths matrix, and technical recommendations inside the *Blueprint Tab*.`,
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
      setActiveView("blueprint");

      // Send a follow-up chat log
      const systemConfirm: ChatMessage = {
        id: "msg_sys_blueprint_" + Date.now(),
        role: "model",
        text: `🛠️ **Interactive Wireframe Blueprint Generated!** Click on the **Interactive Blueprint Tab** to view your mobile layout concept, review recommended tech stack items, and manage execution milestones.`,
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

  // Helper to trigger evaluation from sample buttons
  const loadStarterConcept = (starter: string) => {
    setInputText(starter);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col justify-between relative font-sans overflow-x-hidden select-none pb-2 transition-colors">
      {/* Top Navigation Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-30 flex items-center justify-between px-4 shadow-xs select-none transition-colors">
        <div className="flex items-center gap-2">
          {/* Left: Sidebar Toggle Button [≡] */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="Open Menu Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-extrabold font-display text-base tracking-tight text-slate-950 dark:text-white neon-text-glow">
            CORE AI
          </span>
        </div>

        {/* Center: Active mode status display & Firestore Live DB Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            <div className="w-1.5 h-1.5 bg-[#00e5ff] rounded-full shadow-[0_0_8px_#00e5ff]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-300 font-bold">
              Mode: {getActiveMode()}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
            <span>Firestore DB Live</span>
          </div>
        </div>

        {/* Right: Image & Prototype Generator trigger, Dark Mode toggle, Keyboard shortcuts, & Settings options trigger */}
        <div className="flex items-center gap-1.5 relative">
          {/* Direct Image & Prototype Generator Navigation Button */}
          <button
            id="nav-image-prototype-btn"
            onClick={() => {
              if (activeView === "visuals") {
                setActiveView("blueprint");
              } else {
                setActiveView("visuals");
              }
            }}
            className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer font-bold text-xs border ${
              activeView === "visuals" || activeView === "blueprint"
                ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                : "bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400"
            }`}
            title="Image & Prototype Generator (Click to open)"
          >
            <ImageIcon className={`w-4 h-4 ${activeView === "visuals" || activeView === "blueprint" ? "text-slate-950" : "text-cyan-500 dark:text-cyan-400"}`} />
            <span className="hidden sm:inline font-mono text-[11px]">Image & Prototype</span>
          </button>

          {/* Dark Mode Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <button
            onClick={() => setShortcutsOpen(true)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
            title="Keyboard Shortcuts Cheatsheet"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="View Options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Quick tab dropdown overlay */}
          <AnimatePresence>
            {settingsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-xl rounded-2xl p-2 z-50 overflow-hidden"
                >
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold px-3 py-1.5 block">
                    Synthesizer Views
                  </span>
                  {[
                    { id: "chat", label: "Core Chat Console", icon: MessageSquare, shortcut: "Alt+1" },
                    { id: "evaluator", label: "Viability Evaluator", icon: Lightbulb, shortcut: "Alt+2" },
                    { id: "blueprint", label: "Interactive Blueprints", icon: Code, shortcut: "Alt+3" },
                    { id: "visuals", label: "Mockups & Sketches", icon: ImageIcon, shortcut: "Alt+4" },
                    { id: "writer", label: "Writing Canvas", icon: FileText, shortcut: "Alt+5" },
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
                        className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#00e5ff]/10 text-slate-900 dark:text-slate-100 border border-[#00e5ff]/30"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isSelected ? "text-[#00e5ff]" : "text-slate-400 dark:text-slate-500"}`} />
                          {tab.label}
                        </div>
                        <kbd className="px-1 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 text-slate-400 dark:text-slate-400 text-[8px] font-mono rounded font-medium shrink-0">
                          {tab.shortcut}
                        </kbd>
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col justify-between"
            >
              {/* Compact Chat empty state */}
              {getActiveMessages().length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center py-6 px-4 text-center space-y-4 select-none">
                  {/* Clean Minimal Core Logo Only */}
                  <div className="relative">
                    <motion.div
                      animate={{ scale: [1, 1.04, 1] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="w-12 h-12 rounded-2xl border-2 border-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.25)] flex items-center justify-center bg-slate-950"
                    >
                      <span className="font-extrabold text-lg font-display text-white tracking-wider leading-none">
                        C
                      </span>
                    </motion.div>
                  </div>

                  {/* Starter Quick Actions (compact, fitting text snugly) */}
                  <div className="flex flex-wrap justify-center items-center gap-2 max-w-xl px-2">
                    <button
                      onClick={() =>
                        handleTriggerEvaluation(
                          "A smart micro-farming system that uses soil sensors and localized weather APIs to automate drip irrigation cycles."
                        )
                      }
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-cyan-400 dark:hover:border-cyan-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer shadow-2xs text-left"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-[#00e5ff] shrink-0" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        IoT Micro-Farming
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        handleTriggerEvaluation(
                          "A localized hyper-casual mobile network where users exchange spare battery power and hotspot mesh credentials."
                        )
                      }
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-cyan-400 dark:hover:border-cyan-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer shadow-2xs text-left"
                    >
                      <Code className="w-3.5 h-3.5 text-[#00e5ff] shrink-0" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        Mesh Hotspot Network
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Compact Active Chat Message Thread */
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3.5 max-w-3xl w-full mx-auto select-none">
                  {/* Active Thread Export Header */}
                  <div id="chat-thread-export-bar" className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                          {getActiveSession()?.title || "Current Conversation"}
                        </h4>

                        {/* Active Session Tags Badges */}
                        {getActiveSession()?.tags?.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800"
                          >
                            <Tag className="w-2.5 h-2.5 text-cyan-500" />
                            {t}
                            <button
                              onClick={() => {
                                const session = getActiveSession();
                                if (session) {
                                  handleUpdateSessionTags(
                                    session.id,
                                    (session.tags || []).filter((tag) => tag !== t)
                                  );
                                }
                              }}
                              className="text-cyan-600 hover:text-rose-500 cursor-pointer"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}

                        <button
                          onClick={() => setActiveTagPopoverOpen(!activeTagPopoverOpen)}
                          className="px-2 py-0.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-[9px] flex items-center gap-1 transition-colors cursor-pointer border border-cyan-400/30"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {getActiveSession()?.tags?.length ? "Edit Tags" : "+ Add Tag"}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          id="btn-export-chat-json"
                          onClick={() => {
                            const session = getActiveSession();
                            if (session) exportChatToJson(session);
                          }}
                          className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          title="Export JSON"
                        >
                          <FileJson className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                          JSON
                        </button>
                        <button
                          id="btn-export-chat-pdf"
                          onClick={() => {
                            const session = getActiveSession();
                            if (session) exportChatToHtml(session);
                          }}
                          className="px-2 py-1 bg-slate-900 dark:bg-slate-950 text-white font-bold text-[10px] rounded-lg border border-slate-800 hover:bg-slate-800 dark:hover:bg-slate-900 transition-all flex items-center gap-1 cursor-pointer"
                          title="Export PDF"
                        >
                          <Printer className="w-3 h-3 text-cyan-400" />
                          PDF
                        </button>
                      </div>
                    </div>

                    {/* Tag Popover Form */}
                    {activeTagPopoverOpen && (
                      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                          <span>SESSION TAGS FOR "{getActiveSession()?.title}"</span>
                          <button
                            onClick={() => setActiveTagPopoverOpen(false)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const session = getActiveSession();
                            const trimmed = headerNewTagInput.trim();
                            if (session && trimmed) {
                              const current = session.tags || [];
                              if (!current.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
                                handleUpdateSessionTags(session.id, [...current, trimmed]);
                              }
                              setHeaderNewTagInput("");
                            }
                          }}
                          className="flex items-center gap-1.5"
                        >
                          <input
                            type="text"
                            value={headerNewTagInput}
                            onChange={(e) => setHeaderNewTagInput(e.target.value)}
                            placeholder="Type a custom tag (e.g. Strategy, Urgent, Feature)..."
                            className="flex-1 px-2.5 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-400"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-cyan-400 cursor-pointer shadow-xs"
                          >
                            Add Tag
                          </button>
                        </form>

                        {/* Preset Tag Buttons */}
                        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[9px]">
                          <span className="text-slate-400 font-mono">Suggestions:</span>
                          {["Strategy", "Tech", "Idea", "Priority", "Research", "Design", "Feedback"].map((sug) => {
                            const session = getActiveSession();
                            const hasTag = session?.tags?.includes(sug);
                            return (
                              <button
                                key={sug}
                                type="button"
                                onClick={() => {
                                  if (session && !hasTag) {
                                    handleUpdateSessionTags(session.id, [...(session.tags || []), sug]);
                                  }
                                }}
                                className={`px-2 py-0.5 rounded-full border text-[9px] font-bold cursor-pointer transition-colors ${
                                  hasTag
                                    ? "bg-cyan-500 text-slate-950 border-cyan-400"
                                    : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyan-400"
                                }`}
                              >
                                +{sug}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {getActiveMessages().map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 items-start ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 font-bold text-xs ${
                          msg.role === "user"
                            ? "bg-slate-900 dark:bg-cyan-950 text-white dark:text-cyan-200 border-slate-800 dark:border-cyan-800"
                            : "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-cyan-400 dark:border-cyan-500/60 shadow-[0_0_10px_rgba(0,229,255,0.15)]"
                        }`}
                      >
                        {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : "C"}
                      </div>

                      {/* Msg bubble */}
                      <div className="space-y-1.5 max-w-[82%]">
                        <div
                          className={`p-3 rounded-2xl border text-xs leading-relaxed font-sans ${
                            msg.role === "user"
                              ? "bg-slate-900 dark:bg-slate-800 border-slate-800 dark:border-slate-700 text-white dark:text-slate-100 rounded-tr-none shadow-xs"
                              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none shadow-2xs"
                          }`}
                        >
                          {/* Attached image preview inside bubble */}
                          {msg.imageAttached && (
                            <div className="mb-2 max-w-xs rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                              <img
                                src={`data:${msg.imageAttached.mimeType};base64,${msg.imageAttached.base64}`}
                                alt="Multimodal user upload"
                                referrerPolicy="no-referrer"
                                className="w-full h-auto max-h-[140px] object-cover"
                              />
                            </div>
                          )}

                          <div className="prose prose-sm font-medium whitespace-pre-wrap text-slate-800 dark:text-slate-100">
                            {msg.text}
                            {msg.isTyping && (
                              <span className="inline-block w-1.5 h-3.5 bg-cyan-400 animate-pulse ml-1 rounded-xs shadow-[0_0_8px_var(--color-neon-blue)] align-middle" style={{ backgroundColor: "var(--color-neon-blue)" }} />
                            )}
                          </div>
                        </div>

                        {/* Interactive Speech Read out button and reactions */}
                        <div
                          className={`flex flex-wrap items-center gap-2 ${
                            msg.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">{msg.timestamp}</span>
                          {msg.role === "model" && (
                            <>
                              {/* Quick Reaction Selector */}
                              <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-full px-1.5 py-0.5 shadow-2xs">
                                {["👍", "❤️", "💡", "🔥", "👏"].map((emoji) => {
                                  const isReacted = msg.reactions?.includes(emoji);
                                  return (
                                    <button
                                      key={emoji}
                                      onClick={() => handleToggleReaction(msg.id, emoji)}
                                      className={`text-[11px] leading-none px-1 py-0.5 rounded-full transition-all cursor-pointer ${
                                        isReacted
                                          ? "bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-700 text-slate-900 dark:text-cyan-100 scale-110 font-bold shadow-2xs"
                                          : "hover:bg-slate-200/60 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 opacity-60 hover:opacity-100"
                                      }`}
                                      title={isReacted ? `Remove ${emoji} reaction` : `React with ${emoji}`}
                                    >
                                      {emoji}
                                    </button>
                                  );
                                })}
                              </div>

                              <button
                                onClick={() => handleSpeakText(msg.text)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 dark:text-slate-500 hover:text-[#00e5ff] transition-colors cursor-pointer"
                                title="Speak out loud"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleCopyMessage(msg.id, msg.text)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 dark:text-slate-500 hover:text-[#00e5ff] transition-colors cursor-pointer flex items-center"
                                title="Copy response text"
                              >
                                {copiedMessageId === msg.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </>
                          )}
                        </div>

                        {/* Selected Reactions Display Badges */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {msg.reactions.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleToggleReaction(msg.id, emoji)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-50/90 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800 rounded-full text-xs font-semibold text-slate-700 dark:text-cyan-200 shadow-2xs hover:bg-cyan-100 dark:hover:bg-cyan-900 transition-colors cursor-pointer group"
                                title="Click to remove reaction"
                              >
                                <span>{emoji}</span>
                                <span className="text-[10px] text-cyan-700 dark:text-cyan-300 font-extrabold group-hover:text-cyan-900 dark:group-hover:text-cyan-100">1</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* AI Synthesizing Loader */}
                  {isAiProcessing && <ChatSkeleton />}

                  <div ref={messageEndRef} />
                </div>
              )}
            </motion.div>
          )}

          {activeView === "evaluator" && (
            <motion.div
              key="evaluator-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isAiProcessing ? (
                <ScorecardSkeleton />
              ) : activeEvaluation ? (
                <IdeaEvaluator
                  evaluation={activeEvaluation}
                  onGenerateGuidance={handleTriggerGuidance}
                  isGeneratingGuidance={isGeneratingGuidance}
                />
              ) : (
                <div className="text-center p-12 max-w-md mx-auto space-y-4">
                  <Lightbulb className="w-12 h-12 text-[#00e5ff] mx-auto animate-pulse" />
                  <h3 className="text-base font-bold font-display text-slate-800 dark:text-slate-100">No active concept evaluation</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400 font-medium font-sans">
                    Submit any raw idea on the conversational chat console, and CORE AI will assess its feasibility and market size, generating a comprehensive scorecard here.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeView === "blueprint" && (
            <motion.div
              key="blueprint-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isGeneratingGuidance ? (
                <BlueprintSkeleton />
              ) : activeGuidance ? (
                <PrototypeEngine
                  guidance={activeGuidance}
                  onGenerateImage={handleGenerateImageFromMockup}
                  isGeneratingImage={isGeneratingMockup}
                  onAnalyzeImage={handleAnalyzeImageFromEngine}
                  isAnalyzingImage={isAiProcessing}
                />
              ) : (
                <div className="text-center p-12 max-w-md mx-auto space-y-4">
                  <Code className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto" />
                  <h3 className="text-base font-bold font-display text-slate-800 dark:text-slate-100">No active prototype blueprint</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400 font-medium font-sans">
                    Evaluate any idea first inside the scorecard view, then click the "Build Blueprint" CTA to map implementation milestones and generate visual wireframes here.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeView === "visuals" && (
            <motion.div key="visuals-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {isGeneratingMockup ? (
                <ImageGeneratorSkeleton />
              ) : (
                <ImageGenerator
                  onGenerateImage={handleGenerateImageFromMockup}
                  onAnalyzeImage={handleAnalyzeImageFromEngine}
                  isGenerating={isGeneratingMockup}
                  isAnalyzing={isAiProcessing}
                />
              )}
            </motion.div>
          )}

          {activeView === "writer" && (
            <motion.div key="writer-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {isWriting ? (
                <WritingAssistantSkeleton />
              ) : (
                <WritingAssistant onDraftDocument={handleDraftFromAssistant} isDrafting={isWriting} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Console Input Area */}
      {activeView === "chat" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-[#0b0f19] dark:via-[#0b0f19]/95 dark:to-transparent z-20 select-none">
          <div className="max-w-3xl w-full mx-auto relative space-y-2">
            {/* Dynamic Animated Neon Light Wave Accent indicating active listener */}
            <div className="h-[2px] w-[95%] mx-auto overflow-hidden rounded-full mb-1">
              <div
                className={`h-full w-full rounded-full transition-all duration-300 ${
                  isAiProcessing || isListeningVoice
                    ? "neon-light-accent opacity-100"
                    : "bg-slate-100 dark:bg-slate-800 opacity-40"
                }`}
              />
            </div>

            {/* Sample Quick-Pill Prompts for single-click testing */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar select-none px-1">
              <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-extrabold shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#00e5ff]" /> Quick Try:
              </span>
              {[
                { icon: "💡", label: "Analyze AI study planner SaaS", prompt: "Analyze micro-SaaS idea for AI study planner with viral loops and revenue model" },
                { icon: "🚀", label: "Draft auth engine spec", prompt: "Draft technical spec for scalable auth engine with JWT, OAuth2 and session refresh" },
                { icon: "🎨", label: "Generate dark dashboard UI", prompt: "Generate UI wireframe layout for dark mode dashboard with metrics analytics" },
              ].map((pill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    handleSendMessage(undefined, pill.prompt);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800/90 hover:bg-cyan-50 dark:hover:bg-cyan-950/80 border border-slate-200 dark:border-slate-700 hover:border-cyan-400/80 text-slate-700 dark:text-slate-200 hover:text-cyan-700 dark:hover:text-cyan-200 text-[10px] font-semibold shrink-0 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                  title={`Click to send: "${pill.prompt}"`}
                >
                  <span>{pill.icon}</span>
                  <span className="truncate max-w-[150px] sm:max-w-none">{pill.label}</span>
                </button>
              ))}
            </div>

            {/* Quick Formatting Toolbar */}
            <div className="flex items-center gap-1.5 px-3 py-1">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mr-1">Style:</span>
              <button
                type="button"
                onClick={() => applyFormatting("bold")}
                className="p-1 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-150 dark:border-slate-700 text-slate-600 dark:text-slate-200 font-sans font-extrabold text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                title="Bold Selection (Ctrl+B / **text**)"
              >
                <Bold className="w-3 h-3 text-slate-500 dark:text-slate-400 stroke-[3px]" />
                Bold
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("italic")}
                className="p-1 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-150 dark:border-slate-700 text-slate-600 dark:text-slate-200 font-sans italic text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                title="Italic Selection (Ctrl+I / *text*)"
              >
                <Italic className="w-3 h-3 text-slate-500 dark:text-slate-400 stroke-[2.5px]" />
                Italic
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("code")}
                className="p-1 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-150 dark:border-slate-700 text-slate-600 dark:text-slate-200 font-mono text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                title="Code Block (```)"
              >
                <Code className="w-3 h-3 text-slate-500 dark:text-slate-400 stroke-[2.5px]" />
                Code
              </button>
              <span className="text-[8px] text-slate-400 dark:text-slate-500 select-none ml-1 font-mono hidden sm:inline">
                • highlight text & click a style to wrap
              </span>
            </div>

            {/* Bottom Input Box Console with glowing blue neon rounded border ring */}
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-full transition-all border-2 neon-border-glowing"
            >
              {/* Attachment Button (+) */}
              <button
                type="button"
                onClick={handleTriggerAttachment}
                className="p-1.5 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
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
                onChange={(e) => setInputText(e.target.value)}
                placeholder="ASK CORE..."
                className="flex-1 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:ring-0 bg-transparent py-1.5"
              />

              {/* Float Thumbnail of loaded attachment if any */}
              {attachedImage && (
                <div className="relative shrink-0 pr-1.5">
                  <div className="w-8 h-8 rounded border border-cyan-400 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
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

              {/* Voice record action icon (🎙️) */}
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className={`p-1.5 rounded-full transition-all shrink-0 cursor-pointer ${
                  isListeningVoice
                    ? "bg-rose-500 text-white animate-pulse"
                    : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
                title="Voice Recording"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Send button (⬆️) */}
              <button
                type="submit"
                disabled={!inputText.trim() && !attachedImage}
                className="p-2 rounded-full bg-[#00e5ff] text-slate-950 font-bold hover:bg-[#00b0ff] transition-all disabled:opacity-30 cursor-pointer shrink-0 shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                title="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick help status */}
            <div className="flex items-center justify-between px-2 select-none text-[9px] font-mono text-slate-400">
              <div className="flex items-center gap-2 truncate">
                <span className="truncate">{userEmail}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">
                  <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded font-sans text-[8px] font-bold text-slate-500">Ctrl+K</kbd> focus
                </span>
              </div>
              <button
                onClick={() => setVoicePlaybackEnabled(!voicePlaybackEnabled)}
                className="text-[9px] font-mono font-bold text-slate-400 hover:text-cyan-500 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
              >
                {voicePlaybackEnabled ? (
                  <>
                    <Volume2 className="w-3 h-3 text-cyan-500" />
                    TTS On
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3 h-3" />
                    TTS Off
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
        userEmail={userEmail}
        onUpdateSessionTags={handleUpdateSessionTags}
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
                    <span className="text-slate-500 font-sans">3. Prototype Blueprint</span>
                    <div className="flex gap-1">
                      <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded">Alt</kbd>
                      <span className="text-slate-300 font-mono text-[10px]">+</span>
                      <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded">3</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 font-sans">4. Mockups & Sketches</span>
                    <div className="flex gap-1">
                      <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded">Alt</kbd>
                      <span className="text-slate-300 font-mono text-[10px]">+</span>
                      <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded">4</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 font-sans">5. Writing Canvas</span>
                    <div className="flex gap-1">
                      <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded">Alt</kbd>
                      <span className="text-slate-300 font-mono text-[10px]">+</span>
                      <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded">5</kbd>
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
    </div>
  );
}
