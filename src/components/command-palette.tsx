"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useTheme } from "next-themes";
import {
  Home,
  GraduationCap,
  Github,
  FolderGit2,
  SquareTerminal,
  Linkedin,
  Mail,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Search,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";
import { useView, type ViewId } from "@/components/app-shell";
import { useSound } from "@/lib/sound";
import { useMounted } from "@/lib/hooks";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";

type Command = {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  keywords?: string;
  run: () => void;
};

export function CommandPalette() {
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  const { setActive } = useView();
  const { play, enabled, toggle: toggleSound } = useSound();
  const { resolvedTheme, setTheme } = useTheme();

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setIndex(0);
  }, []);

  const commands = useMemo<Command[]>(() => {
    const go = (v: ViewId) => () => {
      setActive(v);
      close();
    };
    const open_ = (href: string) => () => {
      window.open(href, "_blank", "noopener,noreferrer");
      close();
    };
    const isDark = resolvedTheme === "dark";
    return [
      { id: "home", label: "Home", hint: "view", icon: Home, keywords: "whoami start", run: go("home") },
      { id: "education", label: "Education", hint: "view", icon: GraduationCap, keywords: "school college degree", run: go("education") },
      { id: "github", label: "Contributions", hint: "view", icon: Github, keywords: "graph commits", run: go("github") },
      { id: "projects", label: "Projects", hint: "view", icon: FolderGit2, keywords: "work building", run: go("projects") },
      { id: "terminal", label: "Terminal", hint: "view", icon: SquareTerminal, keywords: "shell cli type", run: go("terminal") },
      { id: "email", label: "Email me", hint: profile.email, icon: Mail, keywords: "contact reach hire", run: () => { window.location.href = profile.links.email; close(); } },
      { id: "gh-ext", label: "Open GitHub", hint: `@${profile.githubUsername}`, icon: Github, keywords: "external profile", run: open_(profile.links.github) },
      { id: "li-ext", label: "Open LinkedIn", hint: "profile", icon: Linkedin, keywords: "external", run: open_(profile.links.linkedin) },
      {
        id: "theme",
        label: isDark ? "Switch to light" : "Switch to dark",
        hint: "theme",
        icon: isDark ? Sun : Moon,
        keywords: "dark light mode appearance",
        run: () => { setTheme(isDark ? "light" : "dark"); close(); },
      },
      {
        id: "sound",
        label: enabled ? "Mute sounds" : "Enable sounds",
        hint: "audio",
        icon: enabled ? VolumeX : Volume2,
        keywords: "audio mute volume",
        run: () => { toggleSound(); close(); },
      },
    ];
  }, [setActive, close, resolvedTheme, setTheme, enabled, toggleSound]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.hint} ${c.keywords ?? ""}`.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Global open/close shortcut: ⌘K / Ctrl+K, plus a custom event for tap triggers.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  // Focus the input when opened; reset selection when the query changes.
  useEffect(() => {
    if (open) {
      setIndex(0);
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  useEffect(() => setIndex(0), [query]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      play("tap");
      results[index]?.run();
    }
  };

  // Keep the active row scrolled into view.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-idx="${index}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [index]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-modal flex items-start justify-center px-4 pt-[18vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* scrim */}
          <button
            aria-label="Close command palette"
            tabIndex={-1}
            onClick={close}
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onKeyDown={onKeyDown}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border-strong bg-surface shadow-2xl shadow-black/50"
          >
            {/* search row */}
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="size-4 shrink-0 text-faint" strokeWidth={1.75} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a view, or type a command…"
                aria-label="Search commands"
                spellCheck={false}
                autoComplete="off"
                className="h-12 min-w-0 flex-1 bg-transparent text-sm text-ink caret-accent outline-none placeholder:text-faint"
              />
              <kbd className="hidden rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-faint sm:inline">
                esc
              </kbd>
            </div>

            {/* results */}
            <div ref={listRef} className="max-h-[min(52vh,360px)] overflow-y-auto p-1.5">
              {results.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-faint">
                  No matches for &ldquo;{query}&rdquo;
                </p>
              ) : (
                results.map((cmd, i) => {
                  const Icon = cmd.icon;
                  const active = i === index;
                  return (
                    <button
                      key={cmd.id}
                      data-idx={i}
                      type="button"
                      onClick={cmd.run}
                      onPointerMove={() => setIndex(i)}
                      className={cn(
                        "relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-[color,transform] duration-100 active:scale-[0.98]",
                        active ? "text-ink" : "text-muted"
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="cmdk-active-row"
                          className="absolute inset-0 -z-10 rounded-lg bg-surface-2"
                          transition={{ type: "spring", stiffness: 500, damping: 45 }}
                        />
                      )}
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-md border border-border bg-surface-2",
                          active ? "text-accent-strong" : "text-muted"
                        )}
                      >
                        <Icon className="size-4" strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {cmd.label}
                      </span>
                      <span className="shrink-0 truncate font-mono text-[11px] text-faint">
                        {cmd.hint}
                      </span>
                      {active && (
                        <CornerDownLeft
                          className="size-3.5 shrink-0 text-faint"
                          strokeWidth={1.75}
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
