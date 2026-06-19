"use client";

import { useState, useEffect } from "react";
import { Chip } from "./Chip";
import { Toast } from "./Toast";
import { CAT_META } from "@/lib/constants";
import { useFlashcards } from "@/hooks/useFlashcards";
import { useProgress } from "@/hooks/useProgress";
import { useTheme } from "@/hooks/useTheme";
import type { Flashcard } from "@/lib/types";

export default function FlashcardView() {
  const { cards, fetchCards } = useFlashcards();
  const { updateProgress } = useProgress();
  const { dark, toggle } = useTheme();
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const categories = Object.keys(CAT_META);

  useEffect(() => {
    fetchCards(activeCat ?? undefined);
    setIndex(0);
    setFlipped(false);
  }, [activeCat, fetchCards]);

  const card: Flashcard | undefined = cards[index];
  const catMeta = card ? CAT_META[card.cat] : null;

  function next() {
    setFlipped(false);
    setIndex((i) => Math.min(i + 1, cards.length - 1));
  }

  function prev() {
    setFlipped(false);
    setIndex((i) => Math.max(i - 1, 0));
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-text tracking-tight">
          InterviewOS Flashcards
        </span>
        <button
          onClick={toggle}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-surface border border-border text-base transition-colors"
          aria-label="Toggle theme"
        >
          {dark ? "☀️" : "🌙"}
        </button>
      </div>

      <div className="p-4 flex-1">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
          <Chip
            label="All"
            active={activeCat === null}
            color="#00e5ff"
            onClick={() => setActiveCat(null)}
            small
          />
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              active={activeCat === cat}
              color={CAT_META[cat].color}
              icon={CAT_META[cat].icon}
              onClick={() => setActiveCat(activeCat === cat ? null : cat)}
              small
            />
          ))}
        </div>

        {card ? (
          <>
            {/* Question header */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full border uppercase tracking-wider"
                  style={{
                    color: catMeta?.color,
                    borderColor: `${catMeta?.color}60`,
                    backgroundColor: `${catMeta?.color}12`,
                  }}
                >
                  {card.cat}
                </span>
                <span className="text-xs text-muted">
                  {index + 1} / {cards.length}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-text leading-snug mb-2">
                {card.q}
              </h2>

              <p className="text-xs text-muted2 uppercase tracking-widest">
                {card.sub}
              </p>
            </div>

            {/* Answer area */}
            {flipped ? (
              <div className="bg-surface border border-border rounded-2xl p-5 mb-4 animate-flipIn">
                <p
                  className="text-sm leading-relaxed [&_b]:font-semibold [&_b]:text-text"
                  style={{ color: "var(--theme-muted2)" }}
                  dangerouslySetInnerHTML={{ __html: card.a }}
                />
              </div>
            ) : (
              <button
                onClick={() => setFlipped(true)}
                className="w-full bg-surface border border-dashed border-border rounded-2xl p-10 mb-4 text-muted text-sm text-center transition-colors hover:border-border2"
              >
                Tap to reveal answer
              </button>
            )}

            {/* Nav / action buttons */}
            <div className="flex gap-3">
              <button
                onClick={prev}
                disabled={index === 0}
                className="py-3 px-4 rounded-xl border border-border text-sm text-muted2 disabled:opacity-30 transition-opacity"
              >
                ←
              </button>

              {flipped ? (
                <>
                  <button
                    onClick={() => {
                      updateProgress(card.id, true);
                      setToast({ visible: true, message: "Marked as known ✓" });
                      next();
                    }}
                    className="flex-1 py-3 rounded-xl bg-green/10 border border-green/40 text-sm text-green transition-all active:scale-95"
                  >
                    Got it ✓
                  </button>
                  <button
                    onClick={() => {
                      updateProgress(card.id, false);
                      setToast({ visible: true, message: "Added to review ↺" });
                      next();
                    }}
                    className="flex-1 py-3 rounded-xl bg-red/10 border border-red/40 text-sm text-red transition-all active:scale-95"
                  >
                    Review ✗
                  </button>
                </>
              ) : (
                <button
                  onClick={next}
                  disabled={index >= cards.length - 1}
                  className="flex-1 py-3 rounded-xl border border-border text-sm text-muted2 disabled:opacity-30 transition-opacity"
                >
                  Skip →
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="bg-surface border border-border rounded-2xl p-6 min-h-48 flex items-center justify-center">
            <p className="text-muted text-sm">No cards found</p>
          </div>
        )}
      </div>

      <Toast
        message={toast.message}
        visible={toast.visible}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </div>
  );
}
