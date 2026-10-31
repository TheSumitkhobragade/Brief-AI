"use client";

import React, { useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  FileSpreadsheet,
  Image as ImageIcon,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { UploadedFilePayload } from "@/lib/types";

export interface UploadedFileMeta {
  name: string;
  size: number;
  type: string;
  isMediaOrPdf: boolean;
}

interface FileUploadProps {
  onFileProcessed: (data: {
    textContent?: string;
    filePayload?: UploadedFilePayload;
    meta: UploadedFileMeta;
  }) => void;
  onFileRemoved: () => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB max

const ACCEPTED_EXTENSIONS = [
  ".txt",
  ".md",
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];

const ACCEPT_STRING =
  ".txt,.md,.pdf,.png,.jpg,.jpeg,.webp,text/plain,application/pdf,image/png,image/jpeg,image/webp";

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileProcessed,
  onFileRemoved,
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [currentMeta, setCurrentMeta] = useState<UploadedFileMeta | null>(null);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const processSelectedFile = (file: File) => {
    setErrorMessage(null);

    // 1. Validate file extension & mime
    const lowerName = file.name.toLowerCase();
    const hasValidExt = ACCEPTED_EXTENSIONS.some((ext) =>
      lowerName.endsWith(ext)
    );

    const isPdf = file.type === "application/pdf" || lowerName.endsWith(".pdf");
    const isImage =
      file.type.startsWith("image/") ||
      lowerName.endsWith(".png") ||
      lowerName.endsWith(".jpg") ||
      lowerName.endsWith(".jpeg") ||
      lowerName.endsWith(".webp");
    const isText =
      file.type.startsWith("text/") ||
      lowerName.endsWith(".txt") ||
      lowerName.endsWith(".md");

    if (!hasValidExt && !isPdf && !isImage && !isText) {
      setErrorMessage(
        "Unsupported file type. Please upload a TXT, Markdown (.md), PDF, or Image file (PNG, JPG, WEBP)."
      );
      return;
    }

    // 2. Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(
        `File is too large (${formatFileSize(file.size)}). Maximum allowable size is 10 MB.`
      );
      return;
    }

    setIsReading(true);

    // 3. Process according to format
    if (isText) {
      // Plain text files
      const reader = new FileReader();
      reader.onload = (e) => {
        setIsReading(false);
        const textContent = (e.target?.result as string) || "";
        const meta: UploadedFileMeta = {
          name: file.name,
          size: file.size,
          type: file.type || "text/plain",
          isMediaOrPdf: false,
        };
        setCurrentMeta(meta);
        onFileProcessed({ textContent, meta });
      };
      reader.onerror = () => {
        setIsReading(false);
        setErrorMessage("Failed to read text file. Please check file permissions.");
      };
      reader.readAsText(file);
    } else {
      // Multimodal files (PDF or Images)
      const reader = new FileReader();
      reader.onload = (e) => {
        setIsReading(false);
        const dataUrl = (e.target?.result as string) || "";
        // Extract base64 portion
        const base64Data = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
        const mimeType =
          file.type ||
          (isPdf
            ? "application/pdf"
            : lowerName.endsWith(".png")
            ? "image/png"
            : "image/jpeg");

        const meta: UploadedFileMeta = {
          name: file.name,
          size: file.size,
          type: mimeType,
          isMediaOrPdf: true,
        };

        const filePayload: UploadedFilePayload = {
          name: file.name,
          mimeType,
          base64Data,
        };

        setCurrentMeta(meta);
        onFileProcessed({ filePayload, meta });
      };
      reader.onerror = () => {
        setIsReading(false);
        setErrorMessage("Failed to process document. Please try another file.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setCurrentMeta(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileRemoved();
  };

  // Helper icon for current file
  const renderFileIcon = () => {
    if (!currentMeta) return null;
    if (currentMeta.type.includes("pdf")) {
      return <FileSpreadsheet className="h-4 w-4 text-rose-500 shrink-0" />;
    }
    if (currentMeta.type.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4 text-emerald-500 shrink-0" />;
    }
    return <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />;
  };

  return (
    <div className="w-full">
      {/* Hidden standard file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_STRING}
        onChange={handleChange}
        disabled={disabled || isReading}
        className="hidden"
        id="native-pc-file-upload"
      />

      {currentMeta ? (
        /* Uploaded File Pill */
        <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/80 px-4 py-2.5 text-xs shadow-2xs dark:border-indigo-900/50 dark:bg-indigo-950/40 animate-fade-in">
          <div className="flex items-center gap-2.5 truncate">
            {renderFileIcon()}
            <div className="truncate">
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate mr-2">
                {currentMeta.name}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                ({formatFileSize(currentMeta.size)} &bull;{" "}
                {currentMeta.isMediaOrPdf ? "Gemini Multimodal" : "Text Extracted"})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
            title="Remove attached file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* Native-clickable & Drag-and-Drop Label Box */
        <label
          htmlFor="native-pc-file-upload"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`group flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed px-4 py-3 text-xs transition duration-200 ${
            dragActive
              ? "border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:bg-indigo-950/50"
              : "border-slate-300 bg-slate-50/60 hover:border-indigo-400 hover:bg-slate-100/70 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-indigo-500 dark:hover:bg-slate-800/80"
          } ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition group-hover:scale-105 dark:bg-indigo-950 dark:text-indigo-400">
              {isReading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}
            </div>
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {isReading ? "Processing file..." : "Select or drag file from your PC"}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Supports <span className="font-medium text-indigo-600 dark:text-indigo-400">TXT, MD, PDF, PNG, JPG, WEBP</span> (Max 10 MB)
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs group-hover:border-indigo-300 group-hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <FolderOpen className="h-3.5 w-3.5" />
            <span>Browse</span>
          </div>
        </label>
      )}

      {errorMessage && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 animate-fade-in">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
