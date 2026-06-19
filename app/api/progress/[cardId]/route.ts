import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function serverSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

type Params = { params: Promise<{ cardId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { cardId } = await params;
  const id = Number(cardId);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid cardId" }, { status: 400 });
  }

  const { data } = await serverSupabase()
    .from("progress")
    .select("card_id, seen, mastered, attempts")
    .eq("card_id", id)
    .single();

  if (!data) return NextResponse.json(null);
  return NextResponse.json({ cardId: data.card_id, seen: data.seen, mastered: data.mastered, attempts: data.attempts });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { cardId } = await params;
  const id = Number(cardId);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid cardId" }, { status: 400 });
  }

  const { error } = await serverSupabase().from("progress").delete().eq("card_id", id);
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
  const sb = serverSupabase();

  const { data: existing } = await sb
    .from("progress")
    .select("attempts")
    .eq("card_id", id)
    .single();

  const { error } = await sb.from("progress").upsert({
    card_id: id,
    seen: true,
    mastered,
    attempts: (existing?.attempts ?? 0) + 1,
  }, { onConflict: "card_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
