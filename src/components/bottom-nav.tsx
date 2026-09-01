"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Home,
  GraduationCap,
  Github,
  FolderGit2,
  Linkedin,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { useTheme } from "next-themes";
import { SECTIONS, type SectionId } from "@/components/app-shell";
import { profile } from "@/data/profile";
import { useMounted } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const NAV_IDS: SectionId[] = [...SECTIONS];

type Tab = { id: SectionId; label: string; icon: LucideIcon };

const TABS: Tab[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "github", label: "Contributions", icon: Github },
  { id: "projects", label: "Projects", icon: FolderGit2 },
];

/**
 * Label shown above an icon on hover, or on keyboard focus.
 *
 * Keyed off `has-[:focus-visible]` rather than `focus-within`: a clicked
 * button keeps DOM focus, so `focus-within` pinned the tooltip open while the
 * visitor scrolled away. `:focus-visible` is only set for keyboard focus,
 * which is exactly when the label earns its place. It has to go through
 * `:has()` because `:focus-visible` matches the button, and (unlike
 * `:focus-within`) does not propagate up to this wrapper.
 */
function Tip({
  label,
  children,
  className,
  /** Suppress where the control already renders the label as visible text. */
  hideFrom,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  hideFrom?: string;
}) {
  return (
    <span className={cn("group relative flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-ink opacity-0 shadow-lg shadow-black/20 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-has-[:focus-visible]:translate-y-0 group-has-[:focus-visible]:opacity-100",
          hideFrom
        )}
      >
        {label}
      </span>
    </span>
  );
}

// 48px tall everywhere. The compact state scales the dock to 0.95, so the
// smallest effective tap target stays at ~45.6px, above the 44px minimum.
const iconBtn =
  "focus-ring flex size-12 items-center justify-center rounded-full text-muted transition-[color,transform] duration-100 hover:text-ink active:scale-90";

// Section tabs: a square icon button on small screens, widening to an
// icon + label pill from md up so the dock reads as a table of contents
// rather than an anonymous toolbar.
const tabBtn =
  "focus-ring relative flex h-12 w-12 items-center justify-center gap-2 rounded-full text-muted transition-[color,transform] duration-100 hover:text-ink active:scale-95 md:w-auto md:px-4";

const iconSize = "size-[18px] sm:size-5";

/** Where in the viewport a section counts as "the one you're reading". */
const READING_LINE = 0.38;

export function BottomNav() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
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

  const isDark = resolvedTheme === "dark";

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
          const Icon = tab.icon;
          return (
            <Tip key={tab.id} label={tab.label} hideFrom="md:hidden">
              <button
                type="button"
                onClick={() => goto(tab.id)}
                aria-current={isActive ? "true" : undefined}
                aria-label={`Go to ${tab.label}`}
                className={cn(
                  tabBtn,
                  isActive && "text-accent-ink hover:text-accent-ink"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute inset-0 -z-10 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon
                  className={cn(iconSize, "shrink-0")}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
                <span
                  className={cn(
                    "hidden text-sm md:inline",
                    isActive ? "font-semibold" : "font-medium"
                  )}
                >
                  {tab.label}
                </span>
              </button>
            </Tip>
          );
        })}

        <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

        {/* External profiles. Hidden on the narrowest screens, where the dock
            is already full — the footer carries the same two links. */}
        <Tip label="GitHub ↗" className="hidden sm:flex">
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile (opens in new tab)"
            className={iconBtn}
          >
            <Github className={iconSize} strokeWidth={1.75} />
          </a>
        </Tip>
        <Tip label="LinkedIn ↗" className="hidden sm:flex">
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn profile (opens in new tab)"
            className={iconBtn}
          >
            <Linkedin className={iconSize} strokeWidth={1.75} />
          </a>
        </Tip>

        <Tip label={mounted && isDark ? "Light" : "Dark"}>
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={
              mounted
                ? `Switch to ${isDark ? "light" : "dark"} theme`
                : "Toggle theme"
            }
            className={iconBtn}
          >
            {mounted ? (
              isDark ? (
                <Sun className={iconSize} strokeWidth={1.75} />
              ) : (
                <Moon className={iconSize} strokeWidth={1.75} />
              )
            ) : (
              <span className={iconSize} />
            )}
          </button>
        </Tip>
      </motion.div>
    </nav>
  );
}
