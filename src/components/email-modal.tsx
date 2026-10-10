"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMounted } from "@/lib/hooks";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "error";
type FieldName = "subject" | "message" | "replyTo";
type FieldErrors = Partial<Record<FieldName, string>>;

const SUBJECT_MAX = 50;
const MESSAGE_MAX = 800;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(
  subject: string,
  message: string,
  replyTo: string
): FieldErrors {
  const errors: FieldErrors = {};
  if (!subject.trim()) errors.subject = "Add a subject so I know what this is about.";
  if (!message.trim()) errors.message = "Write a message before sending.";
  if (!replyTo.trim()) errors.replyTo = "I need an address to reply to.";
  else if (!EMAIL_RE.test(replyTo.trim()))
    errors.replyTo = "That doesn't look like a valid email address.";
  return errors;
}

/** Label + optional character counter, sharing one baseline. */
function FieldHeader({
  htmlFor,
  label,
  count,
  max,
}: {
  htmlFor: string;
  label: string;
  count?: number;
  max?: number;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {count !== undefined && max !== undefined ? (
        <span
          className={cn(
            "font-mono text-xs tabular-nums",
            count > max * 0.9 ? "text-accent-strong" : "text-faint"
          )}
        >
          {count}/{max}
        </span>
      ) : null}
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-xs text-danger">
      {message}
    </p>
  );
}

const fieldBase =
  "focus-ring w-full rounded-lg border bg-surface-2 px-3.5 text-sm text-ink caret-accent outline-none transition-colors placeholder:text-faint";

export function EmailModal() {
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const reduced = useReducedMotion();
  const uid = useId();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState("");

  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const replyToRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setSubject("");
    setMessage("");
    setReplyTo("");
    setFieldErrors({});
    setErrorMsg("");
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    if (status === "sent") reset();
  }, [status, reset]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-email-modal", onOpen);
    return () => window.removeEventListener("open-email-modal", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => subjectRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  // Keep Tab inside the dialog while it is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const clearError = (field: FieldName) =>
    setFieldErrors((f) => (f[field] ? { ...f, [field]: undefined } : f));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;

    const errors = validate(subject, message, replyTo);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      // Send focus to the first field that needs attention.
      const order: [FieldName, React.RefObject<HTMLElement>][] = [
        ["subject", subjectRef],
        ["message", messageRef],
        ["replyTo", replyToRef],
      ];
      order.find(([name]) => errors[name])?.[1].current?.focus();
      return;
    }

    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, replyTo }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-modal flex items-end justify-center sm:items-center sm:px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <button
            aria-label="Close"
            tabIndex={-1}
            onClick={close}
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${uid}-title`}
            initial={
              reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.99 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-border-strong bg-surface shadow-2xl shadow-black/40 sm:max-w-lg sm:rounded-2xl"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            {/* drag affordance on mobile sheets */}
            <div
              aria-hidden="true"
              className="mx-auto mt-3 h-1 w-10 rounded-full bg-border-strong sm:hidden"
            />

            <div className="flex items-start justify-between gap-4 px-6 pb-5 pt-5 sm:pt-6">
              <div className="min-w-0">
                <h2
                  id={`${uid}-title`}
                  className="text-lg font-semibold text-ink"
                >
                  Get in touch
                </h2>
                <p className="mt-1 text-sm text-muted">
                  This goes straight to my inbox. I usually reply within a day
                  or two.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="focus-ring -mr-2 -mt-1 h-11 shrink-0 rounded-lg px-3 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-ink"
              >
                Close
              </button>
            </div>

            {status === "sent" ? (
              <div className="flex flex-col items-center gap-4 px-6 pb-8 pt-4 text-center">
                <div>
                  <p className="font-medium text-success">Message sent</p>
                  <p className="mt-1 text-sm text-muted">
                    I&apos;ll reply to {replyTo || "your address"}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="focus-ring mt-1 inline-flex h-11 items-center rounded-lg border border-border-strong px-5 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={submit}
                noValidate
                className="flex flex-col gap-5 border-t border-border px-6 pb-6 pt-5"
              >
                <div className="flex flex-col gap-2">
                  <FieldHeader
                    htmlFor={`${uid}-subject`}
                    label="Subject"
                    count={subject.length}
                    max={SUBJECT_MAX}
                  />
                  <input
                    id={`${uid}-subject`}
                    ref={subjectRef}
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      clearError("subject");
                    }}
                    placeholder="What's this about?"
                    maxLength={SUBJECT_MAX}
                    autoComplete="off"
                    aria-invalid={!!fieldErrors.subject}
                    aria-describedby={
                      fieldErrors.subject ? `${uid}-subject-error` : undefined
                    }
                    className={cn(
                      fieldBase,
                      "h-12",
                      fieldErrors.subject ? "border-danger" : "border-border"
                    )}
                  />
                  <FieldError
                    id={`${uid}-subject-error`}
                    message={fieldErrors.subject}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <FieldHeader
                    htmlFor={`${uid}-message`}
                    label="Message"
                    count={message.length}
                    max={MESSAGE_MAX}
                  />
                  <textarea
                    id={`${uid}-message`}
                    ref={messageRef}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      clearError("message");
                    }}
                    placeholder="A few lines is plenty."
                    rows={5}
                    maxLength={MESSAGE_MAX}
                    aria-invalid={!!fieldErrors.message}
                    aria-describedby={
                      fieldErrors.message ? `${uid}-message-error` : undefined
                    }
                    className={cn(
                      fieldBase,
                      "resize-none py-3 leading-relaxed",
                      fieldErrors.message ? "border-danger" : "border-border"
                    )}
                  />
                  <FieldError
                    id={`${uid}-message-error`}
                    message={fieldErrors.message}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <FieldHeader
                    htmlFor={`${uid}-reply-to`}
                    label="Your email"
                  />
                  <input
                    id={`${uid}-reply-to`}
                    ref={replyToRef}
                    type="email"
                    inputMode="email"
                    value={replyTo}
                    onChange={(e) => {
                      setReplyTo(e.target.value);
                      clearError("replyTo");
                    }}
                    onBlur={() => {
                      if (replyTo.trim() && !EMAIL_RE.test(replyTo.trim()))
                        setFieldErrors((f) => ({
                          ...f,
                          replyTo:
                            "That doesn't look like a valid email address.",
                        }));
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-invalid={!!fieldErrors.replyTo}
                    aria-describedby={
                      fieldErrors.replyTo ? `${uid}-reply-to-error` : undefined
                    }
                    className={cn(
                      fieldBase,
                      "h-12",
                      fieldErrors.replyTo ? "border-danger" : "border-border"
                    )}
                  />
                  <FieldError
                    id={`${uid}-reply-to-error`}
                    message={fieldErrors.replyTo}
                  />
                </div>

                {status === "error" && (
                  <p
                    role="alert"
                    className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2.5 text-xs text-danger"
                  >
                    <span>
                      {errorMsg} You can also email me directly at{" "}
                      <a href={profile.links.email} className="link-underline font-medium">
                        {profile.email}
                      </a>
                      .
                    </span>
                  </p>
                )}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={close}
                    className="focus-ring inline-flex h-12 items-center justify-center rounded-lg px-4 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-ink sm:h-11"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className={cn(
                      "focus-ring inline-flex h-12 items-center justify-center rounded-lg bg-accent px-5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-strong sm:h-11",
                      status === "sending" &&
                        "cursor-not-allowed opacity-60 hover:bg-accent"
                    )}
                  >
                    {status === "sending" ? "Sending..." : "Send message"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
