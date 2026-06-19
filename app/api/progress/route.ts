import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("progress")
    .select("card_id, seen, mastered, attempts");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = (data || []).map((r) => ({
    cardId: r.card_id,
    seen: r.seen,
    mastered: r.mastered,
    attempts: r.attempts,
  }));
  return NextResponse.json(rows);
}
