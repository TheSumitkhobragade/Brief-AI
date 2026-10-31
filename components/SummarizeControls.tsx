"use client";

import React from "react";
import {
  AlignLeft,
  List,
  Briefcase,
  Lightbulb,
  Sparkles,
  Sliders,
  Loader2,
} from "lucide-react";
import { SummaryLength, SummaryTone, SummaryType } from "@/lib/types";

interface SummarizeControlsProps {
  type: SummaryType;
  onTypeChange: (val: SummaryType) => void;
  length: SummaryLength;
  onLengthChange: (val: SummaryLength) => void;
  tone: SummaryTone;
  onToneChange: (val: SummaryTone) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export const SummarizeControls: React.FC<SummarizeControlsProps> = ({
  type,
  onTypeChange,
  length,
  onLengthChange,
  tone,
  onToneChange,
  onSubmit,
  isLoading,
  disabled,
}) => {
  const typeOptions: {
    id: SummaryType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    desc: string;
  }[] = [
    {
      id: "paragraph",
      label: "Paragraph",
      icon: AlignLeft,
      desc: "Flowing narrative prose",
    },
    {
      id: "bullet",
      label: "Bullet Points",
      icon: List,
      desc: "Clean highlight bullets",
    },
    {
      id: "executive",
      label: "Executive Brief",
      icon: Briefcase,
      desc: "Structured corporate overview",
    },
    {
      id: "takeaways",
      label: "Key Takeaways",
      icon: Lightbulb,
      desc: "Numbered actionable points",
    },
  ];

  const lengthOptions: {
    id: SummaryLength;
    label: string;
    sub: string;
  }[] = [
    { id: "short", label: "Short", sub: "~25% length" },
    { id: "medium", label: "Medium", sub: "~45% length" },
    { id: "long", label: "Detailed", sub: "~65% length" },
  ];

  const toneOptions: {
    id: SummaryTone;
    label: string;
  }[] = [
    { id: "neutral", label: "Neutral" },
    { id: "formal", label: "Formal" },
    { id: "simplified", label: "Simplified (ELI5)" },
    { id: "academic", label: "Academic" },
  ];

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800/80">
        <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Summarization Configuration
        </h3>
      </div>

      {/* 1. Summary Type */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Summary Format
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {typeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = type === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onTypeChange(opt.id)}
                disabled={isLoading}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-xs dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-200"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon
                    className={`h-4 w-4 ${
                      isSelected
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  />
                  <span className="text-xs font-semibold">{opt.label}</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Summary Length & Tone row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Length selector */}
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Target Length
          </label>
          <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-slate-200 bg-slate-100/70 p-1 dark:border-slate-700 dark:bg-slate-800/80">
            {lengthOptions.map((opt) => {
              const isSelected = length === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onLengthChange(opt.id)}
                  disabled={isLoading}
                  className={`flex flex-col items-center justify-center rounded-lg py-2 text-center transition ${
                    isSelected
                      ? "bg-white text-indigo-600 shadow-xs font-semibold dark:bg-slate-900 dark:text-indigo-400"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <span className="text-xs">{opt.label}</span>
                  <span className="text-[9px] opacity-75">{opt.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tone selector */}
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Perspective / Tone
          </label>
          <select
            value={tone}
            onChange={(e) => onToneChange(e.target.value as SummaryTone)}
            disabled={isLoading}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {toneOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action CTA Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || isLoading}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition duration-200 ${
            disabled || isLoading
              ? "cursor-not-allowed bg-slate-400 opacity-60 dark:bg-slate-700"
              : "bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/25 active:scale-[0.99]"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Synthesizing with Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Generate AI Summary</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
