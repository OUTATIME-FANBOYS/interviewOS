"use client";

import { ProgressBar } from "./ProgressBar";
import { CAT_META } from "@/lib/constants";

// Placeholder stats — replace with real data from progress tracking
const MOCK_STATS = Object.entries(CAT_META).map(([cat, meta]) => ({
  cat,
  color: meta.color,
  icon: meta.icon,
  seen: Math.floor(Math.random() * 30),
  total: 30,
  mastered: Math.floor(Math.random() * 15),
}));

export default function StatsView() {
  const totalSeen = MOCK_STATS.reduce((s, c) => s + c.seen, 0);
  const totalCards = MOCK_STATS.reduce((s, c) => s + c.total, 0);
  const totalMastered = MOCK_STATS.reduce((s, c) => s + c.mastered, 0);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-text mb-1">Progress</h1>
      <p className="text-xs text-muted2 mb-6">Track your mastery across topics</p>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Seen", value: totalSeen, color: "text-accent" },
          { label: "Mastered", value: totalMastered, color: "text-green" },
          { label: "Remaining", value: totalCards - totalSeen, color: "text-accent3" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-surface border border-border rounded-xl p-3 text-center"
          >
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Per-category */}
      <div className="bg-surface border border-border rounded-2xl p-4">
        <p className="text-xs text-muted2 uppercase tracking-wider mb-4">
          By Category
        </p>
        {MOCK_STATS.map(({ cat, color, icon, seen, total, mastered }) => (
          <div key={cat} className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{icon}</span>
              <span className="text-sm text-text">{cat}</span>
              <span className="ml-auto text-xs text-muted">
                {mastered}/{total}
              </span>
            </div>
            <ProgressBar
              percentage={(seen / total) * 100}
              label={`${seen} seen`}
              color={color}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
