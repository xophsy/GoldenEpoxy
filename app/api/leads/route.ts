import { NextResponse } from "next/server";
import { Resend } from "resend";
import { leadEmail } from "@/data/siteContent";

export const runtime = "nodejs";

const allowedChoices = {
  style: ["Metallic / shimmer", "Flake / terrazzo", "Solid color", "Not sure yet"],
  space: ["Garage", "Basement", "Showroom", "Warehouse", "Patio", "Commercial / Industrial", "Other"],
  size: ["Small", "Medium", "Large"],
  timeline: ["ASAP", "This month", "In the next few months", "Just exploring for now"],
} as const;

type Lead = {
  name: string;
  phone: string;
  email: string;
  style: string;
  space: string;
  size: string;
  timeline: string;
  location: string;
  message: string;
  submissionId: string;
};

function stringField(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isAllowedChoice(key: keyof typeof allowedChoices, value: string) {
  return value === "" || (allowedChoices[key] as readonly string[]).includes(value);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

function parseLead(body: Record<string, unknown>): Lead | null {
  const lead: Lead = {
    name: stringField(body.name, 100),
    phone: stringField(body.phone, 40),
    email: stringField(body.email, 254).toLowerCase(),
    style: stringField(body.style, 80),
    space: stringField(body.space, 80),
    size: stringField(body.size, 80),
    timeline: stringField(body.timeline, 80),
    location: stringField(body.location, 100),
    message: stringField(body.message, 2000),
    submissionId: stringField(body.submissionId, 64),
  };

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email);
  const phoneIsValid = lead.phone.replace(/\D/g, "").length >= 7;
  const idIsValid = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(lead.submissionId);

  if (
    lead.name.length < 2 ||
    !emailIsValid ||
    !phoneIsValid ||
    !idIsValid ||
    !isAllowedChoice("style", lead.style) ||
    !isAllowedChoice("space", lead.space) ||
    !isAllowedChoice("size", lead.size) ||
    !isAllowedChoice("timeline", lead.timeline)
  ) {
    return null;
  }

  return lead;
}

function emailFrame(content: string) {
  return `<!doctype html>
  <html><body style="margin:0;background:#0c0c0c;font-family:Arial,sans-serif;color:#f5f5f5">
    <div style="display:none;max-height:0;overflow:hidden">Golden Epoxy estimate request</div>
    <div style="max-width:640px;margin:0 auto;padding:32px 20px">
      <div style="border:1px solid #3d3520;border-radius:18px;background:#151515;padding:32px">
        <p style="margin:0 0 20px;color:#d6b85a;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Golden Epoxy</p>
        ${content}
      </div>
    </div>
  </body></html>`;
}

function notificationHtml(lead: Lead) {
  const rows = [
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Email", lead.email],
    ["Project city or ZIP code", lead.location || "Not provided"],
    ["Look / system", lead.style || "Not selected"],
    ["Space", lead.space || "Not selected"],
    ["Size", lead.size || "Not selected"],
    ["Timeline", lead.timeline || "Not selected"],
    ["Anything else", lead.message || "None"],
  ];

  return emailFrame(`
    <h1 style="margin:0 0 8px;font-size:28px;line-height:1.2">New estimate request</h1>
    <p style="margin:0 0 28px;color:#aaa">Reply to this email to contact ${escapeHtml(lead.name)}.</p>
    <table role="presentation" style="width:100%;border-collapse:collapse">
      ${rows.map(([label, value]) => `<tr>
        <td style="width:140px;padding:12px 12px 12px 0;border-top:1px solid #2b2b2b;color:#999;font-size:13px;vertical-align:top">${escapeHtml(label)}</td>
        <td style="padding:12px 0;border-top:1px solid #2b2b2b;color:#fff;font-size:15px;white-space:pre-wrap">${escapeHtml(value)}</td>
      </tr>`).join("")}
    </table>`);
}

function confirmationHtml(name: string) {
  return emailFrame(`
    <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2">We received your request, ${escapeHtml(name)}.</h1>
    <p style="margin:0 0 18px;color:#c8c8c8;font-size:16px;line-height:1.6">Thanks for considering Golden Epoxy. We’ll review your project details and reach out within one business day.</p>
    <p style="margin:0;color:#999;font-size:14px;line-height:1.6">Need us sooner? Call or text <a href="tel:+18135800323" style="color:#d6b85a">(813) 580-0323</a>.</p>`);
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host || new URL(origin).host !== host) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 32_000) {
    return NextResponse.json({ error: "Request is too large" }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot fields are invisible to people but commonly filled by form bots.
  if (stringField(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const lead = parseLead(body);
  if (!lead) {
    return NextResponse.json({ error: "Please check your contact details" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Lead email is unavailable: RESEND_API_KEY is not configured");
    return NextResponse.json({ error: "Email service unavailable" }, { status: 503 });
  }

  const resend = new Resend(apiKey);
  const notificationEmail = process.env.LEAD_NOTIFICATION_EMAIL ?? leadEmail;
  const sendingDomain = process.env.RESEND_EMAIL_DOMAIN ?? "goldenepoxy.com";
  const fromEmail = process.env.LEAD_FROM_EMAIL ?? `Golden Epoxy Website <leads@${sendingDomain}>`;
  const safeName = lead.name.replace(/[\r\n]+/g, " ");
  const safeSpace = (lead.space || "Project").replace(/[\r\n]+/g, " ");

  const { error: notificationError } = await resend.emails.send(
    {
      from: fromEmail,
      to: notificationEmail,
      replyTo: lead.email,
      subject: `New estimate request — ${safeSpace} — ${safeName}`,
      html: notificationHtml(lead),
      text: [
        "NEW GOLDEN EPOXY ESTIMATE REQUEST",
        "",
        `Name: ${lead.name}`,
        `Phone: ${lead.phone}`,
        `Email: ${lead.email}`,
        `Project city or ZIP code: ${lead.location || "Not provided"}`,
        `Look / system: ${lead.style || "Not selected"}`,
        `Space: ${lead.space || "Not selected"}`,
        `Size: ${lead.size || "Not selected"}`,
        `Timeline: ${lead.timeline || "Not selected"}`,
        `Anything else: ${lead.message || "None"}`,
      ].join("\n"),
    },
    { idempotencyKey: `lead-notification-${lead.submissionId}` },
  );

  if (notificationError) {
    console.error("Lead notification failed", notificationError);
    return NextResponse.json({ error: "Email delivery failed" }, { status: 502 });
  }

  const { error: confirmationError } = await resend.emails.send(
    {
      from: fromEmail,
      to: lead.email,
      replyTo: notificationEmail,
      subject: "We received your Golden Epoxy estimate request",
      html: confirmationHtml(lead.name),
      text: `We received your request, ${lead.name}.\n\nThanks for considering Golden Epoxy. We'll review your project details and reach out within one business day.\n\nNeed us sooner? Call or text (813) 580-0323.`,
    },
    { idempotencyKey: `lead-confirmation-${lead.submissionId}` },
  );

  if (confirmationError) {
    // The business already has the lead, so a courtesy-email failure should not fail the form.
    console.error("Lead confirmation failed", confirmationError);
  }

  return NextResponse.json({ ok: true });
}
