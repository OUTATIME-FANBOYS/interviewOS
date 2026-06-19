"use client";

import { useState, useMemo } from "react";
import { CARDS } from "@/data/cards";
import { CAT_META } from "@/lib/constants";
import { Chip } from "./Chip";
import { db } from "@/lib/db";

const QUIZ_SIZE = 20;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizView() {
  const categories = Object.keys(CAT_META);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const deck = useMemo(() => {
    const pool = activeCat ? CARDS.filter((c) => c.cat === activeCat) : CARDS;
    return shuffle(pool).slice(0, QUIZ_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCat, sessionKey]);

  const card = deck[index];
  const catMeta = card ? CAT_META[card.cat] : null;

  function gradeAndNext(mastered: boolean) {
    if (!card) return;
    db.updateProgress(card.id, mastered);
    if (mastered) setScore((s) => s + 1);
    if (index + 1 >= deck.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  }

  function restart() {
    setSessionKey((k) => k + 1);
    setIndex(0);
    setFlipped(false);
    setScore(0);
    setDone(false);
  }

  if (done) {
    const pct = Math.round((score / deck.length) * 100);
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-4xl mb-4">🎯</p>
        <h2 className="text-2xl font-bold text-text mb-2">Quiz Complete</h2>
        <p className="text-muted2 mb-1">
          Score: <span className="text-accent font-bold">{score}</span> / {deck.length}
        </p>
        <p className="text-xs text-muted mb-6">{pct}% correct</p>
        <button
          onClick={restart}
          className="px-6 py-3 bg-accent/10 border border-accent/40 rounded-xl text-accent text-sm"
        >
          New Session →
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="p-4 flex-1">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
          <Chip
            label="All"
            active={activeCat === null}
            color="#00e5ff"
            onClick={() => { setActiveCat(null); restart(); }}
            small
          />
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              active={activeCat === cat}
              color={CAT_META[cat].color}
              icon={CAT_META[cat].icon}
              onClick={() => { setActiveCat(activeCat === cat ? null : cat); restart(); }}
              small
            />
          ))}
        </div>

        {card && (
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
                {index + 1} / {deck.length} · {score} pts
              </span>
            </div>

            {/* Flip card */}
            <div
              className="flip-card mb-4 cursor-pointer"
              style={{ minHeight: "240px" }}
              onClick={() => !flipped && setFlipped(true)}
            >
              <div
                className={`flip-inner rounded-2xl${flipped ? " is-flipped" : ""}`}
                style={{ minHeight: "240px" }}
              >
                {/* Front — question */}
                <div
                  className="flip-face bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between"
                  style={{ minHeight: "240px" }}
                >
                  <div>
                    <h2 className="text-2xl font-bold text-text leading-snug mb-3">{card.q}</h2>
                    <p className="text-xs text-muted2 uppercase tracking-widest">{card.sub}</p>
                  </div>
                  <p className="text-xs text-muted text-center mt-4">Tap to reveal answer</p>
                </div>

                {/* Back — answer */}
                <div
                  className="flip-face flip-back bg-surface border border-border rounded-2xl p-6 overflow-y-auto"
                  style={{ minHeight: "240px" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <p
                    className="text-sm leading-relaxed [&_b]:font-semibold [&_b]:text-text"
                    style={{ color: "var(--theme-muted2)" }}
                    dangerouslySetInnerHTML={{ __html: card.a }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            {flipped ? (
              <div className="flex gap-3">
                <button
                  onClick={() => gradeAndNext(true)}
                  className="flex-1 py-3 rounded-xl bg-green/10 border border-green/40 text-sm text-green transition-all active:scale-95"
                >
                  Got it ✓
                </button>
                <button
                  onClick={() => gradeAndNext(false)}
                  className="flex-1 py-3 rounded-xl bg-red/10 border border-red/40 text-sm text-red transition-all active:scale-95"
                >
                  Review ✗
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={restart}
                  className="py-3 px-4 rounded-xl border border-border text-sm text-muted2 transition-opacity"
                >
                  ↺
                </button>
                <div className="flex-1 py-3 rounded-xl border border-dashed border-border text-sm text-muted text-center">
                  Reveal to continue
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
