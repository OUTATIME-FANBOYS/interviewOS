"use client";

import { useCallback } from "react";
import { db } from "@/lib/db";

export function useProgress() {
  const updateProgress = useCallback(async (cardId: number, mastered: boolean) => {
    await db.updateProgress(cardId, mastered);
  }, []);

  return { updateProgress };
}
