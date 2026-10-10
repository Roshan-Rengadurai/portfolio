"use client";

import { profile } from "@/data/profile";
import { AsciiFlow } from "@/components/ascii-flow";

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-dvh scroll-mt-0 flex-col justify-center pb-32 pt-24"
    >
      {/* Decorative field, right half. Hidden below lg, where the column would
          be too narrow to read and the copy needs the full width. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/2 hidden h-[min(72vh,660px)] w-[46%] -translate-y-1/2 select-none lg:block xl:w-[44%]"
      >
        <div className="absolute inset-0 [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,black_20%,black_82%,transparent),linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]">
          <AsciiFlow />
        </div>
      </div>

      {/* Width caps sum to under 100% so the copy can never run into the
          field, whatever the name length. */}
      <div className="relative lg:max-w-[52%]">
        <h1
          className="reveal text-balance font-bold leading-[1.02] tracking-tight text-ink"
          style={{ ["--i" as string]: 0, fontSize: "clamp(2.5rem, 5.4vw, 4.6rem)" }}
        >
          {profile.name}
        </h1>

        <p
          className="reveal mt-5 text-lg text-muted sm:text-xl lg:text-2xl"
          style={{ ["--i" as string]: 1 }}
        >
          {profile.headline}
        </p>

        <div
          className="reveal mt-8 flex flex-wrap items-center gap-3"
          style={{ ["--i" as string]: 2 }}
        >
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-email-modal"))}
            className="focus-ring inline-flex h-12 items-center rounded-lg bg-accent px-5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-strong"
          >
            Email me
          </button>
          <a
            href={profile.links.cal}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex h-12 items-center rounded-lg border border-border-strong px-5 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
          >
            Book a call
          </a>
        </div>
      </div>
    </section>
  );
}
