"use client";

import { profile } from "@/data/profile";
import { useView } from "@/components/app-shell";
import { useSound } from "@/lib/sound";

export function Hero() {
  const { setActive } = useView();
  const { play } = useSound();
  const [first, ...rest] = profile.name.split(" ");
  const last = rest.join(" ");

  return (
    <section id="home" className="w-full">
      <p className="reveal font-mono text-sm text-accent-strong" style={{ ["--i" as string]: 0 }}>
        <span className="text-faint">$</span> whoami
      </p>

      <h1
        className="reveal mt-4 text-balance font-semibold leading-[0.95] tracking-tight text-ink"
        style={{ ["--i" as string]: 1, fontSize: "clamp(2.75rem, 9vw, 5.5rem)" }}
      >
        {first}
        <br />
        <span className="text-muted">{last}</span>
      </h1>

      <p
        className="reveal mt-6 max-w-[46ch] text-pretty text-lg leading-relaxed text-muted sm:text-xl"
        style={{ ["--i" as string]: 2 }}
      >
        {profile.headline}
      </p>

      <div
        className="reveal mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-faint"
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
          onClick={() => {
            play("nav");
            setActive("terminal");
          }}
          className="focus-ring hidden text-muted transition-colors hover:text-accent-strong sm:inline"
        >
          or open the terminal, it&apos;s real →
        </button>
      </div>
    </section>
  );
}
