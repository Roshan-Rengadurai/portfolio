"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useMounted } from "@/lib/hooks";
import { Console } from "@/components/console";

/**
 * A keyboard console for people who like them. Opened with the backtick key
 * (unless focus is in a field) or from the footer link.
 */
export function ConsoleOverlay() {
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "`" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      const typing =
        el instanceof HTMLElement &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable);
      if (typing) return;
      e.preventDefault();
      setOpen((o) => !o);
    };
    window.addEventListener("open-console", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("open-console", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

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
            aria-label="Close console"
            tabIndex={-1}
            onClick={close}
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Console"
            initial={
              reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.99 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full sm:max-w-xl"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close console"
              className="focus-ring absolute right-2 top-2 z-10 grid size-11 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <X className="size-5" strokeWidth={2} />
            </button>
            <Console />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
