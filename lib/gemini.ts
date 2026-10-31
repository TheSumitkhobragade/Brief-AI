import { GoogleGenAI } from "@google/genai";
import { SummaryLength, SummaryTone, SummaryType, UploadedFilePayload } from "./types";

/**
 * Initializes and returns an instance of the Google Gen AI client.
 * Throws a descriptive error if the GEMINI_API_KEY environment variable is not defined.
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please add your Gemini API key to .env.local"
    );
  }

  return new GoogleGenAI({ apiKey });
}

/**
 * Constructs a strict, contextual prompt based on user-selected criteria.
 */
export function buildPrompt(
  text: string,
  type: SummaryType,
  length: SummaryLength,
  tone: SummaryTone = "neutral",
  fileName?: string
): { prompt: string; systemInstruction: string } {
  // System Instruction defines the AI's persona and absolute rules
  const systemInstruction = `You are a world-class AI Text Summarization and Synthesis Specialist built for academic, corporate, and technical analysis.
Your primary objective is to distill complex information into clear, accurate, high-fidelity summaries without fabricating information, introducing hallucinated claims, or omitting critical context.
Always adhere strictly to the requested summary format, length, and tone.
Output clean, well-structured Markdown. Do not include meta-conversational filler like "Here is your summary:" or "In conclusion:". Start directly with the summary content.`;

  // Format directives based on type
  let formatGuide = "";
  switch (type) {
    case "bullet":
      formatGuide = `Structure the summary exclusively as clear Markdown bullet points (* ...). Each bullet should begin with a bold key concept (e.g. "* **Concept Name**: Explanation...") for high readability.`;
      break;
    case "executive":
      formatGuide = `Structure the summary as an Executive Briefing containing three distinct sections using Markdown headings:
## Executive Overview
(A high-level synthesis of the primary subject)

## Key Findings & Data
(Core metrics, arguments, or critical discoveries)

## Strategic Takeaway
(Actionable implications or conclusion)`;
      break;
    case "takeaways":
      formatGuide = `Structure the summary as:
## Core Takeaways
1. [Numbered key insight with bold highlight]
2. [Numbered key insight with bold highlight]
...
## Bottom Line
[One crisp sentence capturing the ultimate takeaway]`;
      break;
    case "paragraph":
    default:
      formatGuide = `Structure the summary as cohesive, well-flowing narrative paragraphs with smooth logical transitions between ideas.`;
      break;
  }

  // Length directives
  let lengthGuide = "";
  switch (length) {
    case "short":
      lengthGuide = `Length: SHORT. Be highly concise. Compress the text to approximately 20-30% of its original length, capturing only the bare essentials.`;
      break;
    case "long":
      lengthGuide = `Length: DETAILED / COMPREHENSIVE. Maintain extensive depth, retaining supporting data, nuances, context, and secondary arguments (approximately 50-65% of original length).`;
      break;
    case "medium":
    default:
      lengthGuide = `Length: MEDIUM / BALANCED. Provide a balanced synthesis covering all primary arguments and notable supporting points (approximately 35-45% of original length).`;
      break;
  }

  // Tone directives
  let toneGuide = "";
  switch (tone) {
    case "formal":
      toneGuide = `Tone: FORMAL & PROFESSIONAL. Use elevated corporate vocabulary and maintain an authoritative, objective stance.`;
      break;
    case "simplified":
      toneGuide = `Tone: SIMPLE & ACCESSIBLE. Explain concepts in plain, conversational English (ELI5 style) while preserving factual correctness. Avoid impenetrable jargon.`;
      break;
    case "academic":
      toneGuide = `Tone: SCHOLARLY & ANALYTICAL. Maintain academic rigor, precise domain terminology, and critical synthesis suitable for research papers.`;
      break;
    case "neutral":
    default:
      toneGuide = `Tone: BALANCED & OBJECTIVE. Neutral, journalistic, and clear.`;
      break;
  }

  const sourceSection = fileName
    ? `The user has provided an attached document (${fileName}) for analysis.
User supplementary instructions or text content:
${text || "Please provide a comprehensive summary of all key information and themes found in this file."}`
    : `--- SOURCE TEXT BEGIN ---
${text}
--- SOURCE TEXT END ---`;

  const prompt = `Please summarize the following source content according to the specific parameters below:

FORMAT REQUIREMENT:
${formatGuide}

LENGTH REQUIREMENT:
${lengthGuide}

TONE REQUIREMENT:
${toneGuide}

${sourceSection}

SUMMARY:`;

  return { prompt, systemInstruction };
}

// High-performance in-memory cache for instant replay of identical summaries
const summaryCache = new Map<string, { summary: string; modelUsed: string; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCacheKey(text: string, type: string, length: string, tone: string, fileName?: string): string {
  const preview = text.slice(0, 100) + text.length + (fileName || "");
  return `${type}_${length}_${tone}_${preview}`;
}

/**
 * Summarizes text using the Google Gen AI SDK with support for text and multimedia documents.
 * Optimized for low latency, token-bounded execution, and instant caching.
 */
export async function summarizeTextWithGemini(
  text: string,
  type: SummaryType,
  length: SummaryLength,
  tone: SummaryTone = "neutral",
  file?: UploadedFilePayload
): Promise<{ summary: string; modelUsed: string; fromCache?: boolean }> {
  // Check memory cache first (instant response for repeat queries or sample documents)
  const cacheKey = getCacheKey(text, type, length, tone, file?.name);
  const cached = summaryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      summary: cached.summary,
      modelUsed: cached.modelUsed,
      fromCache: true,
    };
  }

  const ai = getGeminiClient();
  const { prompt, systemInstruction } = buildPrompt(text, type, length, tone, file?.name);

  // Model selection: prioritize high-speed flash-lite for sub-second TTFT
  const candidateModels = [
    process.env.GEMINI_MODEL?.trim(),
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.1-pro-preview",
    "gemini-2.0-flash",
  ].filter(Boolean) as string[];

  // Token bounding optimization: capping output tokens drastically decreases latency
  let maxOutputTokens = 850;
  if (length === "short") maxOutputTokens = 420;
  else if (length === "long") maxOutputTokens = 1700;

  // Construct payload with optional inline document/image part
  const contents: any[] = [];
  if (file && file.base64Data && file.mimeType) {
    contents.push({
      inlineData: {
        mimeType: file.mimeType,
        data: file.base64Data,
      },
    });
  }
  contents.push(prompt);

  let lastError: unknown = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.15, // Low entropy for rapid deterministic decoding
          maxOutputTokens, // Eliminates trailing token generation lag
          topP: 0.85,
          topK: 25,
        },
      });

      const summary = response.text?.trim() || "";

      if (summary) {
        // Store in cache for instantaneous replay
        summaryCache.set(cacheKey, {
          summary,
          modelUsed: model,
          timestamp: Date.now(),
        });

        // Cap cache size to 100 items
        if (summaryCache.size > 100) {
          const oldestKey = summaryCache.keys().next().value;
          if (oldestKey) summaryCache.delete(oldestKey);
        }

        return {
          summary,
          modelUsed: model,
        };
      }
    } catch (error: unknown) {
      lastError = error;
      console.warn(`Model ${model} failed, attempting next candidate...`, error instanceof Error ? error.message : error);
    }
  }

  throw lastError || new Error("Failed to generate summary with available Gemini models.");
}
