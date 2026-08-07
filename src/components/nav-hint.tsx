"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { useView } from "@/components/app-shell";

const STORAGE_KEY = "rr:navHintDate";
const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local

/**
 * A gentle, once-per-day nudge pointing at the dock — the primary way to
 * navigate. Shown on the first page open of the day, then remembered in
 * localStorage. Dismisses on tap, on the first navigation, or after a beat.
 */
export function NavHint() {
  const { active } = useView();
  const [show, setShow] = useState(false);
  const reduced = useReducedMotion();

  // Decide whether to show — only once per calendar day.
  useEffect(() => {
    let seen: string | null = null;
    try {
      seen = localStorage.getItem(STORAGE_KEY);
    } catch {
      return; // storage blocked (private mode) — skip the hint entirely
    }
    if (seen === today()) return;

    const appear = setTimeout(() => setShow(true), 1400);
    const hide = setTimeout(() => setShow(false), 9000);
    return () => {
      clearTimeout(appear);
      clearTimeout(hide);
    };
  }, []);

  // Record it as shown, and dismiss the moment the visitor navigates away.
  useEffect(() => {
    if (active !== "home") setShow(false);
  }, [active]);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(STORAGE_KEY, today());
    } catch {
      /* ignore */
    }
  };

  // Mark as shown once it actually appears, so a reload same-day won't repeat it.
  useEffect(() => {
    if (!show) return;
    try {
      localStorage.setItem(STORAGE_KEY, today());
    } catch {
      /* ignore */
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 bottom-[4.75rem] z-nav flex justify-center px-4 sm:bottom-20"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2.5 rounded-full border border-border-strong bg-surface px-3.5 py-2 text-xs text-ink shadow-lg shadow-black/30">
            <motion.span
              className="flex shrink-0 text-accent-strong"
              animate={reduced ? undefined : { y: [0, 3, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="size-4" strokeWidth={2} />
            </motion.span>
            <span>
              The <span className="font-medium text-accent-strong">dock</span>{" "}
              below is how you get around.
            </span>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss tip"
              className="focus-ring -mr-1 grid size-6 place-items-center rounded-full text-faint transition-colors hover:text-ink"
            >
              <X className="size-3.5" strokeWidth={2} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
