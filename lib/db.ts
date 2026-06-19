import type { Flashcard, Progress } from "./types";

// SQLite is only available on native platforms (iOS/Android via Capacitor).
// On web, progress is stored in localStorage as a fallback.
class Database {
  private isNative = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: any = null;

  async init() {
    if (typeof window === "undefined") return;
    try {
      const { CapacitorSQLite } = await import("@capacitor-community/sqlite");
      this.db = await CapacitorSQLite.createConnection({
        database: "interview_os",
        version: 1,
        encrypted: false,
        mode: "no-encryption",
        readonly: false,
      });
      await this.db.open();
      await this.createTables();
      this.isNative = true;
    } catch {
      // Fall back to localStorage on web
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
      const res = await fetch(`/api/progress/${cardId}`);
      return res.ok ? res.json() : null;
    }
    const result = await this.db.query(
      "SELECT * FROM progress WHERE cardId = ?",
      [cardId]
    );
    return result.values?.[0] || null;
  }

  async getAllProgress(): Promise<Progress[]> {
    if (!this.isNative || !this.db) {
      const res = await fetch("/api/progress");
      return res.ok ? res.json() : [];
    }
    const result = await this.db.query("SELECT * FROM progress");
    return result.values || [];
  }

  async resetProgress(cardId: number) {
    if (!this.isNative || !this.db) {
      await fetch(`/api/progress/${cardId}`, { method: "DELETE" });
      return;
    }
    await this.db.run("DELETE FROM progress WHERE cardId = ?", [cardId]);
  }

  async updateProgress(cardId: number, mastered: boolean) {
    if (!this.isNative || !this.db) {
      await fetch(`/api/progress/${cardId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mastered }),
      });
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

  async close() {
    if (this.isNative && this.db) {
      const { CapacitorSQLite } = await import("@capacitor-community/sqlite");
      await CapacitorSQLite.closeConnection({ database: "interview_os", readonly: false });
    }
  }
}

export const db = new Database();
