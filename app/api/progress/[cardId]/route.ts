import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Params = { params: Promise<{ cardId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { cardId } = await params;
  const id = Number(cardId);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid cardId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("progress")
    .select("card_id, seen, mastered, attempts")
    .eq("card_id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json(null);
  return NextResponse.json({ cardId: data.card_id, seen: data.seen, mastered: data.mastered, attempts: data.attempts });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { cardId } = await params;
  const id = Number(cardId);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid cardId" }, { status: 400 });
  }

  const { error } = await supabase.from("progress").delete().eq("card_id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { cardId } = await params;
  const id = Number(cardId);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid cardId" }, { status: 400 });
  }

  const { mastered } = await req.json() as { mastered: boolean };
  const { error } = await supabase.rpc("upsert_progress", { p_card_id: id, p_mastered: mastered });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
