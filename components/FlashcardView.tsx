"use client";

import { useState, useEffect } from "react";
import { Chip } from "./Chip";
import { Toast } from "./Toast";
import { AppHeader } from "./AppHeader";
import { CAT_META } from "@/lib/constants";
import { useFlashcards } from "@/hooks/useFlashcards";
import { useProgress } from "@/hooks/useProgress";
import type { Flashcard } from "@/lib/types";

function formatAnswer(html: string): string {
  return html.replace(/\. (<b>)/g, ".<br><br>$1");
}

export default function FlashcardView() {
  const { cards, fetchCards } = useFlashcards();
  const { updateProgress } = useProgress();
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
      <AppHeader title="Flashcards" />

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
            {/* Category chip + counter */}
            <div className="flex items-center justify-between mb-4">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
                style={{
                  color: catMeta?.color,
                  borderColor: `${catMeta?.color}50`,
                  backgroundColor: `${catMeta?.color}10`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: catMeta?.color }}
                />
                {card.cat}
              </span>
              <span className="text-xs text-muted tabular-nums">
                {index + 1} / {cards.length}
              </span>
            </div>

            {/* Flip card */}
            <div
              className="flip-card mb-4 cursor-pointer"
              style={{ minHeight: "260px" }}
              onClick={() => !flipped && setFlipped(true)}
            >
              <div
                className={`flip-inner rounded-2xl${flipped ? " is-flipped" : ""}`}
                style={{ minHeight: "260px" }}
              >
                {/* Front — question */}
                <div
                  className="flip-face bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between"
                  style={{ minHeight: "260px" }}
                >
                  <div>
                    <h2 className="text-2xl font-bold text-text leading-snug mb-3">
                      {card.q}
                    </h2>
                    <p className="text-xs text-muted2 uppercase tracking-widest">
                      {card.sub}
                    </p>
                  </div>
                  <p className="text-xs text-muted text-center mt-4">Tap to reveal answer</p>
                </div>

                {/* Back — answer */}
                <div
                  className="flip-face flip-back bg-surface border border-border rounded-2xl p-6 overflow-y-auto"
                  style={{ minHeight: "260px" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <p
                    className="text-sm leading-relaxed [&_b]:font-semibold [&_b]:text-text"
                    style={{ color: "var(--theme-muted2)" }}
                    dangerouslySetInnerHTML={{ __html: formatAnswer(card.a) }}
                  />
                </div>
              </div>
            </div>

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
