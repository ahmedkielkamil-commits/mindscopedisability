import type { ReactNode } from "react";
import { Link } from "react-router";

const toolLinks = [
  { to: "/parents/research", label: "Research" },
  { to: "/parents/facilities", label: "Facilities" },
  { to: "/parents/iep", label: "IEP" },
];

export function ToolPage({
  current,
  eyebrow,
  title,
  description,
  children,
}: {
  current: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <Link
          to="/parents"
          className="inline-flex items-center gap-1.5 text-sm mb-8 transition-opacity hover:opacity-70"
          style={{ color: "var(--muted-foreground)" }}
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
          Back to parent tools
        </Link>

        <nav className="flex gap-6 mb-8" style={{ borderBottom: "1px solid var(--border)" }}>
          {toolLinks.map((link) => {
            const active = link.to === current;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="pb-3 text-sm font-semibold"
                style={{
                  color: active ? "var(--primary)" : "var(--muted-foreground)",
                  borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                  marginBottom: "-1px",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <header className="mb-8">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "var(--muted-foreground)" }}
          >
            {eyebrow}
          </p>
          <h1
            className="font-display text-3xl md:text-4xl leading-tight mb-3"
            style={{ color: "var(--foreground)" }}
          >
            {title}
          </h1>
          <p className="text-base leading-relaxed max-w-xl" style={{ color: "var(--muted-foreground)" }}>
            {description}
          </p>
        </header>

        {children}
      </div>
    </section>
  );
}

export function FormCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-xl p-6 md:p-8"
      style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2
      className="text-xs font-semibold tracking-widest uppercase mb-4 flex items-center gap-3"
      style={{ color: "var(--muted-foreground)" }}
    >
      {children}
      <span className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
    </h2>
  );
}

export function Spinner({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      style={{ color }}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <p
      className="text-sm leading-relaxed rounded-lg p-3 mt-4"
      style={{ backgroundColor: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)" }}
    >
      {message}
    </p>
  );
}

export function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40"
      style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
    >
      {children}
    </button>
  );
}
