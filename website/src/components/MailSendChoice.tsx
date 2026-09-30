import { gmailComposeUrl, outlookComposeUrl } from "../lib/contact";

export function MailSendChoice({
  subject,
  fields,
  onSent,
}: {
  subject: string;
  fields: Record<string, string>;
  onSent: () => void;
}) {
  const linkStyle = {
    backgroundColor: "var(--primary)",
    color: "var(--primary-foreground)",
  } as const;

  return (
    <div className="space-y-3">
      <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
        Choose where to send this email.
      </p>
      <a
        href={gmailComposeUrl(subject, fields)}
        target="_blank"
        rel="noreferrer"
        onClick={onSent}
        className="block w-full py-3 rounded-lg font-semibold text-sm text-center transition-all hover:opacity-90"
        style={linkStyle}
      >
        Open in Gmail
      </a>
      <a
        href={outlookComposeUrl(subject, fields)}
        target="_blank"
        rel="noreferrer"
        onClick={onSent}
        className="block w-full py-3 rounded-lg font-semibold text-sm text-center transition-all hover:opacity-90"
        style={{
          backgroundColor: "var(--card)",
          color: "var(--primary)",
          border: "1px solid var(--border)",
        }}
      >
        Open in Outlook
      </a>
    </div>
  );
}
