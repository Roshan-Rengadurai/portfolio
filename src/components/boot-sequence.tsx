"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/lib/hooks";
import { profile } from "@/data/profile";

const LINES = [
  "boot --site=portfolio",
  "mounting sections... ok",
  "starting hud, particles, sound... ok",
  `whoami → ${profile.name}`,
];

const LINE_STEP = 150; // ms between each line appearing
const HOLD = 300; // ms pause after the last line before exiting
const EXIT_MS = 380;

/**
 * Full-screen terminal "boot" overlay shown on every load, ahead of the hero.
 * Skippable by any pointer/touch/key input. Skipped entirely under
 * prefers-reduced-motion — those users land straight on the hero.
 *
 * `onDone` fires the moment the exit transition *starts* (not after it
 * finishes), so the caller can mount the real page content immediately and
 * let the two transitions overlap into one continuous handoff instead of
 * the hero sitting there already fully-formed once the boot clears.
 */
export function BootSequence({ onDone }: { onDone?: () => void }) {
  const reduced = useReducedMotion();
  const [exiting, setExiting] = useState(reduced);
  const [shownLines, setShownLines] = useState(reduced ? LINES.length : 0);

  useEffect(() => {
    if (exiting) onDone?.();
  }, [exiting, onDone]);

  useEffect(() => {
    if (reduced) return;
    const timers = LINES.map((_, i) =>
      setTimeout(() => setShownLines((n) => Math.max(n, i + 1)), (i + 1) * LINE_STEP)
    );
    const exitTimer = setTimeout(
      () => setExiting(true),
      LINES.length * LINE_STEP + HOLD
    );
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(exitTimer);
    };
  }, [reduced]);

  useEffect(() => {
    if (reduced || exiting) return;
    const skip = () => setExiting(true);
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    window.addEventListener("touchstart", skip);
    return () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("touchstart", skip);
    };
  }, [reduced, exiting]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="boot"
          aria-hidden="true"
          className="fixed inset-0 z-boot flex items-center justify-center bg-bg px-6"
          exit={{ opacity: 0, scale: 1.015, filter: "blur(10px)" }}
          transition={{ duration: EXIT_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-full max-w-xs font-mono text-sm">
            <div className="space-y-1.5">
              {LINES.slice(0, shownLines).map((line, i) => {
                const isPrompt = i === 0;
                const isLast = i === LINES.length - 1;
                return (
                  <motion.p
                    key={line}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className={
                      isPrompt
                        ? "text-accent-strong"
                        : isLast
                          ? "text-ink"
                          : "text-faint"
                    }
                  >
                    {isPrompt && <span className="text-faint">$ </span>}
                    {line}
                    {isLast && shownLines === LINES.length && (
                      <span className="caret ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-accent-strong align-middle" />
                    )}
                  </motion.p>
                );
              })}
            </div>

            <div className="mt-4 h-px w-full bg-border">
              <motion.div
                className="h-full bg-accent"
                animate={{ width: `${(shownLines / LINES.length) * 100}%` }}
                transition={{ duration: 0.15, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
