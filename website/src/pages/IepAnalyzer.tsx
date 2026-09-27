import { useState } from "react";
import { analyzeIep, type IepAnalysis, type IepRedFlag } from "../lib/iepAnalyzer";
import { extractTextFromFile } from "../lib/docProcessor";
import {
  ErrorNote,
  FormCard,
  PrimaryButton,
  SectionLabel,
  Spinner,
  ToolPage,
} from "../components/ToolPage";

function scoreTone(score: number): "high" | "mid" | "low" {
  if (score >= 7) return "high";
  if (score >= 4) return "mid";
  return "low";
}

const toneColor = {
  high: { text: "#157A3A", bar: "#1B8A45", badge: "#E5F6EC" },
  mid: { text: "#8A6408", bar: "#E0B12A", badge: "#FFF4D6" },
  low: { text: "#B42318", bar: "#D14343", badge: "#FDECEC" },
};

function FlagGroup({
  label,
  items,
}: {
  label: string;
  items: IepRedFlag[];
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--foreground)" }}>
          {label}
        </span>
        <span
          className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "var(--secondary)", color: "var(--muted-foreground)" }}
        >
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>
          None found.
        </p>
      ) : (
        items.map((item, index) => (
          <div
            key={`${item.section}-${index}`}
            className="px-4 py-3"
            style={{
              borderLeft: "3px solid var(--accent)",
              borderBottom: index === items.length - 1 ? undefined : "1px solid var(--border)",
            }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>
              {item.section}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
              {item.issue}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default function IepAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IepAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const text = await extractTextFromFile(file.name, new Uint8Array(await file.arrayBuffer()));
      if (!text.trim()) {
        throw new Error("No text could be extracted from the file.");
      }
      setResult(await analyzeIep(text));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const flags = result?.red_flags;

  return (
    <ToolPage
      current="/parents/iep"
      eyebrow="Understand your child's IEP"
      title="IEP Analyzer"
      description="Upload an IEP as a PDF, Word document, or plain text. You'll see a score for each section, what to ask about, and a plain-language summary of your rights."
    >
      <FormCard>
        <label
          className="flex flex-col items-center justify-center gap-3 w-full py-14 rounded-lg border-2 border-dashed cursor-pointer mb-5"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--muted-foreground)" }}
        >
          <span className="text-sm">{file ? file.name : "Upload your child's IEP"}</span>
          <span
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--primary)" }}
          >
            Choose file
          </span>
          <span className="text-xs">PDF, DOCX, or TXT</span>
          <input
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,text/plain"
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setResult(null);
            }}
          />
        </label>

        <PrimaryButton onClick={handleAnalyze} disabled={loading || !file}>
          {loading ? (
            <>
              <Spinner color="var(--primary-foreground)" />
              Analyzing…
            </>
          ) : (
            "Analyze IEP"
          )}
        </PrimaryButton>

        {error && <ErrorNote message={error} />}
      </FormCard>

      {result && (
        <div className="mt-10 space-y-10">
          <div>
            <SectionLabel>Your rights</SectionLabel>
            <p
              className="text-sm leading-relaxed pl-4"
              style={{ borderLeft: "3px solid var(--accent)", color: "var(--foreground)" }}
            >
              {result.summary}
            </p>
          </div>

          <div>
            <SectionLabel>What this IEP includes</SectionLabel>
            <div className="space-y-3">
              {(result.sections ?? []).map((section) => {
                const tone = scoreTone(section.score);
                return (
                  <article
                    key={section.name}
                    className="rounded-xl p-4"
                    style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                        {section.name}
                      </h3>
                      <span
                        className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: toneColor[tone].badge, color: toneColor[tone].text }}
                      >
                        {section.score}/10
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full mb-3 overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.max(0, Math.min(10, section.score)) * 10}%`, backgroundColor: toneColor[tone].bar }}
                      />
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                      {section.reasoning}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>

          <div>
            <SectionLabel>Things to ask about</SectionLabel>
            <div className="space-y-3">
              <FlagGroup label="Critical" items={flags?.critical ?? []} />
              <FlagGroup label="Caution" items={flags?.caution ?? []} />
              <FlagGroup label="Minor" items={flags?.minor ?? []} />
            </div>
          </div>
        </div>
      )}
    </ToolPage>
  );
}
