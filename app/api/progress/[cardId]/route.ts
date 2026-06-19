import { NextRequest, NextResponse } from "next/server";
import { sql, ensureProgressTable } from "@/lib/neon";

type Params = { params: Promise<{ cardId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { cardId } = await params;
  const id = Number(cardId);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid cardId" }, { status: 400 });
  }

  await ensureProgressTable();
  const rows = await sql`
    SELECT card_id AS "cardId", seen, mastered, attempts
    FROM progress
    WHERE card_id = ${id}
  `;
  return NextResponse.json(rows[0] ?? null);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { cardId } = await params;
  const id = Number(cardId);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid cardId" }, { status: 400 });
  }

  const { mastered } = await req.json() as { mastered: boolean };

  await ensureProgressTable();
  await sql`
    INSERT INTO progress (card_id, seen, mastered, attempts)
    VALUES (${id}, TRUE, ${mastered}, 1)
    ON CONFLICT (card_id) DO UPDATE
      SET seen     = TRUE,
          mastered = ${mastered},
          attempts = progress.attempts + 1
  `;

  return NextResponse.json({ ok: true });
}
