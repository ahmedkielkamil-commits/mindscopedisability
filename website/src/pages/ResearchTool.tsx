import { useState } from "react";
import { callAI } from "../lib/aiClient";
import {
  SYSTEM_PROMPT,
  extractTextFromFile,
  extractTextFromUrl,
  parseSlidesOutput,
  renderSlidesToPdf,
} from "../lib/docProcessor";
import { ErrorNote, FormCard, PrimaryButton, Spinner, ToolPage } from "../components/ToolPage";

export default function ResearchTool() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!file && !url.trim()) return;
    setLoading(true);
    setError(null);
    setPdfUrl(null);

    try {
      const text = file
        ? await extractTextFromFile(file.name, new Uint8Array(await file.arrayBuffer()))
        : await extractTextFromUrl(url.trim());
      if (!text.trim()) {
        throw new Error("No text could be extracted from that source.");
      }

      const raw = await callAI(SYSTEM_PROMPT, text.slice(0, 50_000));
      const slides = parseSlidesOutput(raw);
      if (slides.length === 0) {
        throw new Error("The model returned no slides.");
      }
      const blob = await renderSlidesToPdf(slides.map((slide) => slide.html));
      const objectUrl = URL.createObjectURL(blob);
      setPdfUrl(objectUrl);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "presentation.pdf";
      link.click();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPage
      current="/parents/research"
      eyebrow="Disability research, made simple"
      title="Research to PowerPoint"
      description="Upload a disability research paper or paste a link. We'll convert it into a clear, plain language presentation you can share with teachers, doctors, or family members."
    >
      <FormCard>
        <label
          className="flex flex-col items-center justify-center gap-3 w-full py-14 rounded-lg border-2 border-dashed cursor-pointer"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--muted-foreground)" }}
        >
          <span className="text-sm">{file ? file.name : "Choose a PDF, or drop it here"}</span>
          <span
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--primary)" }}
          >
            Choose file
          </span>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
        </div>

        <input
          type="url"
          placeholder="Paste a URL to a research paper"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-3 rounded-lg text-sm outline-none mb-5"
          style={{
            backgroundColor: "var(--secondary)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          }}
        />

        <PrimaryButton onClick={handleConvert} disabled={loading || (!file && !url.trim())}>
          {loading ? (
            <>
              <Spinner color="var(--primary-foreground)" />
              Converting…
            </>
          ) : (
            "Convert to PowerPoint"
          )}
        </PrimaryButton>

        {error && <ErrorNote message={error} />}
      </FormCard>

      {pdfUrl && (
        <div className="mt-8">
          <a
            href={pdfUrl}
            download="presentation.pdf"
            className="inline-flex px-6 py-3 rounded-lg font-semibold text-sm"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}
          >
            Download presentation
          </a>
        </div>
      )}
    </ToolPage>
  );
}
