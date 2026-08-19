import io
import os as _os
import re
from pathlib import Path

import fitz  # PyMuPDF — PDF read/write
from playwright.sync_api import sync_playwright

# ---------------------------------------------------------------------------
# System prompt — tells the AI how to turn paper sections into HTML slides
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """
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
"""


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract all text from a PDF given its raw bytes using PyMuPDF."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = "\n".join(page.get_text() for page in doc)
    doc.close()
    return text


def extract_text_from_docx(docx_bytes: bytes) -> str:
    """Extract plain text from a .docx file (requires python-docx)."""
    try:
        from docx import Document
    except ImportError as e:
        raise RuntimeError(
            "Install python-docx to read .docx files: pip install python-docx"
        ) from e
    doc = Document(io.BytesIO(docx_bytes))
    parts = [p.text for p in doc.paragraphs]
    for table in doc.tables:
        for row in table.rows:
            parts.append(" | ".join(cell.text.strip() for cell in row.cells))
    return "\n".join(parts)


def extract_text_from_file(filename: str, data: bytes) -> str:
    """Extract plain text from PDF, DOCX, or TXT."""
    ext = Path(filename).suffix.lower()
    if ext == ".pdf":
        return extract_text_from_pdf(data)
    if ext == ".txt":
        return data.decode("utf-8", errors="replace")
    if ext == ".docx":
        return extract_text_from_docx(data)
    raise ValueError(f"Unsupported file type '{ext}'. Use .pdf, .docx, or .txt.")


def parse_sections(text: str) -> list:
    """
    Split extracted PDF text into medical paper sections using common headers.
    Returns [{"title": str, "body": str}, ...].
    Falls back to [{"title": "Overview", "body": text}] if no sections detected.
    """
    # Matches lines that are just a known section header (with optional numbering)
    header_pattern = re.compile(
        r"^\s*(?:\d+[\.\s]+)?"
        r"(abstract|introduction|background|"
        r"materials?\s+and\s+methods?|materials?\s+&\s+methods?|methods?|methodology|"
        r"results?|findings?|discussion|"
        r"conclusions?|summary|limitations?|acknowledgements?|acknowledgments?)"
        r"\s*[:\.]?\s*$",
        re.IGNORECASE | re.MULTILINE,
    )

    matches = list(header_pattern.finditer(text))
    if not matches:
        return [{"title": "Overview", "body": text.strip()}]

    sections = []
    for i, m in enumerate(matches):
        title = m.group(1).strip().title()
        body_start = m.end()
        body_end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[body_start:body_end].strip()
        if body:
            sections.append({"title": title, "body": body})

    return sections or [{"title": "Overview", "body": text.strip()}]


def render_slides_to_pdf(slide_htmls: list) -> io.BytesIO:
    """Render a list of HTML slide strings to a single merged PDF via Playwright."""

    # Use Playwright's own Chromium if installed, fall back to system Chrome
    _pw_chromium = _os.path.expanduser(
        "~/Library/Caches/ms-playwright/chromium_headless_shell-1208/"
        "chrome-headless-shell-mac-arm64/chrome-headless-shell"
    )
    _system_chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

    if _os.path.isfile(_pw_chromium):
        _exec = _pw_chromium
    elif _os.path.isfile(_system_chrome):
        _exec = _system_chrome
    else:
        raise RuntimeError("No usable Chrome/Chromium found. Run: playwright install chromium")

    raw_pdfs = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=_exec)
        for html in slide_htmls:
            page = browser.new_page(viewport={"width": 1280, "height": 720})
            page.emulate_media(media="screen")
            page.set_content(html, wait_until="networkidle")
            pdf_bytes = page.pdf(
                width="1280px",
                height="720px",
                print_background=True,
            )
            page.close()
            raw_pdfs.append(pdf_bytes)
        browser.close()

    # Merge all single-slide PDFs into one document
    merged = fitz.open()
    for raw in raw_pdfs:
        slide_doc = fitz.open(stream=raw, filetype="pdf")
        merged.insert_pdf(slide_doc)
        slide_doc.close()

    buf = io.BytesIO()
    merged.save(buf)
    merged.close()
    buf.seek(0)
    return buf
