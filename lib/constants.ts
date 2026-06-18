import type { CategoryMeta } from "./types";

export const COLORS = {
  bg: "#080a0e",
  surface: "#0f1117",
  surface2: "#151820",
  border: "#1e2535",
  border2: "#252d40",
  accent: "#00e5ff",
  accent2: "#7c3aed",
  accent3: "#f59e0b",
  green: "#10b981",
  red: "#ef4444",
  text: "#e2e8f0",
  muted: "#4a5568",
  muted2: "#64748b",
};

export const CAT_META: Record<string, CategoryMeta> = {
  "System Design": { color: "#00e5ff", icon: "🏗️" },
  Algorithms: { color: "#a78bfa", icon: "⚙️" },
  "Data Structures": { color: "#10b981", icon: "🌲" },
  Databases: { color: "#f59e0b", icon: "🗄️" },
  Networking: { color: "#f472b6", icon: "🌐" },
  "Design Patterns": { color: "#60a5fa", icon: "🧩" },
  "OS & Concurrency": { color: "#fb923c", icon: "⚡" },
  "Cloud & DevOps": { color: "#34d399", icon: "☁️" },
  Behavioral: { color: "#e879f9", icon: "🎤" },
  "Coding Patterns": { color: "#fbbf24", icon: "💡" },
};
