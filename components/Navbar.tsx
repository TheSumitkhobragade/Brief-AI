"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Moon, Sun, History } from "lucide-react";

interface NavbarProps {
  onOpenHistory: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenHistory, historyCount }) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Project Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-md shadow-indigo-500/20 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              BriefAI
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Intelligent Document Synthesis &amp; Summarization
            </p>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* History drawer button */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            title="View Recent Summaries"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                {historyCount}
              </span>
            )}
          </button>

          {/* Dark / Light Mode Switch */}
          {mounted && (
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {darkMode ? (
                <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-90" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
