"use client";

import { Command } from "lucide-react";
import { profile } from "@/data/profile";
import { useView } from "@/components/app-shell";

export function SiteHeader() {
  const { setActive } = useView();

  return (
    <header className="fixed left-3 top-3 z-hud flex items-center gap-2 sm:left-4 sm:top-4">
      <button
        type="button"
        onClick={() => setActive("home")}
        aria-label={`${profile.name}, home`}
        className="focus-ring glass-chip grid size-9 place-items-center rounded-lg border border-border font-mono text-sm font-semibold text-ink transition-colors hover:border-border-strong hover:text-accent-strong"
      >
        {profile.initials}
      </button>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
        aria-label="Open command palette"
        aria-keyshortcuts="Meta+K Control+K"
        className="focus-ring glass-chip flex h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 font-mono text-xs text-muted transition-colors hover:border-border-strong hover:text-ink"
      >
        <Command className="size-3.5" strokeWidth={1.75} />
        <span className="hidden sm:inline">K</span>
      </button>
    </header>
  );
}
