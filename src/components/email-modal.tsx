"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useMounted } from "@/lib/hooks";
import { useSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "error";
type FieldErrors = { subject?: string; message?: string; replyTo?: string };

const SUBJECT_MAX = 50;
const MESSAGE_MAX = 800;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_CLASS =
  "focus-ring w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-ink caret-accent outline-none placeholder:text-faint";

function fieldClass(hasError: boolean) {
  return cn(FIELD_CLASS, hasError && "border-danger");
}

function validate(subject: string, message: string, replyTo: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!subject.trim()) errors.subject = "Subject is required.";
  if (!message.trim()) errors.message = "Message is required.";
  if (!replyTo.trim()) errors.replyTo = "Email is required.";
  else if (!EMAIL_RE.test(replyTo.trim())) errors.replyTo = "Enter a valid email address.";
  return errors;
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-mono text-[11px] uppercase tracking-wide text-faint"
    >
      {children}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="flex items-center gap-1.5 text-xs text-danger">
      <AlertCircle className="size-3.5 shrink-0" />
      {message}
    </p>
  );
}

export function EmailModal() {
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const reduced = useReducedMotion();
  const { play } = useSound();
  const uid = useId();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState("");

  const subjectRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    if (status !== "sent") return;
    setStatus("idle");
    setSubject("");
    setMessage("");
    setReplyTo("");
    setFieldErrors({});
  }, [status]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-email-modal", onOpen);
    return () => window.removeEventListener("open-email-modal", onOpen);
  }, []);

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => subjectRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    const errors = validate(subject, message, replyTo);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, replyTo }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to send.");
      play("tap");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to send.");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-modal flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <button
            aria-label="Close email form"
            tabIndex={-1}
            onClick={close}
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Send an email"
            onKeyDown={onKeyDown}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md overflow-hidden rounded-xl border border-border-strong bg-surface shadow-2xl shadow-black/50"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-surface-2 text-accent-strong">
                <Mail className="size-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">Send me an email</p>
                <p className="truncate font-mono text-[11px] text-faint">
                  <span className="text-accent-strong">$</span> mail -s &quot;...&quot;
                </p>
              </div>
              <kbd className="hidden shrink-0 rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-faint sm:inline">
                esc
              </kbd>
            </div>

            {status === "sent" ? (
              <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                <CheckCircle2 className="size-8 text-success" strokeWidth={1.5} />
                <p className="text-sm text-ink">Sent. I&apos;ll get back to you soon.</p>
                <button
                  type="button"
                  onClick={close}
                  className="focus-ring mt-2 rounded-lg border border-border-strong px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-ink"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`${uid}-subject`}>Subject</Label>
                  <input
                    id={`${uid}-subject`}
                    ref={subjectRef}
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      if (fieldErrors.subject) setFieldErrors((f) => ({ ...f, subject: undefined }));
                    }}
                    placeholder="Let's build something"
                    maxLength={SUBJECT_MAX}
                    autoComplete="off"
                    aria-invalid={!!fieldErrors.subject}
                    aria-describedby={fieldErrors.subject ? `${uid}-subject-error` : undefined}
                    className={cn(fieldClass(!!fieldErrors.subject), "h-10")}
                  />
                  <FieldError id={`${uid}-subject-error`} message={fieldErrors.subject} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`${uid}-message`}>Message</Label>
                  <textarea
                    id={`${uid}-message`}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (fieldErrors.message) setFieldErrors((f) => ({ ...f, message: undefined }));
                    }}
                    placeholder="What's up?"
                    rows={5}
                    maxLength={MESSAGE_MAX}
                    aria-invalid={!!fieldErrors.message}
                    aria-describedby={fieldErrors.message ? `${uid}-message-error` : undefined}
                    className={cn(fieldClass(!!fieldErrors.message), "resize-none py-2")}
                  />
                  <FieldError id={`${uid}-message-error`} message={fieldErrors.message} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`${uid}-reply-to`}>Your email</Label>
                  <input
                    id={`${uid}-reply-to`}
                    type="email"
                    value={replyTo}
                    onChange={(e) => {
                      setReplyTo(e.target.value);
                      if (fieldErrors.replyTo) setFieldErrors((f) => ({ ...f, replyTo: undefined }));
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-invalid={!!fieldErrors.replyTo}
                    aria-describedby={fieldErrors.replyTo ? `${uid}-reply-to-error` : undefined}
                    className={cn(fieldClass(!!fieldErrors.replyTo), "h-10")}
                  />
                  <FieldError id={`${uid}-reply-to-error`} message={fieldErrors.replyTo} />
                </div>

                {status === "error" && (
                  <p className="flex items-center gap-1.5 text-xs text-danger">
                    <AlertCircle className="size-3.5 shrink-0" />
                    {errorMsg}
                  </p>
                )}

                <div className="mt-1 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="focus-ring rounded-lg px-3 py-2 text-xs font-medium text-muted transition-colors hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className={cn(
                      "focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-strong",
                      status === "sending" && "cursor-not-allowed opacity-60 hover:bg-accent"
                    )}
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
                        Sending
                      </>
                    ) : (
                      "Send"
                    )}
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
