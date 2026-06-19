import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const sql = neon(process.env.DATABASE_URL);

export async function ensureProgressTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS progress (
      card_id INTEGER PRIMARY KEY,
      seen    BOOLEAN NOT NULL DEFAULT FALSE,
      mastered BOOLEAN NOT NULL DEFAULT FALSE,
      attempts INTEGER NOT NULL DEFAULT 0
    )
  `;
}
