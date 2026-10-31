import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";

export interface ExportMeta {
  type: string;
  reductionPercentage: number;
  originalWordCount: number;
  summaryWordCount: number;
  dateStr?: string;
}

/**
 * Plain Text Export
 */
export function downloadAsTxt(summary: string, meta: ExportMeta, baseName = "briefai-summary") {
  const dateStr = meta.dateStr || new Date().toISOString().split("T")[0];
  const header = `=====================================================
BriefAI Document Summary
Format: ${meta.type.toUpperCase()}
Compression: Reduced by ${meta.reductionPercentage}% (${meta.originalWordCount} -> ${meta.summaryWordCount} words)
Generated: ${new Date().toLocaleString()}
=====================================================

`;
  const fullContent = header + summary.trim();
  const blob = new Blob([fullContent], { type: "text/plain;charset=utf-8" });
  triggerBrowserDownload(blob, `${baseName}-${dateStr}.txt`);
}

/**
 * Formatted PDF Export using jsPDF
 */
export function downloadAsPdf(summary: string, meta: ExportMeta, baseName = "briefai-summary") {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 45;
  const maxLineWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Header Banner
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(margin, cursorY, maxLineWidth, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("BriefAI — Document Synthesis", margin + 12, cursorY + 21);

  cursorY += 46;

  // Metadata row
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const metaText = `Format: ${meta.type.toUpperCase()}   |   Reduction: ${meta.reductionPercentage}%   |   Words: ${meta.summaryWordCount} (from ${meta.originalWordCount})   |   Date: ${new Date().toLocaleDateString()}`;
  doc.text(metaText, margin, cursorY);

  cursorY += 14;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.8);
  doc.line(margin, cursorY, margin + maxLineWidth, cursorY);
  cursorY += 18;

  // Parse and render summary lines
  const lines = summary.split("\n");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);

  const checkPageOverflow = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
    }
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (!trimmed) {
      cursorY += 8;
      continue;
    }

    // Heading 2 (## ...)
    if (trimmed.startsWith("## ")) {
      checkPageOverflow(26);
      cursorY += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(trimmed.replace(/^##\s+/, ""), margin, cursorY);
      cursorY += 16;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      continue;
    }

    // Heading 3 (### ...)
    if (trimmed.startsWith("### ")) {
      checkPageOverflow(22);
      cursorY += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text(trimmed.replace(/^###\s+/, ""), margin, cursorY);
      cursorY += 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      continue;
    }

    // Bullet items (* or -)
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      const cleanBullet = trimmed.replace(/^(\*|-)\s+/, "").replace(/\*\*/g, "");
      const wrapped = doc.splitTextToSize(cleanBullet, maxLineWidth - 15);
      checkPageOverflow(wrapped.length * 14 + 4);

      // Draw bullet dot
      doc.setFillColor(79, 70, 229);
      doc.circle(margin + 5, cursorY - 3, 2, "F");

      doc.text(wrapped, margin + 15, cursorY);
      cursorY += wrapped.length * 14 + 4;
      continue;
    }

    // Standard paragraph line
    const cleanParagraph = trimmed.replace(/\*\*/g, "");
    const wrapped = doc.splitTextToSize(cleanParagraph, maxLineWidth);
    checkPageOverflow(wrapped.length * 14 + 6);
    doc.text(wrapped, margin, cursorY);
    cursorY += wrapped.length * 14 + 6;
  }

  const dateStr = meta.dateStr || new Date().toISOString().split("T")[0];
  doc.save(`${baseName}-${dateStr}.pdf`);
}

/**
 * Formatted Microsoft Word (.docx) Export using docx library
 */
export async function downloadAsDocx(summary: string, meta: ExportMeta, baseName = "briefai-summary") {
  const paragraphs: Paragraph[] = [];

  // Title
  paragraphs.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.LEFT,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: "BriefAI Document Summary",
          bold: true,
          size: 32,
          color: "4F46E5",
          font: "Calibri",
        }),
      ],
    })
  );

  // Metadata subtitle
  paragraphs.push(
    new Paragraph({
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: `Format: ${meta.type.toUpperCase()}  |  Reduction: ${meta.reductionPercentage}%  |  Words: ${meta.summaryWordCount}  |  Generated: ${new Date().toLocaleDateString()}`,
          color: "64748B",
          size: 18,
          italics: true,
          font: "Calibri",
        }),
      ],
    })
  );

  // Parse lines
  const lines = summary.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      paragraphs.push(new Paragraph({ spacing: { after: 100 } }));
      continue;
    }

    // Heading 2
    if (trimmed.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: trimmed.replace(/^##\s+/, ""),
              bold: true,
              size: 24,
              color: "1E293B",
              font: "Calibri",
            }),
          ],
        })
      );
      continue;
    }

    // Heading 3
    if (trimmed.startsWith("### ")) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
          children: [
            new TextRun({
              text: trimmed.replace(/^###\s+/, ""),
              bold: true,
              size: 22,
              color: "334155",
              font: "Calibri",
            }),
          ],
        })
      );
      continue;
    }

    // Bullet item
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      const bulletText = trimmed.replace(/^(\*|-)\s+/, "");
      paragraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 80 },
          children: parseMarkdownRuns(bulletText),
        })
      );
      continue;
    }

    // Numbered item
    if (/^\d+\.\s+/.test(trimmed)) {
      const numberText = trimmed.replace(/^\d+\.\s+/, "");
      paragraphs.push(
        new Paragraph({
          spacing: { after: 80 },
          children: parseMarkdownRuns(numberText),
        })
      );
      continue;
    }

    // Standard paragraph
    paragraphs.push(
      new Paragraph({
        spacing: { after: 120 },
        children: parseMarkdownRuns(trimmed),
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const dateStr = meta.dateStr || new Date().toISOString().split("T")[0];
  triggerBrowserDownload(blob, `${baseName}-${dateStr}.docx`);
}

/**
 * Splits markdown bold (**text**) into docx TextRuns
 */
function parseMarkdownRuns(text: string): TextRun[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return new TextRun({
        text: part.slice(2, -2),
        bold: true,
        size: 20,
        font: "Calibri",
      });
    }
    return new TextRun({
      text: part,
      size: 20,
      font: "Calibri",
    });
  });
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
