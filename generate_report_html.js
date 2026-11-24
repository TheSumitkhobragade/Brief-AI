const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, 'PROJECT_REPORT_BRIEFAI_RTMNU.md');
const htmlPath = path.join(__dirname, 'PROJECT_REPORT_BRIEFAI_RTMNU.html');

if (!fs.existsSync(mdPath)) {
  console.error('Markdown file not found:', mdPath);
  process.exit(1);
}

const rawMd = fs.readFileSync(mdPath, 'utf8');

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseMarkdown(md) {
  const lines = md.split('\n');
  const out = [];
  let inCode = false;
  let codeLang = '';
  let codeBuffer = [];
  let inTable = false;
  let tableHeader = true;
  let inList = false;
  let listType = 'ul';

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Code block check
    if (line.trim().startsWith('```')) {
      if (!inCode) {
        if (inList) { out.push(`</${listType}>`); inList = false; }
        if (inTable) { out.push('</tbody></table>'); inTable = false; }
        inCode = true;
        codeLang = line.trim().slice(3).trim();
        codeBuffer = [];
      } else {
        inCode = false;
        out.push(`<pre><code class="language-${escapeHtml(codeLang)}">${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
        codeBuffer = [];
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    // Page break delimiter
    if (line.trim() === '---') {
      if (inList) { out.push(`</${listType}>`); inList = false; }
      if (inTable) { out.push('</tbody></table>'); inTable = false; }
      out.push('<div class="page-break"></div>');
      continue;
    }

    // Raw HTML passthrough for divs and comments
    if (line.trim().startsWith('<div') || line.trim().startsWith('</div>') || line.trim().startsWith('<!--')) {
      if (inList) { out.push(`</${listType}>`); inList = false; }
      if (inTable) { out.push('</tbody></table>'); inTable = false; }
      out.push(line);
      continue;
    }

    // Table row check
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (inList) { out.push(`</${listType}>`); inList = false; }
      const cells = line.trim().split('|').slice(1, -1).map(c => c.trim());
      // Check if it's separator row
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        // separator row, skip
        continue;
      }
      if (!inTable) {
        inTable = true;
        tableHeader = true;
        out.push('<table>');
        out.push('<thead><tr>');
        for (const c of cells) {
          out.push(`<th>${formatInline(c)}</th>`);
        }
        out.push('</tr></thead><tbody>');
        tableHeader = false;
        continue;
      } else {
        out.push('<tr>');
        for (const c of cells) {
          out.push(`<td>${formatInline(c)}</td>`);
        }
        out.push('</tr>');
        continue;
      }
    } else if (inTable) {
      out.push('</tbody></table>');
      inTable = false;
    }

    // List item check
    const ulMatch = line.match(/^(\s*)[*\-]\s+(.*)$/);
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);

    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) out.push(`</${listType}>`);
        out.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      out.push(`<li>${formatInline(ulMatch[2])}</li>`);
      continue;
    } else if (olMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) out.push(`</${listType}>`);
        out.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      out.push(`<li>${formatInline(olMatch[2])}</li>`);
      continue;
    } else if (inList && line.trim() === '') {
      out.push(`</${listType}>`);
      inList = false;
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      if (inList) { out.push(`</${listType}>`); inList = false; }
      out.push(`<h1>${formatInline(line.slice(2).trim())}</h1>`);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { out.push(`</${listType}>`); inList = false; }
      out.push(`<h2>${formatInline(line.slice(3).trim())}</h2>`);
      continue;
    }
    if (line.startsWith('### ')) {
      if (inList) { out.push(`</${listType}>`); inList = false; }
      out.push(`<h3>${formatInline(line.slice(4).trim())}</h3>`);
      continue;
    }
    if (line.startsWith('#### ')) {
      if (inList) { out.push(`</${listType}>`); inList = false; }
      out.push(`<h4>${formatInline(line.slice(5).trim())}</h4>`);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      if (inList) { out.push(`</${listType}>`); inList = false; }
      out.push(`<blockquote>${formatInline(line.slice(2).trim())}</blockquote>`);
      continue;
    }

    // Empty lines or single backslashes
    if (line.trim() === '\\' || line.trim() === '') {
      if (inList) { out.push(`</${listType}>`); inList = false; }
      if (line.trim() === '\\') {
        out.push('<br/>');
      }
      continue;
    }

    // Normal paragraph
    out.push(`<p>${formatInline(line.trim())}</p>`);
  }

  if (inList) out.push(`</${listType}>`);
  if (inTable) out.push('</tbody></table>');

  return out.join('\n');
}

function formatInline(text) {
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
}

const htmlBody = parseMarkdown(rawMd);

const finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BriefAI - Capstone Project Report | RTMNU BCA Semester-V</title>
  <style>
    @page {
      size: A4 portrait;
      margin-top: 1.0in;
      margin-bottom: 1.0in;
      margin-left: 1.5in; /* 1.5 inch for left-edge binding */
      margin-right: 1.0in;
    }
    
    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #111;
      text-align: justify;
      text-justify: inter-word;
      background-color: #f7f9fa;
      margin: 0;
      padding: 0;
    }

    .document-sheet {
      background-color: #ffffff;
      width: 210mm;
      min-height: 297mm;
      margin: 20px auto;
      padding: 1.0in 1.0in 1.0in 1.5in;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    @media print {
      body {
        background-color: #ffffff;
      }
      .document-sheet {
        width: 100%;
        margin: 0;
        padding: 0;
        box-shadow: none;
      }
      .page-break {
        page-break-after: always;
        break-after: page;
        height: 0;
        margin: 0;
        border: none;
      }
      .no-print {
        display: none !important;
      }
    }

    .page-break {
      page-break-after: always;
      break-after: page;
      margin: 40px 0;
      border-top: 2px dashed #ccc;
    }

    h1 {
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 24pt;
      margin-bottom: 12pt;
      page-break-after: avoid;
    }

    h2 {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 18pt;
      margin-bottom: 8pt;
      page-break-after: avoid;
    }

    h3 {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 14pt;
      margin-bottom: 6pt;
      page-break-after: avoid;
    }

    h4 {
      font-size: 12pt;
      font-weight: bold;
      font-style: italic;
      margin-top: 12pt;
      margin-bottom: 4pt;
      page-break-after: avoid;
    }

    p {
      margin-top: 0;
      margin-bottom: 10pt;
      text-indent: 0;
    }

    ul, ol {
      margin-top: 0;
      margin-bottom: 10pt;
      padding-left: 24pt;
    }

    li {
      margin-bottom: 4pt;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14pt 0;
      font-size: 11pt;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #333333;
      padding: 6pt 8pt;
      text-align: left;
      vertical-align: top;
    }

    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }

    blockquote {
      margin: 12pt 20pt;
      padding: 8pt 14pt;
      border-left: 4px solid #2563eb;
      background-color: #f8fafc;
      font-style: italic;
    }

    pre {
      background-color: #f4f5f7;
      border: 1px solid #dcdfe4;
      padding: 10pt;
      font-family: 'Courier New', Courier, monospace;
      font-size: 9.5pt;
      line-height: 1.35;
      overflow-x: auto;
      page-break-inside: avoid;
      white-space: pre-wrap;
      word-break: break-all;
    }

    code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 10pt;
      background-color: #f1f2f4;
      padding: 1px 4px;
      border-radius: 3px;
    }

    a {
      color: #1d4ed8;
      text-decoration: underline;
    }

    .print-bar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #1e293b;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      font-family: system-ui, -apple-system, sans-serif;
    }

    .print-btn {
      background-color: #2563eb;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .print-btn:hover {
      background-color: #1d4ed8;
    }
  </style>
</head>
<body>

  <div class="print-bar no-print">
    <div>
      <strong>BriefAI - BCA Capstone Project Report (RTMNU Nagpur)</strong>
      <span style="opacity: 0.75; margin-left: 12px; font-size: 13px;">Format: A4 | Times New Roman 12pt | Line spacing 1.5 | Binding Margin 1.5"</span>
    </div>
    <div>
      <button class="print-btn" onclick="window.print()">
        🖨️ Print / Save as PDF (Ctrl + P)
      </button>
    </div>
  </div>

  <div class="document-sheet">
    ${htmlBody}
  </div>

</body>
</html>
`;

fs.writeFileSync(htmlPath, finalHtml, 'utf8');
console.log('Successfully generated HTML report at:', htmlPath);
