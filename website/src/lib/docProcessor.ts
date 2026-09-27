import { PDFParse } from "pdf-parse";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";
import { PDFDocument } from "pdf-lib";
import html2canvas from "html2canvas";
import { parseModelObject } from "./parseModelJson.js";

PDFParse.setWorker(pdfWorkerUrl);

// ---------------------------------------------------------------------------
// System prompt — tells the AI how to turn paper sections into HTML slides
// ---------------------------------------------------------------------------
export const SYSTEM_PROMPT = `
You are a research presentation designer that converts the full raw text of a research paper or document into a set of beautiful, self-contained HTML presentation slides.

You will receive the raw extracted text of a research paper or document (NOT pre-parsed sections).

Your job is to:
- Read and understand the entire document
- Identify the most important concepts, findings, and structure
- Organize the content into a logical presentation
- Generate a minimum of 6 slides (you may create more if needed for clarity)

--------------------------------

OUTPUT FORMAT (STRICT)

You must return ONLY a valid JSON object.

The JSON must follow this exact structure:
{
  "slides": [
    {
      "title": "Overview of Asthma",
      "html": "<html string>"
    },
    {
      "title": "Study Methods",
      "html": "<html string>"
    },
    {
      "title": "Key Findings",
      "html": "<html string>"
    }
  ]
}

- You MUST generate at least 6 slides
- Each slide object must have exactly two keys: "title" and "html"
- Do NOT include any text before or after the JSON
- Do NOT use markdown or code fences
- Ensure all HTML strings are valid JSON strings (escape quotes properly)

--------------------------------

CONTENT RULES

- You are responsible for identifying logical sections from the raw text (e.g., background, methods, results, conclusions)
- DO NOT assume structured input — infer structure yourself
- Each slide should focus on ONE clear idea
- Never paste raw paragraphs — always rewrite content into:
  - concise bullet points
  - short headline statements
  - structured summaries

- Recommended slide flow:
  1. Title / Overview
  2. Background / Context
  3. Problem or Objective
  4. Methods / Approach
  5. Results / Key Findings
  6. Interpretation / Insights
  7. Conclusion / Takeaways

- If the paper includes:
  - numbers, percentages, or p-values → include them exactly
  - results data → present using visual layouts (tables, stat boxes, or simple SVG charts)
  - methodology → present as step-by-step process

- Preserve accuracy at all times — do not introduce new claims or distort findings

--------------------------------

IMAGE RULES

- Default to clean, data-focused slides (no unnecessary images)
- Only include images if the content clearly benefits from it (e.g., diagrams, process visualizations)
- Use:
  https://loremflickr.com/1280/720/{topic_keyword}
- Always overlay a dark gradient if using background images

--------------------------------

DESIGN RULES

- Professional academic aesthetic:
  - dark navy or slate background
  - white text
  - one accent color (teal #0ea5e9 or green #10b981)

- Use Google Fonts:
  - Inter or DM Sans (body)
  - DM Serif Display (headlines)

- Each slide MUST be:
  - 1280x720px (16:9)
  - fully self-contained HTML

- All CSS must be:
  - inline OR inside a <style> tag
  - no external stylesheets

- Vary layouts across slides:
  - Title → centered hero layout
  - Methods → numbered steps or flow
  - Results → stat boxes or charts
  - Conclusion → large pullquote

- Use strong visual hierarchy:
  - most important insight = largest element

--------------------------------

FINAL VALIDATION

Before responding:
- Ensure at least 6 slides are generated
- Ensure output is valid JSON
- Ensure all HTML strings are properly escaped
- Ensure no extra text outside JSON

Return ONLY the JSON object.
`;

export interface Section {
  title: string;
  body: string;
}

export interface Slide {
  title: string;
  html: string;
}

function fileExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot).toLowerCase();
}

/** Extract all text from a PDF given its raw bytes. */
export async function extractTextFromPdf(pdfBytes: Uint8Array): Promise<string> {
  const parser = new PDFParse({ data: pdfBytes });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

/** Extract plain text from a .docx file. */
export async function extractTextFromDocx(docxBytes: ArrayBuffer): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer: docxBytes });
  return result.value;
}

/** Extract plain text from PDF, DOCX, or TXT. */
export async function extractTextFromFile(filename: string, data: Uint8Array): Promise<string> {
  const ext = fileExtension(filename);
  if (ext === ".pdf") {
    return extractTextFromPdf(data);
  }
  if (ext === ".txt") {
    return new TextDecoder().decode(data);
  }
  if (ext === ".docx") {
    return extractTextFromDocx(data.buffer as ArrayBuffer);
  }
  throw new Error(`Unsupported file type '${ext}'. Use .pdf, .docx, or .txt.`);
}

/** Fetch a web page and reduce it to readable text. */
export async function extractTextFromUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; MindScope/1.0)" },
  });
  if (!response.ok) {
    throw new Error(`Could not fetch that URL (HTTP ${response.status}).`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/pdf")) {
    return extractTextFromPdf(new Uint8Array(await response.arrayBuffer()));
  }

  const html = await response.text();
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<\/(p|div|h[1-6]|li|tr|section|article)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

/** Python's ``str.title()`` — capitalise each alphabetic run, lowercase the rest. */
function titleCase(value: string): string {
  return value.replace(
    /[A-Za-z]+/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );
}

/**
 * Split extracted PDF text into medical paper sections using common headers.
 * Falls back to a single "Overview" section if no sections are detected.
 */
export function parseSections(text: string): Section[] {
  // Matches lines that are just a known section header (with optional numbering)
  const headerPattern = new RegExp(
    "^\\s*(?:\\d+[\\.\\s]+)?" +
      "(abstract|introduction|background|" +
      "materials?\\s+and\\s+methods?|materials?\\s+&\\s+methods?|methods?|methodology|" +
      "results?|findings?|discussion|" +
      "conclusions?|summary|limitations?|acknowledgements?|acknowledgments?)" +
      "\\s*[:\\.]?\\s*$",
    "gim",
  );

  const matches = [...text.matchAll(headerPattern)];
  if (matches.length === 0) {
    return [{ title: "Overview", body: text.trim() }];
  }

  const sections: Section[] = [];
  matches.forEach((match, i) => {
    const title = titleCase(match[1].trim());
    const bodyStart = (match.index ?? 0) + match[0].length;
    const next = matches[i + 1];
    const bodyEnd = next ? next.index ?? text.length : text.length;
    const body = text.slice(bodyStart, bodyEnd).trim();
    if (body) {
      sections.push({ title, body });
    }
  });

  return sections.length > 0 ? sections : [{ title: "Overview", body: text.trim() }];
}

/** Render HTML slide strings to one PDF in the browser. */
export async function renderSlidesToPdf(slideHtmls: string[]): Promise<Blob> {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;left:-10000px;top:0;width:1280px;height:720px;border:0";
  document.body.appendChild(iframe);

  const merged = await PDFDocument.create();
  try {
    for (const html of slideHtmls) {
      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
        iframe.srcdoc = html;
      });
      const body = iframe.contentDocument?.body;
      if (!body) {
        throw new Error("A slide failed to render.");
      }
      const canvas = await html2canvas(body, {
        width: 1280,
        height: 720,
        windowWidth: 1280,
        windowHeight: 720,
        useCORS: true,
        backgroundColor: "#0f172a",
      });
      const pngBytes = await fetch(canvas.toDataURL("image/png")).then((response) =>
        response.arrayBuffer(),
      );
      const image = await merged.embedPng(pngBytes);
      // 1280x720 CSS pixels at 96dpi is 960x540 points.
      const page = merged.addPage([960, 540]);
      page.drawImage(image, { x: 0, y: 0, width: 960, height: 540 });
    }
  } finally {
    iframe.remove();
  }

  const bytes = await merged.save();
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}

/** Parse the slide JSON the agent returns, tolerating stray markdown fences. */
export function parseSlidesOutput(raw: string): Slide[] {
  const parsed = parseModelObject(raw) as { slides?: Slide[] };
  if (!parsed.slides || !Array.isArray(parsed.slides)) {
    throw new Error("AI response did not contain a 'slides' array.");
  }
  return parsed.slides;
}
