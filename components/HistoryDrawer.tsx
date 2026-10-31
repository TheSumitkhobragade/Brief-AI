"use client";

import React from "react";
import {
  X,
  History,
  Trash2,
  TrendingDown,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { HistoryItem, SummarizeResponse } from "@/lib/types";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClearAll: () => void;
  onDeleteItem: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelect,
  onClearAll,
  onDeleteItem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform border-l border-slate-200 bg-white shadow-2xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-900">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Summarization History
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Action Bar */}
          {items.length > 0 && (
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-2.5 dark:border-slate-800/80 dark:bg-slate-900/60">
              <span className="text-xs text-slate-500">
                {items.length} {items.length === 1 ? "summary" : "summaries"} stored
              </span>
              <button
                onClick={onClearAll}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          )}

          {/* List of items */}
          <div className="h-[calc(100vh-8rem)] overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Sparkles className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No summaries saved yet
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Generate your first text summary and it will be saved here automatically for quick reference.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-indigo-300 hover:shadow-xs dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-indigo-700"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 uppercase dark:bg-indigo-950 dark:text-indigo-300">
                        {item.meta.type}
                      </span>
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        -{item.stats.reductionPercentage}%
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="text-slate-300 hover:text-rose-500 transition p-1 dark:text-slate-600 dark:hover:text-rose-400"
                      title="Delete item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic mb-2">
                    &ldquo;{item.originalPreview}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>

                    <button
                      onClick={() => {
                        onSelect(item);
                        onClose();
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      <span>Load</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
