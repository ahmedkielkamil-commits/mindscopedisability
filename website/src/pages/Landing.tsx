import { Link } from "react-router";

const stats = [
  { value: "1 in 5", label: "students has a mental health or learning disability" },
  { value: "500:1", label: "average counselor to student ratio in public schools" },
  { value: "67%", label: "of referrals go unactioned without structured follow-up" },
];

function HealthcareIllustration() {
  return (
    <svg
      viewBox="0 0 420 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ maxHeight: 400 }}
    >
      {/* Soft background circle */}
      <circle cx="210" cy="190" r="165" fill="#EEF2FF" />

      {/* Large heart shape */}
      <path
        d="M210 310 C210 310 90 230 90 155 C90 115 120 90 155 90 C178 90 198 103 210 122 C222 103 242 90 265 90 C300 90 330 115 330 155 C330 230 210 310 210 310Z"
        fill="#14337B"
        opacity="0.12"
      />
      <path
        d="M210 295 C210 295 100 222 100 155 C100 120 126 98 155 98 C176 98 195 110 210 128 C225 110 244 98 265 98 C294 98 320 120 320 155 C320 222 210 295 210 295Z"
        fill="#14337B"
        opacity="0.22"
      />
      <path
        d="M210 278 C210 278 112 212 112 155 C112 126 134 108 155 108 C175 108 193 120 210 137 C227 120 245 108 265 108 C286 108 308 126 308 155 C308 212 210 278 210 278Z"
        fill="#14337B"
      />

      {/* EKG / pulse line inside heart */}
      <polyline
        points="148,175 162,175 170,148 182,202 194,155 206,175 220,175 228,160 238,175 272,175"
        stroke="#F3C153"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Top-left: person/child icon */}
      <circle cx="95" cy="88" r="34" fill="#F3C153" opacity="0.18" />
      <circle cx="95" cy="78" r="12" fill="#14337B" opacity="0.8" />
      <path
        d="M75 112 C75 98 85 92 95 92 C105 92 115 98 115 112"
        stroke="#14337B"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {/* Top-right: school building icon */}
      <circle cx="325" cy="88" r="34" fill="#14337B" opacity="0.1" />
      <rect x="308" y="88" width="34" height="24" rx="2" fill="#14337B" opacity="0.7" />
      <rect x="316" y="96" width="7" height="8" rx="1" fill="white" opacity="0.9" />
      <rect x="327" y="96" width="7" height="8" rx="1" fill="white" opacity="0.9" />
      <path d="M304 88 L325 72 L346 88" fill="#14337B" opacity="0.85" />

      {/* Bottom-left: clipboard / care plan */}
      <circle cx="85" cy="300" r="30" fill="#F3C153" opacity="0.2" />
      <rect
        x="68"
        y="284"
        width="34"
        height="40"
        rx="3"
        fill="white"
        stroke="#14337B"
        strokeWidth="2"
        opacity="0.9"
      />
      <rect x="76" y="278" width="18" height="8" rx="2" fill="#14337B" opacity="0.7" />
      <line
        x1="74"
        y1="298"
        x2="96"
        y2="298"
        stroke="#14337B"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <line
        x1="74"
        y1="306"
        x2="96"
        y2="306"
        stroke="#14337B"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <line
        x1="74"
        y1="314"
        x2="88"
        y2="314"
        stroke="#F3C153"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Bottom-right: handshake / support */}
      <circle cx="335" cy="300" r="30" fill="#14337B" opacity="0.1" />
      <path
        d="M318 305 C318 305 322 298 330 298 L338 298 C346 298 350 305 350 305"
        stroke="#14337B"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M315 310 L322 303 L330 308 L338 303 L345 310"
        stroke="#14337B"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.7"
      />
      <circle cx="326" cy="292" r="6" fill="#14337B" opacity="0.7" />
      <circle cx="344" cy="292" r="6" fill="#14337B" opacity="0.7" />

      {/* Small plus / medical cross badge */}
      <circle cx="210" cy="62" r="18" fill="#F3C153" />
      <rect x="206" y="54" width="8" height="16" rx="2" fill="#14337B" />
      <rect x="202" y="58" width="16" height="8" rx="2" fill="#14337B" />

      {/* Connecting dashed lines */}
      <line
        x1="122"
        y1="100"
        x2="155"
        y2="130"
        stroke="#14337B"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity="0.25"
      />
      <line
        x1="298"
        y1="100"
        x2="265"
        y2="130"
        stroke="#14337B"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity="0.25"
      />
      <line
        x1="112"
        y1="278"
        x2="148"
        y2="250"
        stroke="#14337B"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity="0.25"
      />
      <line
        x1="308"
        y1="278"
        x2="272"
        y2="250"
        stroke="#14337B"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity="0.25"
      />
      <line
        x1="210"
        y1="80"
        x2="210"
        y2="108"
        stroke="#14337B"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity="0.25"
      />
    </svg>
  );
}

export default function Landing() {
  return (
    <>
      {/* ── Hero ── */}
      <section
        className="min-h-[calc(100vh-80px)] flex px-6 md:px-16 lg:px-20"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="w-full max-w-7xl mx-auto grid md:grid-cols-[1.1fr_0.9fr] gap-x-16 items-start py-8">

          {/* Left: copy */}
          <div className="max-w-[680px] flex flex-col min-h-[610px] pt-4">

            <div>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-5"
                style={{ color: "var(--muted-foreground)" }}
              >
                K–12 Behavioral Health Platform
              </p>

              <h1
                className="font-display mb-7 max-w-[640px] leading-[1.12]"
                style={{
                  fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
                  color: "var(--primary)",
                }}
              >
                <span style={{ color: "#E6B800" }}>
                  Every child deserves the right support.
                </span>{" "}
                <em
                  style={{
                    color: "var(--foreground)",
                    fontStyle: "italic",
                  }}
                >
                  Not just the ones whose parents know where to look.
                </em>
              </h1>
            </div>

            <p
              className="text-base md:text-lg mb-7 leading-relaxed"
              style={{
                color: "var(--muted-foreground)",
                maxWidth: 460,
              }}
            >
              MindScope connects students, families, and schools to the mental health resources they need.
            </p>

            <div>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-4"
                style={{ color: "var(--muted-foreground)" }}
              >
                Who are you?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    to: "/parents",
                    label: "Parent",
                    sub: "Free tools, no account needed",
                    bg: "var(--primary)",
                    fg: "var(--primary-foreground)",
                    subFg: "rgba(255,255,255,0.65)",
                    icon: (
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    ),
                  },
                  {
                    to: "/counselors",
                    label: "Counselor",
                    sub: "Demo workspace & care plans",
                    bg: "var(--accent)",
                    fg: "var(--accent-foreground)",
                    subFg: "rgba(20,51,123,0.65)",
                    icon: (
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    ),
                  },
                  {
                    to: "/districts",
                    label: "District",
                    sub: "Analytics & implementation",
                    bg: "var(--card)",
                    fg: "var(--foreground)",
                    subFg: "var(--muted-foreground)",
                    border: "1.5px solid var(--border)",
                    icon: (
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    ),
                  },
                ].map((a) => (
                  <Link
                    key={a.to}
                    to={a.to}
                    className="group flex flex-col items-start gap-2 px-5 py-4 rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                    style={{
                      backgroundColor: a.bg,
                      color: a.fg,
                      border: a.border ?? "none",
                    }}
                  >
                    <span className="opacity-80">{a.icon}</span>

                    <div>
                      <p className="font-semibold text-sm">I'm a {a.label}</p>
                      <p
                        className="text-xs mt-0.5 leading-snug"
                        style={{ color: a.subFg }}
                      >
                        {a.sub}
                      </p>
                    </div>

                    <span className="text-xs font-medium opacity-50 group-hover:opacity-90 transition-opacity">
                      Get started →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right: healthcare illustration */}
          <div className="hidden md:flex justify-center pt-20">
            <HealthcareIllustration />
          </div>
        </div>
      </section>

      {/* ── Why MindScope exists ── */}
      <section
        style={{
          borderTop: "1px solid #E2D9C0",
          backgroundColor: "var(--card)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-4"
              style={{ color: "var(--muted-foreground)" }}
            >
              Why we exist
            </p>

            <h2
              className="font-display text-3xl md:text-4xl leading-snug mb-6"
              style={{ color: "var(--foreground)" }}
            >
              Built from the inside of a broken system.
            </h2>
          </div>

          <div>
            <p
              className="text-base leading-relaxed"
              style={{ color: "var(--muted-foreground)" }}
            >
              Too many students with behavioral challenges and learning
              differences fall through the cracks — not because no one cares,
              but because the systems meant to help them are fragmented and
              overloaded. MindScope was built by someone who experienced this
              firsthand. We exist to give every guidance counselor the tools to
              act, and every family the clarity to follow through.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stat cards ── */}
      <section style={{ backgroundColor: "var(--background)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <div
                key={stat.value}
                className="rounded-xl p-8 text-center"
                style={{
                  backgroundColor: i === 1 ? "var(--primary)" : "var(--card)",
                  border: i === 1 ? "none" : "1px solid var(--border)",
                }}
              >
                <div
                  className="font-display text-4xl md:text-5xl mb-3"
                  style={{
                    color: i === 1 ? "var(--accent)" : "var(--primary)",
                  }}
                >
                  {stat.value}
                </div>

                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color:
                      i === 1
                        ? "rgba(255,255,255,0.75)"
                        : "var(--muted-foreground)",
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}