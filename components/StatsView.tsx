"use client";

import { useState, useEffect, useCallback } from "react";
import { ProgressBar } from "./ProgressBar";
import { CAT_META } from "@/lib/constants";
import { CARDS } from "@/data/cards";
import { db } from "@/lib/db";
import type { Progress } from "@/lib/types";

export default function StatsView() {
  const [progressMap, setProgressMap] = useState<Map<number, Progress>>(new Map());
  const [resetting, setResetting] = useState<number | null>(null);

  const load = useCallback(async () => {
    const rows = await db.getAllProgress();
    setProgressMap(new Map(rows.map((r) => [r.cardId, r])));
  }, []);

  useEffect(() => { load(); }, [load]);

  const catStats = Object.entries(CAT_META).map(([cat, meta]) => {
    const catCards = CARDS.filter((c) => c.cat === cat);
    const seen = catCards.filter((c) => progressMap.get(c.id)?.seen).length;
    const mastered = catCards.filter((c) => progressMap.get(c.id)?.mastered).length;
    return { cat, color: meta.color, icon: meta.icon, seen, mastered, total: catCards.length };
  });

  const totalCards = CARDS.length;
  const totalSeen = catStats.reduce((s, c) => s + c.seen, 0);
  const totalMastered = catStats.reduce((s, c) => s + c.mastered, 0);

  async function resetCard(cardId: number) {
    setResetting(cardId);
    await db.resetProgress(cardId);
    await load();
    setResetting(null);
  }

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
          <div key={label} className="bg-surface border border-border rounded-xl p-3 text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Per-category */}
      <div className="bg-surface border border-border rounded-2xl p-4 mb-6">
        <p className="text-xs text-muted2 uppercase tracking-wider mb-4">By Category</p>
        {catStats.map(({ cat, color, icon, seen, total, mastered }) => (
          <div key={cat} className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{icon}</span>
              <span className="text-sm text-text">{cat}</span>
              <span className="ml-auto text-xs text-muted">{mastered}/{total}</span>
            </div>
            <ProgressBar
              percentage={total > 0 ? (seen / total) * 100 : 0}
              label={`${seen} seen`}
              color={color}
            />
          </div>
        ))}
      </div>

      {/* Individual card resets */}
      {progressMap.size > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="text-xs text-muted2 uppercase tracking-wider mb-4">Reset Individual Cards</p>
          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
            {CARDS.filter((c) => progressMap.has(c.id)).map((c) => {
              const p = progressMap.get(c.id)!;
              return (
                <div key={c.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text truncate">{c.q}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {p.mastered ? "✓ mastered" : "↺ review"} · {p.attempts} attempt{p.attempts !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => resetCard(c.id)}
                    disabled={resetting === c.id}
                    className="shrink-0 text-xs px-2 py-1 rounded-lg border border-red/40 text-red bg-red/5 disabled:opacity-40 transition-opacity"
                  >
                    {resetting === c.id ? "…" : "Reset"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
