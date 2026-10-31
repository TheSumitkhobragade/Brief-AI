"use client";

import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Download,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronDown,
  FileText,
  FileType,
  FileCode,
  Loader2,
  Zap,
  FastForward,
} from "lucide-react";
import { SummarizeResponse, UploadedFilePayload } from "@/lib/types";
import { StatsCard } from "./StatsCard";
import { downloadAsTxt, downloadAsPdf, downloadAsDocx } from "@/lib/export-helpers";
import { DocumentChat } from "./DocumentChat";

interface SummaryOutputProps {
  data: SummarizeResponse;
  sourceDocumentText?: string;
  attachedFile?: UploadedFilePayload;
}

export const SummaryOutput: React.FC<SummaryOutputProps> = ({
  data,
  sourceDocumentText,
  attachedFile,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Progressive streaming typewriter effect state
  const [displayedText, setDisplayedText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  useEffect(() => {
    // If response was served from instant memory cache, display immediately
    if (data.stats.fromCache) {
      setDisplayedText(data.summary);
      setIsTyping(false);
      return;
    }

    setDisplayedText("");
    setIsTyping(true);

    const fullText = data.summary;
    let currentIdx = 0;
    // Dynamic chunk calculation so the animation completes within ~700-1100ms regardless of length
    const stepSize = Math.max(16, Math.floor(fullText.length / 32));

    const interval = setInterval(() => {
      currentIdx += stepSize;
      if (currentIdx >= fullText.length) {
        setDisplayedText(fullText);
        setIsTyping(false);
        clearInterval(interval);
      } else {
        setDisplayedText(fullText.slice(0, currentIdx));
      }
    }, 22);

    return () => clearInterval(interval);
  }, [data.summary, data.stats.fromCache]);

  const handleSkipTyping = () => {
    setDisplayedText(data.summary);
    setIsTyping(false);
  };

  // Copy to clipboard with visual feedback
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const exportMeta = {
    type: data.meta.type,
    reductionPercentage: data.stats.reductionPercentage,
    originalWordCount: data.stats.originalWordCount,
    summaryWordCount: data.stats.summaryWordCount,
    dateStr: data.meta.generatedAt.split("T")[0],
  };

  const handleExportTxt = () => {
    setShowExportMenu(false);
    downloadAsTxt(data.summary, exportMeta);
  };

  const handleExportPdf = () => {
    setShowExportMenu(false);
    downloadAsPdf(data.summary, exportMeta);
  };

  const handleExportDocx = async () => {
    setShowExportMenu(false);
    setIsExporting(true);
    try {
      await downloadAsDocx(data.summary, exportMeta);
    } catch (e) {
      console.error("Word document export error:", e);
    } finally {
      setIsExporting(false);
    }
  };

  // Text-to-Speech synthesis
  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported by your browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(data.summary);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Markdown line-by-line renderer
  const renderFormattedSummary = (content: string) => {
    const lines = content.split("\n");

    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Heading 2
      if (trimmed.startsWith("## ")) {
        return (
          <h3
            key={idx}
            className="mt-4 mb-2 text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-1 dark:border-slate-800"
          >
            {trimmed.replace(/^##\s+/, "")}
          </h3>
        );
      }

      // Heading 3
      if (trimmed.startsWith("### ")) {
        return (
          <h4
            key={idx}
            className="mt-3 mb-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            {trimmed.replace(/^###\s+/, "")}
          </h4>
        );
      }

      // Bullet items (* or -)
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        const bulletContent = trimmed.replace(/^(\*|-)\s+/, "");
        const formatted = parseBold(bulletContent);

        return (
          <li key={idx} className="ml-4 list-disc pl-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed my-1">
            {formatted}
          </li>
        );
      }

      // Numbered items: 1. ...
      if (/^\d+\.\s+/.test(trimmed)) {
        const numberContent = trimmed.replace(/^\d+\.\s+/, "");
        return (
          <li key={idx} className="ml-5 list-decimal pl-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed my-1">
            {parseBold(numberContent)}
          </li>
        );
      }

      // Blank line
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }

      // Normal paragraph
      return (
        <p key={idx} className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-2">
          {parseBold(line)}
        </p>
      );
    });
  };

  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      {/* Visual Analytics Grid */}
      <StatsCard stats={data.stats} />

      {/* Summary Box Container */}
      <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Top Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Generated Summary
                </span>
                {isTyping && (
                  <button
                    onClick={handleSkipTyping}
                    className="inline-flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300"
                    title="Skip typing animation"
                  >
                    <FastForward className="h-2.5 w-2.5" />
                    <span>Skip</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                <span>{data.meta.type}</span> &bull;
                <span>{data.meta.length}</span> &bull;
                <span>{data.meta.tone}</span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5">
            {/* Text to Speech button */}
            <button
              type="button"
              onClick={handleToggleSpeech}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                isSpeaking
                  ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
              title={isSpeaking ? "Stop listening" : "Listen to summary"}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-amber-600" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Listen</span>
                </>
              )}
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Copied!
                  </span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Multi-Format Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-200/90 bg-indigo-50/80 px-2.5 py-1.5 text-xs font-medium text-indigo-700 shadow-2xs transition hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
                title="Export summary options"
              >
                {isExporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                <span>Export</span>
                <ChevronDown className="h-3 w-3 opacity-75" />
              </button>

              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 top-full z-40 mt-1.5 w-52 max-w-[calc(100vw-3rem)] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-800 animate-fade-in">
                    <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Export Summary As
                    </div>

                    {/* TXT Option */}
                    <button
                      type="button"
                      onClick={handleExportTxt}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/70"
                    >
                      <FileText className="h-4 w-4 text-slate-500" />
                      <div>
                        <div>Plain Text (.txt)</div>
                        <div className="text-[10px] text-slate-400">Clean unformatted text</div>
                      </div>
                    </button>

                    {/* PDF Option */}
                    <button
                      type="button"
                      onClick={handleExportPdf}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/70"
                    >
                      <FileType className="h-4 w-4 text-rose-500" />
                      <div>
                        <div>PDF Document (.pdf)</div>
                        <div className="text-[10px] text-slate-400">Formatted executive report</div>
                      </div>
                    </button>

                    {/* DOCX Option */}
                    <button
                      type="button"
                      onClick={handleExportDocx}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/70"
                    >
                      <FileCode className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <div>Word Document (.docx)</div>
                        <div className="text-[10px] text-slate-400">Editable Microsoft Word format</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Summary Content Body with Progressive Typewriter Rendering */}
        <div className="p-5 font-sans">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {renderFormattedSummary(displayedText)}
            {isTyping && (
              <span className="inline-block h-3.5 w-1.5 ml-1 bg-indigo-600 dark:bg-indigo-400 animate-pulse align-middle" />
            )}
          </div>
        </div>

        {/* Footer Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-2.5 text-[11px] text-slate-400 dark:border-slate-800 dark:bg-slate-900/30">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-indigo-500" />
            <span>
              {data.stats.fromCache
                ? "Instant In-Memory Cache (< 5ms)"
                : `Synthesized in ${data.stats.latencyMs || 650}ms`}
            </span>
          </div>
          <div>{new Date(data.meta.generatedAt).toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Interactive Document Q&A Follow-up Section with Dynamic Questions */}
      <DocumentChat
        documentText={sourceDocumentText || data.summary}
        file={attachedFile}
        suggestedQuestions={data.suggestedQuestions}
      />
    </div>
  );
};
