"use client";

import React, { useState } from "react";
import {
  FileText,
  Trash2,
  BookOpen,
  Clock,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { SAMPLE_TEXTS, SampleText } from "@/lib/sample-texts";
import { countCharacters, countWords, estimateReadingTimeSec, formatReadingTime } from "@/lib/utils";
import { FileUpload, UploadedFileMeta } from "./FileUpload";
import { UploadedFilePayload } from "@/lib/types";

interface TextInputAreaProps {
  value: string;
  onChange: (val: string) => void;
  onFileProcessed: (data: {
    textContent?: string;
    filePayload?: UploadedFilePayload;
    meta: UploadedFileMeta;
  }) => void;
  onFileRemoved: () => void;
  disabled?: boolean;
}

export const TextInputArea: React.FC<TextInputAreaProps> = ({
  value,
  onChange,
  onFileProcessed,
  onFileRemoved,
  disabled = false,
}) => {
  const [showSamplesDropdown, setShowSamplesDropdown] = useState(false);

  const wordCount = countWords(value);
  const charCount = countCharacters(value);
  const readingSec = estimateReadingTimeSec(wordCount);

  const handleSelectSample = (sample: SampleText) => {
    onChange(sample.content);
    setShowSamplesDropdown(false);
  };

  const handleClear = () => {
    if (!value) return;
    onChange("");
    onFileRemoved();
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Source Document & Files
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Sample text loader dropdown */}
          <div className="relative">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setShowSamplesDropdown(!showSamplesDropdown)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Load Sample</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showSamplesDropdown && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowSamplesDropdown(false)}
                />
                <div className="absolute right-0 top-full z-30 mt-1.5 w-72 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-800 animate-fade-in">
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Select a Sample Document
                  </div>
                  {SAMPLE_TEXTS.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className="flex w-full flex-col items-start rounded-lg px-2.5 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-slate-700/60"
                    >
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                        {sample.title}
                      </span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                        {sample.category}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Clear Button */}
          {value.length > 0 && (
            <button
              type="button"
              disabled={disabled}
              onClick={handleClear}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200/80 bg-rose-50/50 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/50"
              title="Clear text"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* File Upload zone supporting TXT, PDF, and Images */}
      <div className="px-4 pt-3 pb-1">
        <FileUpload
          onFileProcessed={onFileProcessed}
          onFileRemoved={onFileRemoved}
          disabled={disabled}
        />
      </div>

      {/* Main Textarea */}
      <div className="relative p-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Paste or type text here, or upload a TXT, Markdown, PDF, or Image document above. You can also add supplementary notes or specific focus instructions here..."
          rows={13}
          className="w-full resize-none bg-transparent font-sans text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>

      {/* Bottom status & metrics footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {wordCount.toLocaleString()}
            </span>
            <span>words</span>
          </div>
          <span>&bull;</span>
          <div>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {charCount.toLocaleString()}
            </span>
            <span> chars</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>Est. read time:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {formatReadingTime(readingSec)}
          </span>
        </div>
      </div>
    </div>
  );
};
