"use client";

import { profile } from "@/data/profile";

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-12 pb-32">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {profile.name} &middot; {new Date().getFullYear()}
        </p>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
            className="link-underline text-muted hover:text-ink"
          >
            GitHub
          </a>
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noreferrer"
            className="link-underline text-muted hover:text-ink"
          >
            LinkedIn
          </a>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-email-modal"))}
            className="link-underline text-muted hover:text-ink"
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-console"))}
            className="focus-ring text-muted hover:text-ink"
          >
            Console
            <kbd className="ml-1.5 rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-faint">
              `
            </kbd>
          </button>
        </nav>
      </div>
    </footer>
  );
}
