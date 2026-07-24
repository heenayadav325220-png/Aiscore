import { AppLanguage, LanguageOption } from "../types";

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "hinglish", name: "Hinglish", nativeName: "Hinglish", flag: "🇮🇳" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
];

export const TRANSLATIONS: Record<AppLanguage, {
  appName: string;
  mode: string;
  inputPlaceholder: string;
  quickTry: string;
  tryButton: string;
  prototypeBtn: string;
  viewOptions: string;
  keyboardShortcuts: string;
  toggleTheme: string;
  selectLanguage: string;
  languageName: string;
  clearChat: string;
  newChat: string;
  history: string;
  settings: string;
  systemPromptInstruction: string;
}> = {
  en: {
    appName: "CORE AI",
    mode: "Mode",
    inputPlaceholder: "What would you like CORE to analyze?",
    quickTry: "Quick Try Suggestions",
    tryButton: "Try",
    prototypeBtn: "Prototype",
    viewOptions: "View Options",
    keyboardShortcuts: "Shortcuts",
    toggleTheme: "Toggle Theme",
    selectLanguage: "Select Language",
    languageName: "Language",
    clearChat: "Clear Chat",
    newChat: "New Analysis",
    history: "History",
    settings: "Settings",
    systemPromptInstruction: "Always respond in English.",
  },
  hi: {
    appName: "CORE AI",
    mode: "मोड",
    inputPlaceholder: "आप CORE से क्या विश्लेषण करवाना चाहते हैं?",
    quickTry: "त्वरित सुझाव",
    tryButton: "ट्राय करें",
    prototypeBtn: "प्रोटोटाइप",
    viewOptions: "देखें विकल्प",
    keyboardShortcuts: "शॉर्टकट्स",
    toggleTheme: "थीम बदलें",
    selectLanguage: "भाषा चुनें",
    languageName: "भाषा",
    clearChat: "चैट साफ़ करें",
    newChat: "नया विश्लेषण",
    history: "इतिहास",
    settings: "सेटिंग्स",
    systemPromptInstruction: "सदैव स्पष्ट और शुद्ध हिन्दी में उत्तर दें। (Respond in Hindi)",
  },
  hinglish: {
    appName: "CORE AI",
    mode: "Mode",
    inputPlaceholder: "CORE se kya analyze karwana chahte ho?",
    quickTry: "Quick Try Suggestions",
    tryButton: "Try Karo",
    prototypeBtn: "Prototype",
    viewOptions: "Options Dekho",
    keyboardShortcuts: "Shortcuts",
    toggleTheme: "Theme Badlo",
    selectLanguage: "Language Select Karo",
    languageName: "Language",
    clearChat: "Chat Clear Karo",
    newChat: "Naya Analysis",
    history: "History",
    settings: "Settings",
    systemPromptInstruction: "Always respond in natural Hinglish (Hindi written in Roman script mixed with English).",
  },
  es: {
    appName: "CORE AI",
    mode: "Modo",
    inputPlaceholder: "¿Qué te gustaría que CORE analice?",
    quickTry: "Sugerencias rápidas",
    tryButton: "Probar",
    prototypeBtn: "Prototipo",
    viewOptions: "Opciones de vista",
    keyboardShortcuts: "Atajos",
    toggleTheme: "Cambiar tema",
    selectLanguage: "Seleccionar idioma",
    languageName: "Idioma",
    clearChat: "Limpiar chat",
    newChat: "Nuevo análisis",
    history: "Historial",
    settings: "Ajustes",
    systemPromptInstruction: "Responde siempre en español.",
  },
  fr: {
    appName: "CORE AI",
    mode: "Mode",
    inputPlaceholder: "Que souhaitez-vous que CORE analyse ?",
    quickTry: "Suggestions rapides",
    tryButton: "Essayer",
    prototypeBtn: "Prototype",
    viewOptions: "Options d'affichage",
    keyboardShortcuts: "Raccourcis",
    toggleTheme: "Changer de thème",
    selectLanguage: "Choisir la langue",
    languageName: "Langue",
    clearChat: "Effacer le chat",
    newChat: "Nouvelle analyse",
    history: "Historique",
    settings: "Paramètres",
    systemPromptInstruction: "Répondez toujours en français.",
  },
  de: {
    appName: "CORE AI",
    mode: "Modus",
    inputPlaceholder: "Was möchten Sie, dass CORE analysiert?",
    quickTry: "Schnellvorschläge",
    tryButton: "Testen",
    prototypeBtn: "Prototyp",
    viewOptions: "Ansichtsoptionen",
    keyboardShortcuts: "Tastenkürzel",
    toggleTheme: "Design wechseln",
    selectLanguage: "Sprache wählen",
    languageName: "Sprache",
    clearChat: "Chat leeren",
    newChat: "Neue Analyse",
    history: "Verlauf",
    settings: "Einstellungen",
    systemPromptInstruction: "Antworten Sie immer auf Deutsch.",
  },
  ja: {
    appName: "CORE AI",
    mode: "モード",
    inputPlaceholder: "COREに何について分析させますか？",
    quickTry: "クイック提案",
    tryButton: "試す",
    prototypeBtn: "プロトタイプ",
    viewOptions: "表示オプション",
    keyboardShortcuts: "ショートカット",
    toggleTheme: "テーマ切り替え",
    selectLanguage: "言語を選択",
    languageName: "言語",
    clearChat: "チャット消去",
    newChat: "新規分析",
    history: "履歴",
    settings: "設定",
    systemPromptInstruction: "常に日本語で回答してください。",
  },
};

export function getLanguageInstruction(lang: AppLanguage): string {
  return TRANSLATIONS[lang]?.systemPromptInstruction || TRANSLATIONS.en.systemPromptInstruction;
}
