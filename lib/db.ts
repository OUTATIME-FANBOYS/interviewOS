import type { Flashcard, Progress } from "./types";
import { supabase } from "./supabase";

// SQLite is only available on native platforms (iOS/Android via Capacitor).
// On web, progress is stored in Supabase directly via the client SDK.
class Database {
  private isNative = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: any = null;

  async init() {
    if (typeof window === "undefined") return;
    try {
      const { CapacitorSQLite, SQLiteConnection } = await import("@capacitor-community/sqlite");
      const sqlite = new SQLiteConnection(CapacitorSQLite);
      this.db = await sqlite.createConnection("interview_os", false, "no-encryption", 1, false);
      await this.db.open();
      await this.createTables();
      this.isNative = true;
    } catch {
      // Fall back to Supabase on web
    }
  }

  private async createTables() {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS flashcards (
        id INTEGER PRIMARY KEY,
        cat TEXT,
        sub TEXT,
        q TEXT,
        a TEXT
      )
    `);
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS progress (
        cardId INTEGER PRIMARY KEY,
        seen BOOLEAN DEFAULT 0,
        mastered BOOLEAN DEFAULT 0,
        attempts INTEGER DEFAULT 0
      )
    `);
  }

  async getCards(cat?: string, sub?: string): Promise<Flashcard[]> {
    if (!this.isNative || !this.db) return [];
    let query = "SELECT * FROM flashcards";
    const params: unknown[] = [];
    if (cat && sub) {
      query += " WHERE cat = ? AND sub = ?";
      params.push(cat, sub);
    } else if (cat) {
      query += " WHERE cat = ?";
      params.push(cat);
    }
    const result = await this.db.query(query, params);
    return result.values || [];
  }

  async insertCards(cards: Flashcard[]) {
    if (!this.isNative || !this.db) return;
    for (const card of cards) {
      await this.db.run(
        "INSERT OR REPLACE INTO flashcards (id, cat, sub, q, a) VALUES (?, ?, ?, ?, ?)",
        [card.id, card.cat, card.sub, card.q, card.a]
      );
    }
  }

  async getProgress(cardId: number): Promise<Progress | null> {
    if (!this.isNative || !this.db) {
      const { data, error } = await supabase
        .from("progress")
        .select("card_id, seen, mastered, attempts")
        .eq("card_id", cardId)
        .maybeSingle();
      if (error || !data) return null;
      return { cardId: data.card_id, seen: data.seen, mastered: data.mastered, attempts: data.attempts };
    }
    const result = await this.db.query(
      "SELECT * FROM progress WHERE cardId = ?",
      [cardId]
    );
    return result.values?.[0] || null;
  }

  async getAllProgress(): Promise<Progress[]> {
    if (!this.isNative || !this.db) {
      const { data } = await supabase
        .from("progress")
        .select("card_id, seen, mastered, attempts");
      if (!data) return [];
      return data.map((r) => ({ cardId: r.card_id, seen: r.seen, mastered: r.mastered, attempts: r.attempts }));
    }
    const result = await this.db.query("SELECT * FROM progress");
    return result.values || [];
  }

  async resetProgress(cardId: number) {
    if (!this.isNative || !this.db) {
      await supabase.from("progress").delete().eq("card_id", cardId);
      return;
    }
    await this.db.run("DELETE FROM progress WHERE cardId = ?", [cardId]);
  }

  async updateProgress(cardId: number, mastered: boolean) {
    if (!this.isNative || !this.db) {
      await supabase.rpc("upsert_progress", { p_card_id: cardId, p_mastered: mastered });
      return;
    }
    const existing = await this.getProgress(cardId);
    if (existing) {
      await this.db.run(
        "UPDATE progress SET seen = 1, mastered = ?, attempts = attempts + 1 WHERE cardId = ?",
        [mastered ? 1 : 0, cardId]
      );
    } else {
      await this.db.run(
        "INSERT INTO progress (cardId, seen, mastered, attempts) VALUES (?, 1, ?, 1)",
        [cardId, mastered ? 1 : 0]
      );
    }
  }

  async getMistakeCardIds(): Promise<number[]> {
    if (!this.isNative || !this.db) {
      const { data } = await supabase
        .from("progress")
        .select("card_id")
        .eq("seen", true)
        .eq("mastered", false);
      return (data || []).map((r) => r.card_id);
    }
    const result = await this.db.query(
      "SELECT cardId FROM progress WHERE seen = 1 AND mastered = 0"
    );
    return (result.values || []).map((r: { cardId: number }) => r.cardId);
  }

  async close() {
    if (this.isNative && this.db) {
      const { CapacitorSQLite, SQLiteConnection } = await import("@capacitor-community/sqlite");
      const sqlite = new SQLiteConnection(CapacitorSQLite);
      await sqlite.closeConnection("interview_os", false);
    }
  }
}

export const db = new Database();
