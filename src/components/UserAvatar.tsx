import React from "react";
import { User } from "lucide-react";

export interface PresetAvatar {
  id: string;
  emoji: string;
  name: string;
  bg: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  { id: "preset:🧑‍💻", emoji: "🧑‍💻", name: "Coder / Developer", bg: "from-cyan-500 to-blue-600" },
  { id: "preset:🚀", emoji: "🚀", name: "Innovator", bg: "from-amber-500 to-orange-600" },
  { id: "preset:⚡", emoji: "⚡", name: "Tech Specialist", bg: "from-[#00e5ff] to-cyan-600" },
  { id: "preset:🤖", emoji: "🤖", name: "AI Explorer", bg: "from-purple-500 to-indigo-600" },
  { id: "preset:🎓", emoji: "🎓", name: "Student", bg: "from-emerald-500 to-teal-600" },
  { id: "preset:🌟", emoji: "🌟", name: "Creator", bg: "from-yellow-400 to-amber-500" },
  { id: "preset:👑", emoji: "👑", name: "Founder", bg: "from-amber-400 to-yellow-600" },
  { id: "preset:🎨", emoji: "🎨", name: "Designer", bg: "from-pink-500 to-rose-600" },
  { id: "preset:🛡️", emoji: "🛡️", name: "Cyber Pro", bg: "from-blue-600 to-slate-800" },
  { id: "preset:🧠", emoji: "🧠", name: "Analyst", bg: "from-violet-500 to-purple-700" },
  { id: "preset:🔥", emoji: "🔥", name: "High Performer", bg: "from-rose-500 to-red-600" },
  { id: "preset:💡", emoji: "💡", name: "Visionary", bg: "from-amber-400 to-yellow-500" },
];

interface UserAvatarProps {
  avatar?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  name,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs sm:text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-14 h-14 text-2xl",
    xl: "w-20 h-20 text-3xl",
  };

  const iconSizes = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
    xl: "w-10 h-10",
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;
  const currentIconSizeClass = iconSizes[size] || iconSizes.md;

  // Custom photo upload (base64 or URL)
  if (avatar && (avatar.startsWith("data:image/") || avatar.startsWith("http://") || avatar.startsWith("https://"))) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden border-2 border-cyan-400/80 shadow-md shrink-0 ${currentSizeClass} ${className}`}
      >
        <img
          src={avatar}
          alt={name || "User Avatar"}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Preset avatar (emoji)
  if (avatar && avatar.startsWith("preset:")) {
    const presetEmoji = avatar.replace("preset:", "");
    const matchedPreset = PRESET_AVATARS.find((p) => p.id === avatar);
    const bgGradient = matchedPreset ? matchedPreset.bg : "from-cyan-500 to-blue-600";

    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br ${bgGradient} text-white font-extrabold shadow-md border border-white/20 shrink-0 select-none ${currentSizeClass} ${className}`}
      >
        <span className="leading-none">{presetEmoji}</span>
      </div>
    );
  }

  // Direct emoji or fallback string
  if (avatar && avatar.length <= 4) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-extrabold shadow-md border border-white/20 shrink-0 select-none ${currentSizeClass} ${className}`}
      >
        <span className="leading-none">{avatar}</span>
      </div>
    );
  }

  // Initial letter or fallback user icon
  const initial = name ? name.trim().charAt(0).toUpperCase() : "";

  if (initial) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 via-emerald-400 to-blue-600 text-slate-950 font-black shadow-md shrink-0 select-none ${currentSizeClass} ${className}`}
      >
        <span>{initial}</span>
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-slate-800 text-cyan-400 border border-slate-700 shrink-0 ${currentSizeClass} ${className}`}
    >
      <User className={currentIconSizeClass} />
    </div>
  );
};
