import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ipAddress } from "@vercel/functions";
import { profile } from "@/data/profile";
import { checkRateLimit, recordSend } from "@/lib/rate-limit";

const MAX_LEN = 5000;

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email is not configured." }, { status: 503 });
  }

  let body: { subject?: string; message?: string; replyTo?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const subject = body.subject?.trim().slice(0, 200) || "New message from your site";
  const message = body.message?.trim().slice(0, MAX_LEN);
  const replyTo = body.replyTo?.trim().slice(0, 320);

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }
  if (replyTo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo)) {
    return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
  }

  const ip = ipAddress(req) ?? "unknown";
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    const wait = rateLimit.retryAfterSeconds;
    const label = wait >= 60 ? `${Math.ceil(wait / 60)}m` : `${wait}s`;
    return NextResponse.json(
      { error: `Too many messages. Try again in ${label}.` },
      { status: 429, headers: { "Retry-After": String(wait) } }
    );
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: profile.email,
      subject: `[Portfolio] ${subject}`,
      replyTo: replyTo || undefined,
      text: `${message}${replyTo ? `\n\n— reply-to: ${replyTo}` : ""}`,
      html: `<p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>${
        replyTo ? `<p style="color:#888;font-size:12px">reply-to: ${escapeHtml(replyTo)}</p>` : ""
      }`,
    });

    if (error) {
      return NextResponse.json({ error: "Failed to send." }, { status: 502 });
    }
    recordSend(ip);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to send." }, { status: 502 });
  }
}
