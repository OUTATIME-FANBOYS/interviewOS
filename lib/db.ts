import type { Flashcard, Progress } from "./types";
import { supabase } from "./supabase";

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
    const { data, error } = await supabase
      .from("progress")
      .select("card_id, seen, mastered, attempts")
      .eq("card_id", cardId)
      .maybeSingle();
    if (error || !data) return null;
    return { cardId: data.card_id, seen: data.seen, mastered: data.mastered, attempts: data.attempts };
  }

  async getAllProgress(): Promise<Progress[]> {
    const { data } = await supabase
      .from("progress")
      .select("card_id, seen, mastered, attempts");
    if (!data) return [];
    return data.map((r) => ({ cardId: r.card_id, seen: r.seen, mastered: r.mastered, attempts: r.attempts }));
  }

  async resetProgress(cardId: number) {
    await supabase.from("progress").delete().eq("card_id", cardId);
  }

  async updateProgress(cardId: number, mastered: boolean) {
    await supabase.rpc("upsert_progress", { p_card_id: cardId, p_mastered: mastered });
  }

  async getMistakeCardIds(): Promise<number[]> {
    const { data } = await supabase
      .from("progress")
      .select("card_id")
      .eq("seen", true)
      .eq("mastered", false);
    return (data || []).map((r) => r.card_id);
  }

  async close() {}
}

export const db = new Database();
