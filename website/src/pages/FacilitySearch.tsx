import { useState } from "react";
import { searchConditions, type CareNetworkStructured } from "../lib/careNetwork";
import {
  ErrorNote,
  FormCard,
  PrimaryButton,
  SectionLabel,
  Spinner,
  ToolPage,
} from "../components/ToolPage";

const needTypes = [
  "Dyslexia", "ADHD", "Autism", "Anxiety", "Depression",
  "Learning Disability", "Speech/Language", "Behavioral", "Other",
];

interface FacilityResult {
  structured: CareNetworkStructured | null;
  comparison: string | null;
  results: { title?: string; url?: string; content?: string }[];
}

function hostOf(url: string | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function FacilitySearch() {
  const [location, setLocation] = useState("");
  const [need, setNeed] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FacilityResult | null>(null);
  const [emptyNote, setEmptyNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!location.trim() || !need) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setEmptyNote(null);

    try {
      const data = await searchConditions([need], location.trim());
      const entry = data[need];
      if (!entry || Array.isArray(entry)) {
        setEmptyNote(`No search profile is configured for "${need}" yet.`);
        return;
      }
      setResult({
        structured: entry.structured,
        comparison: entry.comparison,
        results: entry.results,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const options = result?.structured?.options ?? [];

  return (
    <ToolPage
      current="/parents/facilities"
      eyebrow="Find support near you"
      title="Facility Search"
      description="Enter your location and your child's area of need. We'll surface nearby facilities that specialize in the behavioral or learning support your child requires."
    >
      <FormCard>
        <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--muted-foreground)" }}>
          Location
        </label>
        <input
          type="text"
          placeholder="City, state, or zip code"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-3 rounded-lg text-sm outline-none mb-5"
          style={{
            backgroundColor: "var(--secondary)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          }}
        />

        <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--muted-foreground)" }}>
          Need
        </label>
        <select
          value={need}
          onChange={(e) => setNeed(e.target.value)}
          className="w-full px-4 py-3 rounded-lg text-sm outline-none appearance-none mb-5"
          style={{
            backgroundColor: "var(--secondary)",
            border: "1px solid var(--border)",
            color: need ? "var(--foreground)" : "var(--muted-foreground)",
          }}
        >
          <option value="">Disability or need type…</option>
          {needTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <PrimaryButton onClick={handleSearch} disabled={loading || !location.trim() || !need}>
          {loading ? (
            <>
              <Spinner color="var(--primary-foreground)" />
              Searching…
            </>
          ) : (
            "Find Facilities"
          )}
        </PrimaryButton>

        {error && <ErrorNote message={error} />}
      </FormCard>

      {emptyNote && (
        <p className="mt-8 text-sm" style={{ color: "var(--muted-foreground)" }}>{emptyNote}</p>
      )}

      {result && (
        <div className="mt-10 space-y-8">
          <div>
            <SectionLabel>Overview</SectionLabel>
            <p
              className="text-sm leading-relaxed pl-4"
              style={{ borderLeft: "3px solid var(--accent)", color: "var(--foreground)" }}
            >
              {result.structured?.short_overview ?? result.comparison ?? "No overview was returned."}
            </p>
          </div>

          <div>
            <SectionLabel>Options</SectionLabel>
            <div className="space-y-3">
              {(options.length > 0 ? options : result.results.map((item, index) => ({
                result_index: index,
                display_name: item.title || "Untitled result",
                best_for: item.content ?? "",
                considerations: "",
              }))).map((option) => {
                const source = result.results[option.result_index];
                return (
                  <article
                    key={option.result_index}
                    className="rounded-xl p-5"
                    style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                  >
                    <h3 className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                      {source?.url ? (
                        <a href={source.url} target="_blank" rel="noreferrer" className="hover:underline">
                          {option.display_name}
                        </a>
                      ) : (
                        option.display_name
                      )}
                    </h3>
                    <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
                      {hostOf(source?.url)}
                    </p>
                    {option.best_for && (
                      <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--foreground)" }}>
                        {option.best_for}
                      </p>
                    )}
                    {option.considerations && (
                      <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                        {option.considerations}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          {result.structured?.key_differences && (
            <div>
              <SectionLabel>Key differences</SectionLabel>
              <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                {result.structured.key_differences}
              </p>
            </div>
          )}

          {result.structured?.general_recommendation && (
            <div>
              <SectionLabel>Recommendation</SectionLabel>
              <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                {result.structured.general_recommendation}
              </p>
            </div>
          )}
        </div>
      )}
    </ToolPage>
  );
}
