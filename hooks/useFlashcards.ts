"use client";

import { useState, useCallback } from "react";
import { CARDS } from "@/data/cards";
import type { Flashcard } from "@/lib/types";

export function useFlashcards() {
  const [cards, setCards] = useState<Flashcard[]>([]);

  const fetchCards = useCallback((cat?: string, sub?: string) => {
    let filtered = CARDS;
    if (cat) filtered = filtered.filter((c) => c.cat === cat);
    if (sub) filtered = filtered.filter((c) => c.sub === sub);
    setCards(filtered);
  }, []);

  return { cards, fetchCards };
}
