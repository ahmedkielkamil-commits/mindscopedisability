import { contactEmail } from "virtual:azure-env";

export function inboxEmail(): string {
  return (contactEmail || "ahmed.kielkamil@gmail.com").trim();
}

function messageBody(fields: Record<string, string>): string {
  return Object.entries(fields)
    .filter(([, value]) => value.trim())
    .map(([key, value]) => `${key}: ${value.trim()}`)
    .join("\n");
}

export function gmailComposeUrl(subject: string, fields: Record<string, string>): string {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: inboxEmail(),
    su: subject,
    body: messageBody(fields),
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function outlookComposeUrl(subject: string, fields: Record<string, string>): string {
  const params = new URLSearchParams({
    to: inboxEmail(),
    subject,
    body: messageBody(fields),
  });
  return `https://outlook.live.com/mail/0/deeplink/compose?${params.toString()}`;
}
