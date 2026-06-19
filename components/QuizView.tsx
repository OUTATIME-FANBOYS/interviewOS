"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { CARDS } from "@/data/cards";
import { CAT_META } from "@/lib/constants";
import { Chip } from "./Chip";
import { AppHeader } from "./AppHeader";
import { db } from "@/lib/db";
import type { Flashcard } from "@/lib/types";

const QUIZ_SIZE = 20;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

function getOptionText(html: string): string {
  const text = stripHtml(html);
  const first = text.split(/\.\s/)[0];
  return first.length > 130 ? first.slice(0, 130) + "…" : first;
}

interface Option {
  cardId: number;
  text: string;
  correct: boolean;
}

function buildOptions(correct: Flashcard, pool: Flashcard[]): Option[] {
  const others = pool.filter((c) => c.id !== correct.id);
  // Prefer same subcategory → same category → rest of pool → global fallback
  const sameSub = shuffle(others.filter((c) => c.sub === correct.sub));
  const sameCat = shuffle(others.filter((c) => c.cat === correct.cat && c.sub !== correct.sub));
  const diffCat = shuffle(others.filter((c) => c.cat !== correct.cat));
  const poolIds = new Set(pool.map((c) => c.id));
  const globalFallback = shuffle(CARDS.filter((c) => !poolIds.has(c.id)));
  const ranked = [...sameSub, ...sameCat, ...diffCat, ...globalFallback];
  const decoys = ranked
    .slice(0, 3)
    .map((c): Option => ({ cardId: c.id, text: getOptionText(c.a), correct: false }));
  return shuffle([{ cardId: correct.id, text: getOptionText(correct.a), correct: true }, ...decoys]);
}

function formatAnswer(html: string): string {
  return html.replace(/\. (<b>)/g, ".<br><br>$1");
}

export default function QuizView() {
  const categories = Object.keys(CAT_META);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [mistakeMode, setMistakeMode] = useState(false);
  const [mistakeIds, setMistakeIds] = useState<Set<number>>(new Set());
  const [sessionKey, setSessionKey] = useState(0);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const loadMistakes = useCallback(async () => {
    const ids = await db.getMistakeCardIds();
    setMistakeIds(new Set(ids));
  }, []);

  useEffect(() => { loadMistakes(); }, [loadMistakes]);

  const pool = useMemo(() => {
    if (mistakeMode) return CARDS.filter((c) => mistakeIds.has(c.id));
    return activeCat ? CARDS.filter((c) => c.cat === activeCat) : CARDS;
  }, [activeCat, mistakeMode, mistakeIds]);

  const deck = useMemo(
    () => shuffle(pool).slice(0, QUIZ_SIZE),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pool, sessionKey]
  );

  const card = deck[index];
  const catMeta = card ? CAT_META[card.cat] : null;

  const options = useMemo(
    () => (card ? buildOptions(card, pool) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [card]
  );

  function select(opt: Option) {
    if (selected !== null) return;
    setSelected(opt.cardId);
    db.updateProgress(card.id, opt.correct).then(() => loadMistakes());
    if (opt.correct) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 >= deck.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  }

  function restart() {
    setSessionKey((k) => k + 1);
    setIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    setShowExplanation(false);
  }

  if (done) {
    const pct = Math.round((score / deck.length) * 100);
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader title="Quiz" />
      <div
        className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
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
      </div>
    );
  }

  const answered = selected !== null;

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader title="Quiz" />
      <div className="p-4 flex-1">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
          <Chip
            label="All"
            active={!mistakeMode && activeCat === null}
            color="#00e5ff"
            onClick={() => { setMistakeMode(false); setActiveCat(null); restart(); }}
            small
          />
          <Chip
            label={`Mistakes${mistakeIds.size > 0 ? ` (${mistakeIds.size})` : ""}`}
            active={mistakeMode}
            color="#ff4444"
            onClick={() => { setMistakeMode((v) => !v); setActiveCat(null); restart(); }}
            small
          />
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              active={!mistakeMode && activeCat === cat}
              color={CAT_META[cat].color}
              icon={CAT_META[cat].icon}
              onClick={() => { setMistakeMode(false); setActiveCat(activeCat === cat ? null : cat); restart(); }}
              small
            />
          ))}
        </div>

        {mistakeMode && mistakeIds.size === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col items-center text-center">
            <p className="text-3xl mb-3">✅</p>
            <p className="text-sm font-semibold text-text mb-1">No mistakes yet</p>
            <p className="text-xs text-muted">Answer some quiz questions and incorrect ones will appear here.</p>
          </div>
        ) : card && (
          <>
            {/* Category chip + progress */}
            <div className="flex items-center justify-between mb-4">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
                style={{
                  color: catMeta?.color,
                  borderColor: `${catMeta?.color}50`,
                  backgroundColor: `${catMeta?.color}10`,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: catMeta?.color }} />
                {card.cat}
              </span>
              <span className="text-xs text-muted tabular-nums">
                {index + 1} / {deck.length} · {score} pts
              </span>
            </div>

            {/* Question */}
            <div className="bg-surface border border-border rounded-2xl p-5 mb-4">
              <p className="text-xs text-muted2 uppercase tracking-widest mb-2">{card.sub}</p>
              <h2 className="text-lg font-bold text-text leading-snug">{card.q}</h2>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-2 mb-4">
              {options.map((opt, i) => {
                let cls =
                  "border border-border bg-surface text-text active:opacity-70";
                if (answered) {
                  if (opt.correct)
                    cls = "border border-green bg-green/10 text-green";
                  else if (opt.cardId === selected)
                    cls = "border border-red bg-red/10 text-red";
                  else cls = "border border-border bg-surface text-muted opacity-50";
                }
                return (
                  <button
                    key={opt.cardId}
                    onClick={() => select(opt)}
                    disabled={answered}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${cls}`}
                  >
                    <span className="text-xs opacity-50 mr-2 font-mono">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {opt.text}
                  </button>
                );
              })}
            </div>

            {/* Post-answer actions */}
            {answered && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowExplanation((v) => !v)}
                  className="w-full py-2.5 rounded-xl border border-border text-sm text-muted2 transition-opacity"
                >
                  {showExplanation ? "Hide explanation" : "See explanation"}
                </button>

                {showExplanation && (
                  <div className="bg-surface border border-border rounded-2xl p-4">
                    <p
                      className="text-sm leading-relaxed [&_b]:font-semibold [&_b]:text-text"
                      style={{ color: "var(--theme-muted2)" }}
                      dangerouslySetInnerHTML={{ __html: formatAnswer(card.a) }}
                    />
                  </div>
                )}

                <button
                  onClick={next}
                  className="w-full py-3 rounded-xl bg-accent/10 border border-accent/40 text-sm text-accent transition-all active:scale-95"
                >
                  {index + 1 >= deck.length ? "See Results →" : "Next →"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
