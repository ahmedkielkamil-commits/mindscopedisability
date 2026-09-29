import { Link } from "react-router";

const tools = [
  {
    id: "research",
    label: "Disability Research, Made Simple",
    title: "Research to PowerPoint",
    description:
      "Upload a disability research paper or paste a link. We'll convert it into a clear, plain language presentation you can share with teachers, doctors, or family members.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 12h6M9 16h4M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-6-5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 3v5h5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    to: "/parents/research",
  },
  {
    id: "facility",
    label: "Find Support Near You",
    title: "Facility Search",
    description:
      "Enter your location and your child's area of need. We'll surface nearby facilities from our database that specialize in the behavioral or learning support your child requires.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21c-4-4-7-7.5-7-11a7 7 0 0114 0c0 3.5-3 7-7 11z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="10"
          r="2.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
    to: "/parents/facilities",
    comingSoon: true,
  },
  {
    id: "iep",
    label: "Understand Your Child's IEP",
    title: "IEP Analyzer",
    description:
      "Upload your child's Individualized Education Program document. We'll explain what it means in plain terms, flag things you should ask about, and cite the federal guidelines that protect your rights.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12l2 2 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    to: "/parents/iep",
  },
];

export default function Parents() {
  const shareHref = `mailto:district@school.edu?subject=Please%20consider%20MindScope&body=Hi%2C%0A%0AI%20wanted%20to%20share%20MindScope%20with%20you%20%E2%80%94%20a%20platform%20that%20helps%20schools%20support%20students%20with%20behavioral%20and%20learning%20differences.%0A%0Ahttps%3A%2F%2Fmindscope.com%2Fdistricts%0A%0AThank%20you.`;

  return (
    <>
      {/* ── Hero — split layout ── */}
      <section
        className="relative flex"
        style={{
          minHeight: "calc(100vh - 5rem)",
          overflow: "hidden",
        }}
      >
        {/* Left: navy panel */}
        <div
          className="relative z-10 flex flex-col justify-center px-10 md:px-16 lg:px-20 py-12 w-full md:w-[52%] shrink-0"
          style={{ backgroundColor: "#14337B" }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm mb-10 transition-opacity hover:opacity-60 w-fit"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 3L5 8l5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to home
          </Link>

          <p
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: "#F3C153" }}
          >
            For Families
          </p>

          <h1
            className="font-display leading-tight mb-5"
            style={{
              fontSize: "clamp(2.2rem, 3.8vw, 3.4rem)",
              color: "#FFFFFF",
              maxWidth: 520,
            }}
          >
            Free tools for parents navigating the system alone.
          </h1>

          <p
            className="text-base md:text-lg mb-8 leading-relaxed"
            style={{
              color: "rgba(255,255,255,0.62)",
              maxWidth: 440,
            }}
          >
            MindScope gives families the resources to understand their child's
            needs, find local support, and navigate the system — no account
            needed.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#tools"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{
                backgroundColor: "#FFFFFF",
                color: "#14337B",
              }}
            >
              Explore the Tools
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 12l4-4-4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            <Link
              to="/districts"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#FFFFFF",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              For Districts
            </Link>
          </div>
        </div>

        {/* Right: photo card inset from top, navy behind */}
        <div
          className="hidden md:block flex-1 relative"
          style={{ backgroundColor: "#14337B" }}
        >
          <img
            src="https://images.unsplash.com/photo-1588072432836-e10032774350?w=1400&h=1000&fit=crop&auto=format"
            alt="Parent and child working together"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              borderRadius: "2.5rem 0 2.5rem 2.5rem",
              objectPosition: "center 40%",
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              borderRadius: "2.5rem 0 2.5rem 2.5rem",
              background:
                "linear-gradient(90deg, rgba(20,51,123,0.35) 0%, transparent 35%)",
            }}
          />
        </div>
      </section>

      {/* ── Why these tools exist ── */}
      <section style={{ backgroundColor: "var(--card)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-5 gap-12 items-center">
          <div className="md:col-span-2">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-4"
              style={{ color: "var(--muted-foreground)" }}
            >
              Why we built this
            </p>

            <h2
              className="font-display text-3xl md:text-4xl leading-snug"
              style={{ color: "var(--foreground)" }}
            >
              The information gap is real — and it shouldn't determine outcomes.
            </h2>
          </div>

          <div className="md:col-span-3">
            <p
              className="text-base md:text-lg leading-relaxed"
              style={{ color: "var(--muted-foreground)" }}
            >
              Parents who know how to read an IEP, find the right specialists,
              and advocate within the system get dramatically better results for
              their children. But that knowledge shouldn't require connections
              or resources most families don't have. These tools exist to level
              that playing field — so every parent can show up informed.
            </p>
          </div>
        </div>
      </section>

      {/* ── Tools ── */}
      <section id="tools" style={{ backgroundColor: "var(--background)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20">
          <div className="mb-12">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: "var(--muted-foreground)" }}
            >
              Free parent resources
            </p>

            <h2
              className="font-display text-3xl md:text-4xl leading-tight mb-3"
              style={{ color: "var(--foreground)" }}
            >
              Three tools, no account needed.
            </h2>

            <p
              className="text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              Built for families who are figuring this out on their own.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {tools.map((tool) => {
              const inner = (
                <>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: "var(--secondary)",
                      color: "comingSoon" in tool && tool.comingSoon ? "var(--muted-foreground)" : "var(--primary)",
                    }}
                  >
                    {tool.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs font-semibold tracking-widest uppercase mb-1"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {tool.label}
                    </p>
                    <h2 className="font-display text-2xl mb-1" style={{ color: "var(--foreground)" }}>
                      {tool.title}
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                      {tool.description}
                    </p>
                  </div>

                  <span
                    className="hidden sm:inline text-sm font-semibold shrink-0"
                    style={{ color: "comingSoon" in tool && tool.comingSoon ? "var(--muted-foreground)" : "var(--primary)" }}
                  >
                    {"comingSoon" in tool && tool.comingSoon ? "Coming soon" : "Open"}
                  </span>
                </>
              );

              if ("comingSoon" in tool && tool.comingSoon) {
                return (
                  <div
                    key={tool.id}
                    className="rounded-2xl flex items-center gap-6 p-6 md:p-7"
                    style={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      opacity: 0.7,
                      pointerEvents: "none",
                    }}
                    aria-disabled="true"
                  >
                    {inner}
                  </div>
                );
              }

              return (
                <Link
                  key={tool.id}
                  to={tool.to}
                  className="rounded-2xl flex items-center gap-6 p-6 md:p-7 transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Disclaimer + share CTA ── */}
      <section
        style={{
          backgroundColor: "var(--card)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 text-center">
          <p
            className="text-sm mb-10"
            style={{ color: "var(--muted-foreground)" }}
          >
            These tools are provided for informational purposes only. MindScope
            does not provide clinical diagnoses or legal advice.
          </p>

          <div
            className="pt-8"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <p
              className="font-display text-2xl md:text-3xl mb-3"
              style={{ color: "var(--foreground)" }}
            >
              Is your child's school using MindScope?
            </p>

            <p
              className="text-sm mb-8"
              style={{ color: "var(--muted-foreground)" }}
            >
              Ask your guidance counselor, or share this platform with your
              district directly.
            </p>

            <a
              href={shareHref}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 4l6 4 6-4M2 4h12v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Share with Your District
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer CTA bar ── */}
      <section style={{ backgroundColor: "#14337B" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p
              className="font-semibold text-base"
              style={{ color: "#FFFFFF" }}
            >
              Know a parent who could use these tools?
            </p>

            <p
              className="text-sm mt-1"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Share MindScope — it's completely free for families.
            </p>
          </div>

          <a
            href={shareHref}
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#14337B",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 4l6 4 6-4M2 4h12v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Share MindScope
          </a>
        </div>
      </section>
    </>
  );
}