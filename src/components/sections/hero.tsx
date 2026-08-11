"use client";

import { Mail, CalendarDays } from "lucide-react";
import { profile } from "@/data/profile";
import { Section } from "@/components/section";
import { HeroTitle } from "@/components/sections/hero-title";

export function Hero() {
  const [first, ...rest] = profile.name.split(" ");
  const last = rest.join(" ");

  return (
    <Section id="home">
      {/* intro */}
      <p className="reveal font-mono text-sm text-accent-strong" style={{ ["--i" as string]: 0 }}>
        <span className="text-faint">$</span> whoami
      </p>

      <HeroTitle
        first={first}
        last={last}
        className="reveal mt-4 text-balance font-bold leading-[0.95] tracking-tight text-ink"
        style={{ ["--i" as string]: 1, fontSize: "clamp(2.75rem, 9vw, 5.5rem)" }}
      />

      <p
        className="reveal mt-6 max-w-[46ch] text-pretty text-lg leading-relaxed text-muted sm:text-xl"
        style={{ ["--i" as string]: 2 }}
      >
        {profile.headline}
      </p>

      <div
        className="reveal mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-faint"
        style={{ ["--i" as string]: 3 }}
      >
        <span className="inline-flex items-center gap-2">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
          </span>
          move your cursor to warp the grid
        </span>
        <span className="hidden text-border-strong sm:inline">/</span>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
          className="focus-ring hidden text-muted transition-colors hover:text-accent-strong sm:inline"
        >
          press ⌘K for commands →
        </button>
      </div>

      {/* contact — mirrors the Projects footer CTA */}
      <div
        className="reveal mt-12 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed border-border-strong bg-surface/80 px-5 py-4"
        style={{ ["--i" as string]: 4 }}
      >
        <p className="font-mono text-xs text-faint">
          <span className="text-accent-strong">$</span> mail -s &quot;let&apos;s
          build something&quot;
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={profile.links.cal}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg border border-border-strong px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
          >
            <CalendarDays className="size-4" strokeWidth={2} />
            Book a call
          </a>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-email-modal"))}
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-strong"
          >
            <Mail className="size-4" strokeWidth={2} />
            Email me
          </button>
        </div>
      </div>
    </Section>
  );
}
