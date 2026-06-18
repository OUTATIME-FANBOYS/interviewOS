"use client";

import { useState, useEffect } from "react";
import type { Quiz } from "@/lib/types";

export default function QuizView() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/quizzes")
      .then((r) => r.json())
      .then(setQuizzes)
      .catch(console.error);
  }, []);

  const q: Quiz | undefined = quizzes[index];

  function choose(i: number) {
    if (selected !== null || !q) return;
    setSelected(i);
    if (i === q.correct) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 >= quizzes.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  }

  if (quizzes.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold text-text mb-2">Quiz</h1>
        <p className="text-sm text-muted2">No quizzes available yet.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-4xl mb-4">🎯</p>
        <h2 className="text-2xl font-bold text-text mb-2">Quiz Complete</h2>
        <p className="text-muted2 mb-6">
          Score: <span className="text-accent font-bold">{score}</span> / {quizzes.length}
        </p>
        <button
          onClick={restart}
          className="px-6 py-3 bg-accent/10 border border-accent/40 rounded-xl text-accent text-sm"
        >
          Restart Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-text">Quiz</h1>
        <span className="text-xs text-muted2">
          {index + 1}/{quizzes.length} · {score} pts
        </span>
      </div>

      {q && (
        <>
          <div className="bg-surface border border-border rounded-2xl p-5 mb-4">
            <p className="text-xs text-muted2 mb-3">
              {q.cat} · {q.sub}
            </p>
            <p className="text-text text-base leading-relaxed">{q.q}</p>
          </div>

          <div className="flex flex-col gap-2">
            {q.opts.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect = i === q.correct;
              const revealed = selected !== null;
              let borderColor = "#1e2535";
              let bgColor = "transparent";
              let textColor = "#64748b";
              if (revealed && isCorrect) {
                borderColor = "#10b981";
                bgColor = "#10b98118";
                textColor = "#10b981";
              } else if (revealed && isSelected && !isCorrect) {
                borderColor = "#ef4444";
                bgColor = "#ef444418";
                textColor = "#ef4444";
              } else if (!revealed) {
                textColor = "#e2e8f0";
              }
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  className="w-full text-left px-4 py-3 rounded-xl border text-sm transition-all"
                  style={{ borderColor, backgroundColor: bgColor, color: textColor }}
                >
                  <span className="opacity-50 mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className="mt-4">
              <div className="bg-surface2 border border-border2 rounded-xl p-4 mb-4">
                <p className="text-xs text-muted2 mb-1">Explanation</p>
                <p className="text-sm text-text leading-relaxed">{q.exp}</p>
              </div>
              <button
                onClick={next}
                className="w-full py-3 bg-accent/10 border border-accent/40 rounded-xl text-accent text-sm"
              >
                {index + 1 >= quizzes.length ? "See Results" : "Next →"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
