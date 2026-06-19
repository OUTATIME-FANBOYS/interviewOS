"use client";

import { useState, useEffect } from "react";
import { Chip } from "./Chip";
import { Toast } from "./Toast";
import { CAT_META } from "@/lib/constants";
import { useFlashcards } from "@/hooks/useFlashcards";
import { useProgress } from "@/hooks/useProgress";
import type { Flashcard } from "@/lib/types";

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

  function showToast(message: string) {
    setToast({ visible: true, message });
  }

  function next() {
    setFlipped(false);
    setIndex((i) => Math.min(i + 1, cards.length - 1));
  }

  function prev() {
    setFlipped(false);
    setIndex((i) => Math.max(i - 1, 0));
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-text tracking-tight mb-1">
          Flashcards
        </h1>
        <p className="text-xs text-muted2">
          {`${cards.length} cards`}
          {activeCat ? ` · ${activeCat}` : " · All categories"}
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
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

      {/* Card */}
      {card ? (
        <div
          onClick={() => setFlipped((f) => !f)}
          className="relative bg-surface border border-border rounded-2xl p-6 min-h-65 cursor-pointer flex flex-col justify-between animate-cardIn select-none"
          style={{ borderColor: activeCat ? CAT_META[activeCat]?.color + "40" : undefined }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">{CAT_META[card.cat]?.icon}</span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: CAT_META[card.cat]?.color + "20",
                color: CAT_META[card.cat]?.color,
              }}
            >
              {card.sub}
            </span>
            <span className="ml-auto text-xs text-muted">
              {index + 1}/{cards.length}
            </span>
          </div>

          <div className="flex-1">
            {!flipped ? (
              <p className="text-text text-base leading-relaxed">{card.q}</p>
            ) : (
              <p
                className="text-muted2 text-sm leading-relaxed animate-flipIn [&_b]:text-text [&_b]:font-semibold"
                dangerouslySetInnerHTML={{ __html: card.a }}
              />
            )}
          </div>

          <p className="text-xs text-muted mt-4 text-center">
            {flipped ? "tap to see question" : "tap to reveal answer"}
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl p-6 min-h-65 flex items-center justify-center">
          <p className="text-muted text-sm">
            No cards found
          </p>
        </div>
      )}

      {/* Nav buttons */}
      {card && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={prev}
            disabled={index === 0}
            className="flex-1 py-3 rounded-xl border border-border text-sm text-muted2 disabled:opacity-30 transition-opacity"
          >
            ← Prev
          </button>
          <button
            onClick={() => {
              if (card) updateProgress(card.id, true);
              showToast("Marked as known ✓");
              next();
            }}
            className="flex-1 py-3 rounded-xl bg-green/10 border border-green/40 text-sm text-green transition-all active:scale-95"
          >
            Got it ✓
          </button>
          <button
            onClick={() => {
              if (card) updateProgress(card.id, false);
              showToast("Added to review ↺");
              next();
            }}
            className="flex-1 py-3 rounded-xl bg-red/10 border border-red/40 text-sm text-red transition-all active:scale-95"
          >
            Review ✗
          </button>
        </div>
      )}

      <Toast
        message={toast.message}
        visible={toast.visible}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </div>
  );
}
