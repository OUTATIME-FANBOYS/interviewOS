import { NextRequest, NextResponse } from "next/server";
import { CARDS } from "@/data/cards";

export async function GET(request: NextRequest) {
  const cat = request.nextUrl.searchParams.get("cat");
  const sub = request.nextUrl.searchParams.get("sub");

  let cards = CARDS;
  if (cat && sub) cards = cards.filter((c) => c.cat === cat && c.sub === sub);
  else if (cat) cards = cards.filter((c) => c.cat === cat);

  return NextResponse.json(cards);
}

export async function POST(request: NextRequest) {
  const cards = await request.json();
  return NextResponse.json({ success: true, count: cards.length });
}
