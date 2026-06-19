import type { Flashcard, Progress } from "./types";
import { supabase } from "./supabase";

const STORAGE_KEY = "ios_progress";

type ProgressStore = Record<number, { seen: boolean; mastered: boolean; attempts: number }>;

function readStore(): ProgressStore {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStore(store: ProgressStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

class Database {
  async init() {}

  async getCards(cat?: string, sub?: string): Promise<Flashcard[]> {
    let query = supabase.from("flashcards").select("*");
    if (cat && sub) query = query.eq("cat", cat).eq("sub", sub);
    else if (cat) query = query.eq("cat", cat);
    const { data } = await query;
    return data || [];
  }

  async insertCards(cards: Flashcard[]) {
    await supabase.from("flashcards").upsert(cards, { onConflict: "id" });
  }

  async getProgress(cardId: number): Promise<Progress | null> {
    const entry = readStore()[cardId];
    if (!entry) return null;
    return { cardId, ...entry };
  }

  async getAllProgress(): Promise<Progress[]> {
    const store = readStore();
    return Object.entries(store).map(([id, entry]) => ({
      cardId: Number(id),
      ...entry,
    }));
  }

  async resetProgress(cardId: number) {
    const store = readStore();
    delete store[cardId];
    writeStore(store);
  }

  async updateProgress(cardId: number, mastered: boolean) {
    const store = readStore();
    const existing = store[cardId];
    store[cardId] = {
      seen: true,
      mastered,
      attempts: existing ? existing.attempts + 1 : 1,
    };
    writeStore(store);
  }

  async getMistakeCardIds(): Promise<number[]> {
    const store = readStore();
    return Object.entries(store)
      .filter(([, entry]) => entry.seen && !entry.mastered)
      .map(([id]) => Number(id));
  }

  async close() {}
}

export const db = new Database();
