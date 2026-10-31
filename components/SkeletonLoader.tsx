"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Brain, Cpu, CheckCircle2, Zap } from "lucide-react";

export const SkeletonLoader: React.FC = () => {
  const steps = [
    { label: "Tokenizing document content & structure", icon: Brain },
    { label: "Synthesizing core insights with Gemini Flash AI", icon: Zap },
    { label: "Formatting structure & analytical compression metrics", icon: CheckCircle2 },
  ];

  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Fast step advancement for engaging feedback
    const stepTimer = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 450);

    // Smooth continuous progress bar animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        const jump = Math.floor(Math.random() * 15) + 8;
        return Math.min(92, prev + jump);
      });
    }, 180);

    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
    };
  }, [steps.length]);

  return (
    <div className="relative flex flex-col rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm dark:border-indigo-950/60 dark:bg-slate-900 overflow-hidden">
      {/* Top progress line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top indicator */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Sparkles className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Generating Summary...
              </h4>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                {progress}%
              </span>
            </div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              {steps[activeStep].label}
            </p>
          </div>
        </div>

        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" />
        </div>
      </div>

      {/* Shimmer placeholders */}
      <div className="space-y-3.5 pt-5">
        <div className="h-4 w-1/3 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-3.5 w-full rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-3.5 w-11/12 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-3.5 w-4/5 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />

        <div className="pt-2">
          <div className="h-4 w-1/4 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
        <div className="h-3.5 w-full rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-3.5 w-5/6 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-3.5 w-2/3 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    </div>
  );
};
