import { PDFParse } from "pdf-parse";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";
import { PDFDocument } from "pdf-lib";
import html2canvas from "html2canvas";
import { parseModelObject } from "./parseModelJson.js";

PDFParse.setWorker(pdfWorkerUrl);

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
