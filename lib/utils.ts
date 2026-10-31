import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with tailwind-merge to avoid style collisions.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Counts the number of words in a string accurately.
 */
export function countWords(text: string): number {
  if (!text || typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

/**
 * Counts characters excluding leading/trailing carriage returns if desired.
 */
export function countCharacters(text: string): number {
  if (!text || typeof text !== "string") return 0;
  return text.length;
}

/**
 * Computes reduction percentage between original and summary word counts.
 */
export function calculateReductionPercentage(
  originalWords: number,
  summaryWords: number
): number {
  if (originalWords <= 0) return 0;
  if (summaryWords >= originalWords) return 0;
  const reduction = ((originalWords - summaryWords) / originalWords) * 100;
  return Math.max(0, Math.min(100, Math.round(reduction)));
}

/**
 * Estimates reading time in minutes assuming average speed of 200 words per minute.
 */
export function estimateReadingTimeSec(words: number): number {
  if (words <= 0) return 0;
  const wordsPerSecond = 200 / 60;
  return Math.round(words / wordsPerSecond);
}

/**
 * Formats seconds into human-readable minutes and seconds.
 */
export function formatReadingTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} sec`;
  }
  const mins = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  return remainingSecs > 0 ? `${mins}m ${remainingSecs}s` : `${mins} min`;
}

/**
 * Formats raw markdown or bullet points cleanly for download.
 */
export function sanitizeForDownload(text: string): string {
  return text.trim();
}
