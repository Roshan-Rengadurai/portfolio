"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { SECTIONS, type SectionId } from "@/components/app-shell";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";

const NAV_IDS: SectionId[] = [...SECTIONS];

const TABS: { id: SectionId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "education", label: "Education" },
  { id: "projects", label: "Projects" },
];

// 48px tall. The compact state scales the dock to 0.95, so the smallest
// effective tap target stays at ~45.6px, above the 44px minimum.
const tabBtn =
  "focus-ring relative flex h-12 items-center rounded-full px-3.5 text-sm text-muted transition-[color,transform] duration-100 hover:text-ink active:scale-95 sm:px-4";

const linkBtn =
  "focus-ring hidden h-12 items-center rounded-full px-3.5 text-sm font-medium text-muted transition-colors hover:text-ink sm:flex";

/** Where in the viewport a section counts as "the one you're reading". */
const READING_LINE = 0.38;

export function BottomNav() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();

  const [active, setActive] = useState<SectionId>(NAV_IDS[0]);
  const [compact, setCompact] = useState(false);
  // Suppress spy updates during a click-driven smooth scroll, so the highlight
  // goes straight to the target instead of flickering through what it passes.
  const lockUntil = useRef(0);

  /**
   * The active section is the last one whose top has crossed the reading line.
   * Position-based rather than an IntersectionObserver band: a band thin
   * enough to be unambiguous is also thin enough for a fast scroll to skip
   * entirely, which is what left the highlight stalled on the wrong icon.
   */
  const resolveActive = useCallback((): SectionId => {
    const line = window.innerHeight * READING_LINE;
    let current: SectionId = NAV_IDS[0];
    for (const id of NAV_IDS) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= line) current = id;
    }
    // The last section is usually too short to reach the line, so pin it once
    // the page has bottomed out.
    const doc = document.documentElement;
    if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2) {
      current = NAV_IDS[NAV_IDS.length - 1];
    }
    return current;
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    if (performance.now() >= lockUntil.current) {
      setActive(resolveActive());
    }

    const prev = scrollY.getPrevious() ?? 0;
    const delta = y - prev;
    if (y < 64) setCompact(false);
    else if (delta > 6) setCompact(true);
    else if (delta < -6) setCompact(false);
  });

  // Initial highlight, plus a recheck on resize (section offsets move).
  useEffect(() => {
    setActive(resolveActive());
    const onResize = () => setActive(resolveActive());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [resolveActive]);

  const goto = (id: SectionId) => {
    setActive(id);
    lockUntil.current = performance.now() + 700;
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  };

  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-3 z-nav flex justify-center px-3 sm:bottom-5"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Condensing is mostly gap/padding rather than scale, so the dock reads
          as visibly tighter without shrinking tap targets below 44px. */}
      <motion.div
        className={cn(
          "glass flex origin-bottom items-center rounded-full transition-[gap,padding] duration-300 ease-out",
          compact ? "gap-0 p-1" : "gap-0.5 p-1.5 sm:gap-1"
        )}
        animate={
          reduced
            ? undefined
            : { scale: compact ? 0.95 : 1, opacity: compact ? 0.8 : 1 }
        }
        transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.6 }}
        whileHover={reduced ? undefined : { scale: 1, opacity: 1 }}
      >
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => goto(tab.id)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                tabBtn,
                isActive
                  ? "font-semibold text-accent-ink hover:text-accent-ink"
                  : "font-medium"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="tab-indicator"
                  className="absolute inset-0 -z-10 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              {tab.label}
            </button>
          );
        })}

        {/* External profiles. Hidden on the narrowest screens, where the dock
            is already full; the footer carries the same two links. */}
        <span className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
        <a
          href={profile.links.github}
          target="_blank"
          rel="noreferrer"
          className={linkBtn}
        >
          GitHub
        </a>
        <a
          href={profile.links.linkedin}
          target="_blank"
          rel="noreferrer"
          className={linkBtn}
        >
          LinkedIn
        </a>
      </motion.div>
    </nav>
  );
}
