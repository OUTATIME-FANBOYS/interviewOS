import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function serverSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET() {
  const { data, error } = await serverSupabase()
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
