import { NextResponse } from "next/server";
import { QUIZZES } from "@/data/quizzes";

export async function GET() {
  return NextResponse.json(QUIZZES);
}
