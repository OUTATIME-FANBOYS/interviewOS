"use client";

interface BottomNavProps {
  activeTab: "flash" | "quiz" | "stats";
  onTabChange: (tab: "flash" | "quiz" | "stats") => void;
}

const TABS = [
  { id: "flash" as const, icon: "⚡", label: "Flash" },
  { id: "quiz" as const, icon: "🎯", label: "Quiz" },
  { id: "stats" as const, icon: "📊", label: "Stats" },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-surface/95 backdrop-blur border-t border-border flex"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {TABS.map(({ id, icon, label }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex-1 py-2 flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
            activeTab === id ? "text-accent" : "text-muted"
          }`}
        >
          <span className="text-lg">{icon}</span>
          <span className="text-[10px] uppercase tracking-wider">{label}</span>
          {activeTab === id && (
            <div className="w-3 h-0.5 bg-accent rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
