import { NextRequest, NextResponse } from "next/server";

// In-memory store for web dev; replace with DB calls for production
const progressStore = new Map<number, { seen: boolean; mastered: boolean; attempts: number }>();

export async function GET(request: NextRequest) {
  const cardId = Number(request.nextUrl.searchParams.get("cardId"));
  if (!cardId) return NextResponse.json({});
  return NextResponse.json(progressStore.get(cardId) || {});
}

export async function POST(request: NextRequest) {
  const { cardId, mastered } = await request.json();
  const existing = progressStore.get(cardId);
  progressStore.set(cardId, {
    seen: true,
    mastered,
    attempts: (existing?.attempts || 0) + 1,
  });
  return NextResponse.json({ success: true });
}
