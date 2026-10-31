"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Loader2,
  Sparkles,
  Bot,
  User,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { UploadedFilePayload } from "@/lib/types";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

interface DocumentChatProps {
  documentText: string;
  file?: UploadedFilePayload;
}

const SUGGESTED_QUESTIONS = [
  "What are the main conclusions or findings?",
  "Are there any limitations or risks mentioned?",
  "Can you list all numerical statistics and metrics?",
  "Explain the core premise in 2 simple sentences.",
];

export const DocumentChat: React.FC<DocumentChatProps> = ({
  documentText,
  file,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isLoading) return;

    setChatError(null);
    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText,
          question: trimmed,
          file,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to retrieve an answer.");
      }

      const aiMsg: ChatMessage = {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error querying document.";
      setChatError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setChatError(null);
  };

  // Basic Markdown line parser for chat responses
  const renderFormattedAnswer = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-1.5" />;

      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        const content = trimmed.replace(/^(\*|-)\s+/, "");
        return (
          <li key={idx} className="ml-4 list-disc text-xs leading-relaxed my-0.5">
            {parseBold(content)}
          </li>
        );
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        const content = trimmed.replace(/^\d+\.\s+/, "");
        return (
          <li key={idx} className="ml-5 list-decimal text-xs leading-relaxed my-0.5">
            {parseBold(content)}
          </li>
        );
      }

      return (
        <p key={idx} className="text-xs leading-relaxed mb-1">
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
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Ask Questions About This Document
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Interactive contextual Q&amp;A powered by Google Gemini
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleClearChat}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
            title="Clear chat conversation"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Suggested Questions (shown when conversation is empty) */}
      {messages.length === 0 && (
        <div className="p-4 bg-slate-50/40 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <HelpCircle className="h-3 w-3 text-indigo-500" />
            <span>Suggested follow-up questions:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-2xs hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="max-h-80 min-h-[140px] overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400">
            <Bot className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Need deeper clarification on this document?
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Type any question below or click a suggested prompt above.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-[10px] ${
                  msg.sender === "user"
                    ? "bg-indigo-600"
                    : "bg-gradient-to-tr from-purple-600 to-indigo-600"
                }`}
              >
                {msg.sender === "user" ? (
                  <User className="h-3.5 w-3.5" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-200 rounded-tl-none"
                }`}
              >
                {msg.sender === "user" ? (
                  <p className="leading-relaxed">{msg.text}</p>
                ) : (
                  renderFormattedAnswer(msg.text)
                )}
                <div
                  className={`mt-1 text-[9px] ${
                    msg.sender === "user"
                      ? "text-indigo-200 text-right"
                      : "text-slate-400 text-left"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white">
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/70">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
              <span>Analyzing document and answering...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {chatError && (
        <div className="px-4 py-1.5 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-100 dark:border-rose-900/40">
          {chatError}
        </div>
      )}

      {/* Input Bar */}
      <div className="border-t border-slate-100 p-2.5 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask anything about the source document..."
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={`flex h-8 w-8 items-center justify-center rounded-xl text-white transition ${
              !inputValue.trim() || isLoading
                ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 shadow-sm"
            }`}
            title="Send Question"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
