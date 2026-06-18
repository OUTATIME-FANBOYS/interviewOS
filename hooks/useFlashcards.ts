"use client";

import { useState, useCallback } from "react";
import type { Flashcard } from "@/lib/types";

export function useFlashcards() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCards = useCallback(async (cat?: string, sub?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat) params.append("cat", cat);
      if (sub) params.append("sub", sub);
      const response = await fetch(`/api/cards?${params}`);
      const data = await response.json();
      setCards(data);
    } catch (error) {
      console.error("Fetch cards failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { cards, loading, fetchCards };
}
