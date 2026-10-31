import { NextRequest, NextResponse } from "next/server";
import { summarizeTextWithGemini } from "@/lib/gemini";
import {
  countCharacters,
  countWords,
  calculateReductionPercentage,
  estimateReadingTimeSec,
} from "@/lib/utils";
import {
  SummarizeRequest,
  SummarizeResponse,
  SummaryLength,
  SummaryTone,
  SummaryType,
} from "@/lib/types";

// Maximum allowable input character limit (approx 10,000 words)
const MAX_INPUT_CHARS = 60000;
const MIN_INPUT_WORDS = 10;

const VALID_TYPES: SummaryType[] = ["paragraph", "bullet", "executive", "takeaways"];
const VALID_LENGTHS: SummaryLength[] = ["short", "medium", "long"];
const VALID_TONES: SummaryTone[] = ["neutral", "formal", "simplified", "academic"];

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  try {
    // 1. Verify API Key presence upfront
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Google Gemini API Key is missing. Please add GEMINI_API_KEY to your .env.local file.",
          code: "MISSING_API_KEY",
        },
        { status: 500 }
      );
    }

    // 2. Parse request JSON body
    let body: Partial<SummarizeRequest>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request payload.", code: "INVALID_JSON" },
        { status: 400 }
      );
    }

    const { text = "", type = "paragraph", length = "medium", tone = "neutral", file } = body;

    const hasFile = Boolean(file && file.base64Data && file.mimeType);
    const trimmedText = typeof text === "string" ? text.trim() : "";

    // 3. Validate text input or file presence
    if (!hasFile && (!trimmedText || countWords(trimmedText) < MIN_INPUT_WORDS)) {
      const currentCount = countWords(trimmedText);
      return NextResponse.json(
        {
          error: `Source text is too short to summarize. Please enter at least ${MIN_INPUT_WORDS} words or attach a document/image (currently: ${currentCount} words).`,
          code: "TEXT_TOO_SHORT",
        },
        { status: 400 }
      );
    }

    if (trimmedText.length > MAX_INPUT_CHARS) {
      return NextResponse.json(
        {
          error: `Text exceeds the maximum allowed limit of ${MAX_INPUT_CHARS.toLocaleString()} characters.`,
          code: "TEXT_TOO_LONG",
        },
        { status: 400 }
      );
    }

    // 4. Validate parameters
    const safeType: SummaryType = VALID_TYPES.includes(type as SummaryType)
      ? (type as SummaryType)
      : "paragraph";

    const safeLength: SummaryLength = VALID_LENGTHS.includes(length as SummaryLength)
      ? (length as SummaryLength)
      : "medium";

    const safeTone: SummaryTone = VALID_TONES.includes(tone as SummaryTone)
      ? (tone as SummaryTone)
      : "neutral";

    // 5. Invoke Gemini API with optional file attachment
    const { summary, suggestedQuestions, modelUsed, fromCache } = await summarizeTextWithGemini(
      trimmedText,
      safeType,
      safeLength,
      safeTone,
      hasFile ? file : undefined
    );

    // 6. Compute analytical statistics
    const latencyMs = Math.round(performance.now() - startTime);
    const summaryWordCount = countWords(summary);
    const countedOriginalWords = countWords(trimmedText);
    const originalWordCount = countedOriginalWords >= 10
      ? countedOriginalWords
      : Math.round(summaryWordCount * 2.8); // Estimate for binary files

    const originalCharCount = countCharacters(trimmedText) || summaryWordCount * 15;
    const summaryCharCount = countCharacters(summary);
    const reductionPercentage = calculateReductionPercentage(
      originalWordCount,
      summaryWordCount
    );

    const originalReadingSec = estimateReadingTimeSec(originalWordCount);
    const summaryReadingSec = estimateReadingTimeSec(summaryWordCount);
    const estimatedReadingTimeSavedSec = Math.max(
      0,
      originalReadingSec - summaryReadingSec
    );

    const responsePayload: SummarizeResponse = {
      summary,
      stats: {
        originalWordCount,
        summaryWordCount,
        reductionPercentage,
        originalCharCount,
        summaryCharCount,
        estimatedReadingTimeSavedSec,
        latencyMs,
        fromCache,
      },
      meta: {
        model: modelUsed,
        type: safeType,
        length: safeLength,
        tone: safeTone,
        generatedAt: new Date().toISOString(),
      },
      suggestedQuestions,
    };

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        "X-Response-Time": `${latencyMs}ms`,
        "Server-Timing": `total;dur=${latencyMs}`,
      },
    });
  } catch (error: unknown) {
    console.error("Summarization API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected server error occurred.";

    // Detect specific Gemini API errors (e.g. quota, bad key)
    if (errorMessage.toLowerCase().includes("api key not valid")) {
      return NextResponse.json(
        {
          error: "Your GEMINI_API_KEY is invalid. Please double-check your key in .env.local",
          code: "INVALID_API_KEY",
        },
        { status: 401 }
      );
    }

    if (errorMessage.toLowerCase().includes("quota") || errorMessage.includes("429")) {
      return NextResponse.json(
        {
          error: "Gemini API rate limit or quota exceeded. Please wait a moment and try again.",
          code: "RATE_LIMIT_EXCEEDED",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: errorMessage,
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
