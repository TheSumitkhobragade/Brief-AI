export type SummaryType = "paragraph" | "bullet" | "executive" | "takeaways";

export type SummaryLength = "short" | "medium" | "long";

export type SummaryTone = "neutral" | "formal" | "simplified" | "academic";

export interface UploadedFilePayload {
  name: string;
  mimeType: string;
  base64Data: string;
}

export interface SummarizeRequest {
  text: string;
  type: SummaryType;
  length: SummaryLength;
  tone?: SummaryTone;
  file?: UploadedFilePayload;
}

export interface SummaryStats {
  originalWordCount: number;
  summaryWordCount: number;
  reductionPercentage: number;
  originalCharCount: number;
  summaryCharCount: number;
  estimatedReadingTimeSavedSec: number;
  latencyMs?: number;
  fromCache?: boolean;
}

export interface SummaryMeta {
  model: string;
  type: SummaryType;
  length: SummaryLength;
  tone: SummaryTone;
  generatedAt: string;
}

export interface SummarizeResponse {
  summary: string;
  stats: SummaryStats;
  meta: SummaryMeta;
  suggestedQuestions?: string[];
}

export interface HistoryItem {
  id: string;
  originalPreview: string;
  summary: string;
  stats: SummaryStats;
  meta: SummaryMeta;
  suggestedQuestions?: string[];
  timestamp: number;
}
