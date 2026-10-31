import { NextResponse } from "next/server";

export async function GET() {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5);

  return NextResponse.json({
    status: "ok",
    service: "AI Text Summarization Engine",
    geminiConfigured: hasKey,
    timestamp: new Date().toISOString(),
  });
}
