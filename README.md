# BriefAI - Production-Ready AI Text Summarization Web Application
### Bachelor of Computer Applications (BCA) Capstone Project

BriefAI is a modern, responsive, and full-stack AI-powered text synthesis and summarization web application. Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and integrated with the **Google Gemini API** using the official `@google/genai` SDK.

---

## 🌟 Key Features

1. **Rich Source Document Input**:
   - High-capacity, responsive text area with live **word counter**, **character counter**, and **estimated reading time**.
   - **One-Click Sample Text Loader** with 4 curated academic, legal, business, and tech scenarios for instant testing and viva demonstrations.
   - Quick **Clear** and reset button.

2. **Summarization Format & Control Matrix**:
   - **Summary Types**:
     - *Paragraph*: Seamless narrative prose.
     - *Bullet Points*: Structured key takeaways with bold concept headings.
     - *Executive Brief*: 3-part structured briefing (*Executive Overview*, *Key Findings*, *Strategic Takeaway*).
     - *Key Takeaways*: Numbered core insights + bottom line.
   - **Target Length**: Short (~25%), Medium (~45%), and Detailed (~65%).
   - **Perspective & Tone**: Neutral, Formal, Simplified (ELI5), and Academic.

3. **File Upload Support**:
   - Direct upload and drag-and-drop support for `.txt` and `.md` files up to 2 MB with client-side FileReader parsing.

4. **Analytical Output & Reduction Metrics**:
   - Real-time **Word Reduction Percentage** badge (e.g. `Reduced by 68%`).
   - Time saved comparison metric.
   - **Copy to Clipboard** with animated checkmark feedback.
   - **Download as .txt** file with automated naming.
   - **Text-to-Speech (TTS)** voice playback powered by the Web Speech API.

5. **History & Persistence**:
   - Slide-out **History Drawer** backed by `localStorage` to review, reload, or manage past generated summaries without re-running API calls.

6. **Modern UI/UX**:
   - Dark Mode and Light Mode support with theme flash prevention.
   - Dynamic multi-stage shimmer skeleton loader with processing indicator.
   - Accessible keyboard shortcut: <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to trigger summarization.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | Next.js 14 (App Router) | Server-side rendering, client components, routing |
| **Language** | TypeScript | Strong typing, interfaces, and compile-time safety |
| **Styling & Design** | Tailwind CSS | Utility-first styling, responsive layout, dark mode |
| **Icons** | Lucide React | Clean, modern SVG icons |
| **Backend / API** | Next.js Route Handlers | Serverless API endpoints (`/api/summarize`, `/api/health`) |
| **AI SDK** | `@google/genai` | Official Google Gen AI SDK for Node.js/TypeScript |
| **AI Model** | Google Gemini 2.5 Flash / 1.5 Flash | High-speed, high-fidelity context distillation |

---

## 📁 Project Folder Structure

```
ai-text-summarizer/
├── app/
│   ├── api/
│   │   ├── health/
│   │   │   └── route.ts             # Health check endpoint for API readiness
│   │   └── summarize/
│   │       └── route.ts             # POST handler for Gemini summarization
│   ├── globals.css                  # Tailwind directives and custom scrollbars
│   ├── layout.tsx                   # Root HTML layout and theme script
│   └── page.tsx                     # Main interactive dashboard UI
├── components/
│   ├── FileUpload.tsx               # Drag-and-drop .txt file reader
│   ├── HistoryDrawer.tsx            # Slide-out drawer for stored summaries
│   ├── Navbar.tsx                   # Navigation header with dark/light mode toggle
│   ├── SkeletonLoader.tsx           # Animated shimmer loader during AI synthesis
│   ├── StatsCard.tsx                # Metric badges: reduction %, word counts, time saved
│   ├── SummarizeControls.tsx        # Format, length, and tone configuration buttons
│   ├── SummaryOutput.tsx            # Formatted markdown view, copy, download, TTS
│   └── TextInputArea.tsx            # Textarea, word counts, and sample loader
├── lib/
│   ├── gemini.ts                    # Google Gen AI SDK client and prompt engineering
│   ├── sample-texts.ts              # Pre-loaded academic, legal, & business sample texts
│   ├── types.ts                     # TypeScript data contracts and interfaces
│   └── utils.ts                     # Word counter, reading time, and formatting helpers
├── .env.example                     # Sample environment variable template
├── .env.local                       # Private API keys (gitignored)
├── .gitignore                       # Git ignore rules
├── next.config.mjs                  # Next.js build configuration
├── package.json                     # NPM dependencies and scripts
├── postcss.config.mjs               # PostCSS configuration for Tailwind
├── README.md                        # Capstone project documentation
└── tsconfig.json                    # TypeScript compiler configuration
```

---

## 🚀 Getting Started & Local Setup

### 1. Prerequisites
- **Node.js**: v18.17.0 or higher (v20+ recommended)
- **NPM** or **Yarn**

### 2. Install Dependencies
Open your terminal in the project directory and run:
```bash
npm install
```

### 3. Configure Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and click **Get API key**.
2. Create a free API key.
3. Open `.env.local` in the project root:
   ```env
   GEMINI_API_KEY=AIzaSy...YourKeyHere...
   ```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🔄 Data Flow Diagram

```
[User Input: Text / .txt File] 
           │
           ▼
[Client UI: Select Type & Length] 
           │
           ▼
[POST /api/summarize] ─── (Validates payload & word counts)
           │
           ▼
[lib/gemini.ts: Prompt Engineering]
           │
           ▼
[Google Gemini API (@google/genai)]
           │
           ▼
[Analytical Processing: % Reduction, WPM calculation]
           │
           ▼
[Client Response: Formatted Markdown, TTS, Export .txt]
```

---

## 🎯 BCA Viva / Project Defense Questions

1. **Why use `@google/genai` over direct fetch calls?**
   - The official SDK handles tokenization, connection pooling, model specification, authentication headers, error classification, and future streaming capabilities cleanly with TypeScript type safety.

2. **How does the system prevent AI hallucinations during summarization?**
   - The prompt uses strict system instructions with a low temperature (`0.2`). This constrains Gemini to focus on extractive and synthesizing tasks based strictly on the provided context without creative divergence.

3. **How is Dark Mode handled without hydration mismatch?**
   - An inline execution script in `<head>` checks `localStorage` and system media queries prior to page paint, preventing hydration flicker.

4. **How are analytical metrics computed?**
   - The application calculates regex-based word counts on both original and summarized texts to compute reduction percentage:
     $$\text{Reduction \%} = \frac{\text{Original Words} - \text{Summary Words}}{\text{Original Words}} \times 100$$
   - Reading time uses the international standard of 200 words per minute.

---

## 📄 License
This project was developed for educational purposes as a BCA Capstone Project.
