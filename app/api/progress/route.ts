import { NextResponse } from "next/server";
import { sql, ensureProgressTable } from "@/lib/neon";

export async function GET() {
  await ensureProgressTable();
  const rows = await sql`
    SELECT card_id AS "cardId", seen, mastered, attempts
    FROM progress
  `;
  return NextResponse.json(rows);
}
