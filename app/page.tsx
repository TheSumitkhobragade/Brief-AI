"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { TextInputArea } from "@/components/TextInputArea";
import { SummarizeControls } from "@/components/SummarizeControls";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { SummaryOutput } from "@/components/SummaryOutput";
import { HistoryDrawer } from "@/components/HistoryDrawer";
import {
  HistoryItem,
  SummarizeRequest,
  SummarizeResponse,
  SummaryLength,
  SummaryTone,
  SummaryType,
  UploadedFilePayload,
} from "@/lib/types";
import { UploadedFileMeta } from "@/components/FileUpload";
import { countWords } from "@/lib/utils";
import {
  AlertCircle,
  FileQuestion,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const [inputText, setInputText] = useState<string>("");
  const [summaryType, setSummaryType] = useState<SummaryType>("paragraph");
  const [summaryLength, setSummaryLength] = useState<SummaryLength>("medium");
  const [summaryTone, setSummaryTone] = useState<SummaryTone>("neutral");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummarizeResponse | null>(null);

  // Attached file state (supports TXT, PDF, and Images)
  const [attachedFile, setAttachedFile] = useState<UploadedFilePayload | null>(null);
  const [attachedMeta, setAttachedMeta] = useState<UploadedFileMeta | null>(null);

  // History state
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const stored = localStorage.getItem("briefai_history");
      if (stored) {
        setHistoryItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage:", e);
    }
  }, []);

  // Save history helper
  const saveToHistory = (item: HistoryItem) => {
    try {
      const updated = [item, ...historyItems.slice(0, 19)]; // Keep latest 20
      setHistoryItems(updated);
      localStorage.setItem("briefai_history", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to persist history item:", e);
    }
  };

  const handleClearHistory = () => {
    setHistoryItems([]);
    localStorage.removeItem("briefai_history");
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = historyItems.filter((item) => item.id !== id);
    setHistoryItems(updated);
    localStorage.setItem("briefai_history", JSON.stringify(updated));
  };

  const handleLoadFromHistory = (item: HistoryItem) => {
    setSummaryResult({
      summary: item.summary,
      stats: item.stats,
      meta: item.meta,
    });
    setSummaryType(item.meta.type);
    setSummaryLength(item.meta.length);
    setSummaryTone(item.meta.tone);
  };

  // File load and removal handlers
  const handleFileProcessed = (data: {
    textContent?: string;
    filePayload?: UploadedFilePayload;
    meta: UploadedFileMeta;
  }) => {
    if (data.textContent) {
      setInputText(data.textContent);
    }
    if (data.filePayload) {
      setAttachedFile(data.filePayload);
    } else {
      setAttachedFile(null);
    }
    setAttachedMeta(data.meta);
    if (errorMessage) setErrorMessage(null);
  };

  const handleFileRemoved = () => {
    setAttachedFile(null);
    setAttachedMeta(null);
  };

  // Keyboard shortcut: Ctrl + Enter to summarize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (!isLoading && (attachedFile || countWords(inputText) >= 10)) {
          handleSummarize();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputText, attachedFile, isLoading, summaryType, summaryLength, summaryTone]);

  // Main submission handler
  const handleSummarize = async () => {
    const trimmed = inputText.trim();
    const wordCount = countWords(trimmed);
    const hasFile = Boolean(attachedFile);

    if (!hasFile && wordCount < 10) {
      setErrorMessage(
        `Source document is too brief. Please enter at least 10 words or upload a document/image.`
      );
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const payload: SummarizeRequest = {
        text: trimmed || (attachedMeta ? `Document analysis: ${attachedMeta.name}` : ""),
        type: summaryType,
        length: summaryLength,
        tone: summaryTone,
        file: attachedFile || undefined,
      };

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate summary.");
      }

      setSummaryResult(data);

      // Append to local history
      const previewText = attachedMeta
        ? `[${attachedMeta.name}] ${trimmed.slice(0, 80)}`
        : trimmed.slice(0, 140) + "...";

      const historyRecord: HistoryItem = {
        id: "hist-" + Date.now(),
        originalPreview: previewText,
        summary: data.summary,
        stats: data.stats,
        meta: data.meta,
        timestamp: Date.now(),
      };
      saveToHistory(historyRecord);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 dark:bg-slate-950">
      {/* Top Navbar */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Project Header Banner */}
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            AI-Powered Text Summarizer
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Transform lengthy articles, reports, and academic papers into concise,
            structured summaries with configurable formats and analytical compression metrics.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 animate-fade-in">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Error: </span>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* 2-Column Responsive Workspace Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 items-start">
          {/* Left Column: Input and Configuration */}
          <div className="flex flex-col gap-6">
            <TextInputArea
              value={inputText}
              onChange={(val) => {
                setInputText(val);
                if (errorMessage) setErrorMessage(null);
              }}
              onFileProcessed={handleFileProcessed}
              onFileRemoved={handleFileRemoved}
              disabled={isLoading}
            />

            <SummarizeControls
              type={summaryType}
              onTypeChange={setSummaryType}
              length={summaryLength}
              onLengthChange={setSummaryLength}
              tone={summaryTone}
              onToneChange={setSummaryTone}
              onSubmit={handleSummarize}
              isLoading={isLoading}
              disabled={!attachedFile && countWords(inputText) < 10}
            />
          </div>

          {/* Right Column: Output / Skeleton / Placeholder */}
          <div className="flex flex-col gap-6">
            {isLoading ? (
              <SkeletonLoader />
            ) : summaryResult ? (
              <SummaryOutput
                data={summaryResult}
                sourceDocumentText={inputText}
                attachedFile={attachedFile || undefined}
              />
            ) : (
              /* Empty state placeholder */
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 p-12 text-center dark:border-slate-800 dark:bg-slate-900/40 min-h-[420px]">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 mb-4">
                  <FileQuestion className="h-7 w-7" />
                </div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  Ready to Summarize
                </h3>
                <p className="mt-1.5 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                  Enter your source document on the left, pick your preferred format and length, then click{" "}
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    &ldquo;Generate AI Summary&rdquo;
                  </span>{" "}
                  or press <kbd className="rounded border px-1 py-0.5 text-[10px]">Ctrl + Enter</kbd>.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
                    ⚡ Fast Latency
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
                    📊 Reduction Metrics
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
                    💾 .txt Export
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* History Slide-Out Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={historyItems}
        onSelect={handleLoadFromHistory}
        onClearAll={handleClearHistory}
        onDeleteItem={handleDeleteHistoryItem}
      />

      {/* Minimalist SaaS Footer */}
      <footer className="mt-16 border-t border-slate-200/80 bg-white/60 py-6 text-xs text-slate-500 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div>
            <span>&copy; {new Date().getFullYear()} BriefAI. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">Terms of Service</span>
            <span>&bull;</span>
            <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
