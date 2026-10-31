import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BriefAI - Intelligent AI Text Summarizer",
  description:
    "Fast, intelligent, and context-aware text summarization platform for modern research and professional documents.",
  keywords: [
    "Text Summarizer",
    "AI Summarization",
    "Document Synthesis",
    "Executive Briefing",
    "NLP",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent theme flashing on page load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
