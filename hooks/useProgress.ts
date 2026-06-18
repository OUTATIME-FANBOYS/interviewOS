"use client";

import { useState, useCallback } from "react";
import type { Progress } from "@/lib/types";

export function useProgress() {
  const [progress, setProgress] = useState<Record<number, Progress>>({});

  const updateProgress = useCallback(
    async (cardId: number, mastered: boolean) => {
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardId, mastered }),
        });
        setProgress((prev) => ({
          ...prev,
          [cardId]: {
            cardId,
            seen: true,
            mastered,
            attempts: (prev[cardId]?.attempts || 0) + 1,
          },
        }));
      } catch (error) {
        console.error("Update progress failed:", error);
      }
    },
    []
  );

  return { progress, updateProgress };
}
