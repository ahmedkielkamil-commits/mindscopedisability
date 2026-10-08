import { useState } from "react";
import { Link } from "react-router";
import { MailSendChoice } from "../components/MailSendChoice";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Legend,
} from "recharts";

const threeCs = [
  {
    title: "Credibility",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 4.8L20 8l-4 3.9.9 5.4L12 15l-4.9 2.3.9-5.4L4 8l5.6-1.2L12 2z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    description: "Every recommendation traces back to NIMH, SAMHSA, and AACAP clinical guidelines.",
  },
  {
    title: "Communication",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
    description: "Parents and counselors stay connected through in-app messaging and appointment scheduling.",
  },
  {
    title: "Continuity",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.65-4.65L20 9M4 15l1.35 4.65A9 9 0 0020 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
    description: "A staged roadmap keeps every student's progress visible and accountable over time.",
  },
];

const serviceDesertData = [
  { zip: "62701", score: 82, label: "High Need" },
  { zip: "62702", score: 61, label: "Moderate" },
  { zip: "62703", score: 44, label: "Moderate" },
  { zip: "62704", score: 28, label: "Low Need" },
  { zip: "62705", score: 75, label: "High Need" },
  { zip: "62706", score: 55, label: "Moderate" },
];

const funnelStages = [
  { label: "Questionnaires submitted", count: 86 },
  { label: "Care plans generated", count: 64 },
  { label: "Referrals contacted", count: 41 },
  { label: "Appointments scheduled", count: 27 },
];

const funnelFills = ["#14337B", "#2C5599", "#5B84C4", "#9BB6E0"];

function EngagementFunnel() {
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? selected;
  const top = funnelStages[0].count;
  const width = 280;
  const height = 220;
  const gap = 8;
  const band = (height - gap * (funnelStages.length - 1)) / funnelStages.length;
  const maxWidth = 250;
  const minWidth = 78;

  const widthFor = (count: number) => minWidth + (maxWidth - minWidth) * (count / top);

  const stage = funnelStages[active];
  const previous = funnelStages[active - 1];
  const kept = Math.round((stage.count / top) * 100);
  const dropped = previous ? Math.round(((previous.count - stage.count) / previous.count) * 100) : 0;

  return (
    <div>
      <div className="flex items-center gap-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-36 h-48 shrink-0" role="img" aria-label="Referral through-put funnel">
          {funnelStages.map((item, index) => {
            const next = funnelStages[index + 1];
            const topWidth = widthFor(item.count);
            const bottomWidth = next ? widthFor(next.count) : topWidth * 0.62;
            const y = index * (band + gap);
            const center = width / 2;
            const points = [
              `${center - topWidth / 2},${y}`,
              `${center + topWidth / 2},${y}`,
              `${center + bottomWidth / 2},${y + band}`,
              `${center - bottomWidth / 2},${y + band}`,
            ].join(" ");
            const isActive = index === active;
            return (
              <polygon
                key={item.label}
                points={points}
                fill={funnelFills[index]}
                opacity={isActive ? 1 : 0.45}
                stroke={isActive ? "#F3C153" : "transparent"}
                strokeWidth={isActive ? 4 : 0}
                className="cursor-pointer"
                style={{ transition: "opacity 150ms ease" }}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(index)}
              />
            );
          })}
        </svg>

        <div className="flex-1 flex flex-col justify-between h-48">
          {funnelStages.map((item, index) => {
            const isActive = index === active;
            return (
              <button
                key={item.label}
                type="button"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(index)}
                className="text-left rounded-lg px-3 py-2"
                style={{
                  backgroundColor: isActive ? "var(--secondary)" : "transparent",
                  border: isActive ? "1px solid var(--border)" : "1px solid transparent",
                }}
              >
                <span className="block text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                  {item.count}
                </span>
                <span className="block text-[11px] leading-snug" style={{ color: "var(--muted-foreground)" }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs leading-relaxed mt-4" style={{ color: "var(--muted-foreground)" }}>
        <span className="font-semibold" style={{ color: "var(--foreground)" }}>{stage.count} {stage.label.toLowerCase()}.</span>
        {" "}
        {previous
          ? `${kept}% of questionnaires are still here, and ${dropped}% dropped off from the previous stage.`
          : "This is everyone who started a questionnaire."}
      </p>
    </div>
  );
}

const scatterData = [
  { caseload: 320, submissions: 28 },
  { caseload: 410, submissions: 19 },
  { caseload: 480, submissions: 12 },
  { caseload: 290, submissions: 35 },
  { caseload: 520, submissions: 8 },
  { caseload: 350, submissions: 24 },
  { caseload: 440, submissions: 16 },
];

const therapyData = [
  { type: "Behavioral", high: 38, moderate: 27, low: 15 },
  { type: "Educational", high: 52, moderate: 31, low: 18 },
  { type: "Family Support", high: 24, moderate: 19, low: 11 },
  { type: "Speech/Lang", high: 18, moderate: 14, low: 9 },
];

const desertColors: Record<string, string> = {
  "High Need": "#DC2626",
  "Moderate": "#D97706",
  "Low Need": "#16A34A",
};

const implementationIncludes = [
  "Counselor workspace setup",
  "Student and parent onboarding",
  "Full analytics dashboard",
  "SAMHSA-sourced facility database",
  "Training and support",
  "HIPAA-compliant data handling",
];

const schoolSizes = ["1–5", "6–15", "16–50", "50+"];

export default function Districts() {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    district: "", state: "", schools: "", challenge: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [chooseMail, setChooseMail] = useState(false);

  const handleSubmit = () => {
    if (!formData.email || !formData.firstName) return;
    setChooseMail(true);
  };

  const districtFields = {
    Name: `${formData.firstName} ${formData.lastName}`.trim(),
    Email: formData.email,
    Phone: formData.phone,
    District: formData.district,
    State: formData.state,
    Schools: formData.schools,
    Challenge: formData.challenge,
  };

  return (
    <>
      {/* ── Hero — condensed split layout ── */}
      <section className="relative flex" style={{ minHeight: "calc(100vh - 5rem)", overflow: "hidden" }}>

        {/* Left: navy panel */}
        <div
          className="relative z-10 flex flex-col justify-center px-10 md:px-16 lg:px-20 py-12 w-full md:w-[52%] shrink-0"
          style={{ backgroundColor: "#14337B" }}
        >
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm mb-10 transition-opacity hover:opacity-60 w-fit" style={{ color: "rgba(255,255,255,0.5)" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Back to home
          </Link>

          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#F3C153" }}>
            For District Administrators
          </p>

          <h1
            className="font-display leading-tight mb-5"
            style={{ fontSize: "clamp(2.2rem, 3.8vw, 3.4rem)", color: "#FFFFFF", maxWidth: 520 }}
          >
            District-wide insight for students who need it most.
          </h1>

          <p className="text-base md:text-lg mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.62)", maxWidth: 440 }}>
            MindScope gives districts the infrastructure to close gaps with structured care plans, trackable referrals, and actionable analytics.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ backgroundColor: "#FFFFFF", color: "#14337B" }}
            >
              Request a Demo
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <a
              href="#analytics"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.18)" }}
            >
              See Analytics Preview
            </a>
          </div>
        </div>

        {/* Right: photo card inset from top, navy behind */}
        <div className="hidden md:block flex-1 relative" style={{ backgroundColor: "#14337B" }}>
          <img
            src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1400&h=1000&fit=crop&auto=format"
            alt="Students in a classroom with a teacher"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              borderRadius: "2.5rem 0 2.5rem 2.5rem",
              objectPosition: "center 30%",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              borderRadius: "2.5rem 0 2.5rem 2.5rem",
              background: "linear-gradient(90deg, rgba(20,51,123,0.35) 0%, transparent 35%)",
            }}
          />
        </div>
      </section>

      {/* ── Equity argument ── */}
      <section style={{ backgroundColor: "var(--card)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-5 gap-12 items-center">
          <div className="md:col-span-2">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--muted-foreground)" }}>The equity case</p>
            <h2 className="font-display text-3xl md:text-4xl leading-snug" style={{ color: "var(--foreground)" }}>
              The referral process is fragmented and invisible.
            </h2>
          </div>
          <div className="md:col-span-3">
            <p className="text-base md:text-lg leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              One in five students struggles with a behavioral health challenge that affects their learning. Most never receive structured support — not because schools don't care, but because counselors are overloaded and the referral process is fragmented and invisible. MindScope gives districts the infrastructure to change that.
            </p>
          </div>
        </div>
      </section>

      {/* ── Three C's — cream background, varied card treatment ── */}
      <section style={{ backgroundColor: "var(--background)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20">
          <div className="mb-10 flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--muted-foreground)" }}>
                Built around three principles
              </p>
              <h2 className="font-display text-3xl md:text-4xl leading-tight" style={{ color: "var(--foreground)" }}>
                The three C's of MindScope.
              </h2>
            </div>
            <p className="text-sm max-w-lg" style={{ color: "var(--muted-foreground)" }}>
              Every feature flows from these commitments to districts, counselors, and families.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {threeCs.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl p-8 flex flex-col gap-5"
                style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--secondary)", color: "var(--primary)" }}
                >
                  {c.icon}
                </div>
                <div>
                  <div className="font-display text-2xl mb-2" style={{ color: "var(--foreground)" }}>
                    {c.title}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    {c.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Analytics Preview — cream background ── */}
      <section id="analytics" style={{ backgroundColor: "var(--card)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20">
          <div className="mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--muted-foreground)" }}>
              Analytics preview
            </p>
            <h2 className="font-display text-3xl md:text-4xl leading-tight mb-3" style={{ color: "var(--foreground)" }}>
              See what MindScope reveals about your district.
            </h2>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Sample data from a fictional district. Real charts reflect your actual student population.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Chart 1: Service Desert Index */}
            <div className="rounded-2xl p-7" style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--muted-foreground)" }}>Service Desert Index</p>
              <h3 className="font-semibold text-sm mb-5" style={{ color: "var(--foreground)" }}>Which communities are most underserved?</h3>
              <div className="space-y-2.5">
                {serviceDesertData.map((row) => (
                  <div key={row.zip} className="flex items-center gap-3">
                    <span className="text-xs font-mono w-12 shrink-0" style={{ color: "var(--muted-foreground)" }}>{row.zip}</span>
                    <div className="flex-1 rounded-full h-5 overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
                      <div
                        className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${row.score}%`, backgroundColor: desertColors[row.label] }}
                      >
                        <span className="text-xs text-white font-semibold">{row.score}</span>
                      </div>
                    </div>
                    <span className="text-xs w-20 shrink-0" style={{ color: desertColors[row.label] }}>{row.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-5">
                {Object.entries(desertColors).map(([label, color]) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Referral funnel */}
            <div className="rounded-2xl p-7" style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--muted-foreground)" }}>Referral through-put funnel</p>
              <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--foreground)" }}>Where do families drop off?</h3>
              <EngagementFunnel />
            </div>

            {/* Chart 3: Caseload scatter */}
            <div className="rounded-2xl p-7" style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--muted-foreground)" }}>Counselor Caseload vs Submissions</p>
              <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--foreground)" }}>Are overloaded counselors getting support?</h3>
              <ResponsiveContainer width="100%" height={200}>
                <ScatterChart margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="caseload" name="Students" label={{ value: "Students", position: "insideBottom", offset: -5, fontSize: 10, fill: "var(--muted-foreground)" }} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="submissions" name="Submissions" label={{ value: "Referrals", angle: -90, position: "insideLeft", fontSize: 10, fill: "var(--muted-foreground)" }} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Scatter data={scatterData} fill="var(--accent)" opacity={0.85} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 4: Therapy demand */}
            <div className="rounded-2xl p-7" style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--muted-foreground)" }}>Therapy Type Demand</p>
              <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--foreground)" }}>What support do your students most need?</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={therapyData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="type" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={72} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                  <Bar dataKey="high" name="High Need" stackId="a" fill="#DC2626" />
                  <Bar dataKey="moderate" name="Moderate" stackId="a" fill="#D97706" />
                  <Bar dataKey="low" name="Low Need" stackId="a" fill="#16A34A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="text-xs mt-8" style={{ color: "var(--muted-foreground)" }}>
            Full analytics suite included with district implementation — five dashboard pages covering counselor density, service mapping, referral impact, roadmap progression, and equity.
          </p>
        </div>
      </section>

      {/* ── Implementation inquiry ── */}
      <section id="contact" style={{ backgroundColor: "var(--background)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20">
          <div className="mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--muted-foreground)" }}>
              Get started
            </p>
            <h2 className="font-display text-3xl md:text-4xl" style={{ color: "var(--foreground)" }}>
              Start the conversation.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* Left: what's included — light panel */}
            <div className="rounded-2xl p-8" style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: "var(--muted-foreground)" }}>
                What implementation includes
              </p>
              <ul className="space-y-4">
                {implementationIncludes.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "var(--foreground)" }}>
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.5l2.5 2.5 5-5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-7" style={{ borderTop: "1px solid var(--border)" }}>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  Most districts are fully onboarded within 6–8 weeks.
                </p>
              </div>
            </div>

            {/* Right: contact form */}
            {!submitted ? (
              <div className="rounded-2xl p-8" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                <h3 className="font-display text-2xl mb-6 text-center" style={{ color: "var(--foreground)" }}>Request a Demo</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                      className="px-4 py-2.5 rounded-lg text-sm outline-none"
                      style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    />
                    <input
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                      className="px-4 py-2.5 rounded-lg text-sm outline-none"
                      style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="District name"
                      value={formData.district}
                      onChange={(e) => setFormData((p) => ({ ...p, district: e.target.value }))}
                      className="px-4 py-2.5 rounded-lg text-sm outline-none"
                      style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    />
                    <input
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
                      className="px-4 py-2.5 rounded-lg text-sm outline-none"
                      style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    />
                  </div>
                  <select
                    value={formData.schools}
                    onChange={(e) => setFormData((p) => ({ ...p, schools: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none appearance-none"
                    style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)", color: formData.schools ? "var(--foreground)" : "var(--muted-foreground)" }}
                  >
                    <option value="">Number of schools in district</option>
                    {schoolSizes.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <textarea
                    placeholder="What's your biggest challenge right now? (optional)"
                    value={formData.challenge}
                    onChange={(e) => setFormData((p) => ({ ...p, challenge: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none"
                    style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  />
                  {chooseMail ? (
                    <MailSendChoice
                      subject="MindScope district demo request"
                      fields={districtFields}
                      onSent={() => setSubmitted(true)}
                    />
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="w-full py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                      style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                    >
                      Request a Demo
                    </button>
                  )}
                  <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
                    We typically respond within 2 business days.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)" }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "var(--primary)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <h3 className="font-semibold text-base mb-2" style={{ color: "var(--foreground)" }}>Request received</h3>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>We'll be in touch within 2 business days.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Download one-pager — deep teal bar ── */}
      <section style={{ backgroundColor: "#14337B" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-semibold text-base" style={{ color: "#FFFFFF" }}>
              Want something to share with your board or superintendent?
            </p>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
              Download our two-page district brief.
            </p>
          </div>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
            style={{ backgroundColor: "#FFFFFF", color: "#14337B" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 15V3M12 15l-4-4M12 15l4-4M3 21h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Download District One-Pager
          </a>
        </div>
      </section>
    </>
  );
}