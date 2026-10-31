"use client";

import React from "react";
import { TrendingDown, Clock, FileText, CheckCircle, Zap } from "lucide-react";
import { SummaryStats } from "@/lib/types";
import { formatReadingTime } from "@/lib/utils";

interface StatsCardProps {
  stats: SummaryStats;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* 1. Reduction Badge */}
      <div className="flex flex-col rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/30">
        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
          <TrendingDown className="h-4 w-4" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Reduction
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">
            {stats.reductionPercentage}%
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            condensed
          </span>
        </div>
      </div>

      {/* 2. Original Count */}
      <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <FileText className="h-4 w-4" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Source Text
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {stats.originalWordCount.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">words</span>
        </div>
      </div>

      {/* 3. Summary Count */}
      <div className="flex flex-col rounded-xl border border-indigo-200/80 bg-indigo-50/60 p-3.5 dark:border-indigo-900/40 dark:bg-indigo-950/30">
        <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
          <CheckCircle className="h-4 w-4" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Summary Text
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight text-indigo-700 dark:text-indigo-300">
            {stats.summaryWordCount.toLocaleString()}
          </span>
          <span className="text-xs text-indigo-600 dark:text-indigo-400">words</span>
        </div>
      </div>

      {/* 4. Speed & Time Saved */}
      <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Time Saved
            </span>
          </div>

          {(stats.latencyMs || stats.fromCache) && (
            <span className="inline-flex items-center gap-0.5 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
              <Zap className="h-2.5 w-2.5" />
              {stats.fromCache ? "0ms" : `${stats.latencyMs}ms`}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            ~{formatReadingTime(stats.estimatedReadingTimeSavedSec)}
          </span>
        </div>
      </div>
    </div>
  );
};
