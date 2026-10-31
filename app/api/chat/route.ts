import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { UploadedFilePayload } from "@/lib/types";

interface ChatRequest {
  documentText?: string;
  question: string;
  file?: UploadedFilePayload;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Google Gemini API Key is missing. Please configure GEMINI_API_KEY in .env.local", code: "MISSING_KEY" },
        { status: 500 }
      );
    }

    let body: Partial<ChatRequest>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request payload.", code: "INVALID_JSON" },
        { status: 400 }
      );
    }

    const { documentText = "", question, file } = body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "A question is required.", code: "MISSING_QUESTION" },
        { status: 400 }
      );
    }

    const trimmedQuestion = question.trim();
    const hasFile = Boolean(file && file.base64Data && file.mimeType);

    if (!documentText && !hasFile) {
      return NextResponse.json(
        { error: "No document context or file was provided for this question.", code: "NO_CONTEXT" },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are an expert Document Q&A Assistant.
Your goal is to answer questions regarding the provided document or file with high precision, clarity, and factual fidelity.
Guidelines:
1. Base your answer strictly on the content provided in the source document or image.
2. If the user asks for data, summaries, definitions, or quotes, extract them accurately.
3. If the answer cannot be determined or inferred from the document, politely reply: "The provided document does not contain information to answer this question."
4. Format your answer with clean, readable Markdown (bullet points, bold highlights, etc.). Keep explanations crisp and to the point.`;

    const promptText = `DOCUMENT CONTEXT:
${documentText || `(Content provided in attached document: ${file?.name || "file"})`}

USER QUESTION:
${trimmedQuestion}

ANSWER:`;

    const contents: any[] = [];
    if (hasFile && file) {
      contents.push({
        inlineData: {
          mimeType: file.mimeType,
          data: file.base64Data,
        },
      });
    }
    contents.push(promptText);

    const candidateModels = [
      process.env.GEMINI_MODEL?.trim(),
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.1-pro-preview",
      "gemini-2.0-flash",
    ].filter(Boolean) as string[];

    let lastError: unknown = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });

        const answer = response.text?.trim() || "";
        if (answer) {
          return NextResponse.json(
            { answer, modelUsed: model },
            { status: 200 }
          );
        }
      } catch (err: unknown) {
        lastError = err;
        console.warn(`Chat model ${model} failed, trying next candidate...`, err instanceof Error ? err.message : err);
      }
    }

    throw lastError || new Error("Failed to get an answer from Gemini models.");
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const message = error instanceof Error ? error.message : "Internal chat error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
