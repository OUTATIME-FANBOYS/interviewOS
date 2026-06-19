"use client";

import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import FlashcardView from "@/components/FlashcardView";
import QuizView from "@/components/QuizView";
import StatsView from "@/components/StatsView";
import { db } from "@/lib/db";

export default function Home() {
  const [tab, setTab] = useState<"flash" | "quiz" | "stats">("flash");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    db.init().then(() => setMounted(true));
  }, []);

  if (!mounted) return null;

  return (
    <main style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}>
      {tab === "flash" && <FlashcardView />}
      {tab === "quiz" && <QuizView />}
      {tab === "stats" && <StatsView />}
      <BottomNav activeTab={tab} onTabChange={setTab} />
    </main>
  );
}
