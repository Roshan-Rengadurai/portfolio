"use client";

import { useClock, useMounted, useViewportSize } from "@/lib/hooks";

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <span className="text-[9px] uppercase tracking-[0.08em] text-faint">
        {label}
      </span>
      <span className="tabular-nums text-faint">{value}</span>
    </span>
  );
}

const dash = "-";
const pad = (n: number) => String(n).padStart(2, "0");

export function CornerReadouts() {
  const mounted = useMounted();
  const now = useClock();
  const size = useViewportSize();

  const time = now
    ? `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    : dash;

  return (
    <div
      aria-hidden="true"
      className="hud-text pointer-events-none fixed inset-0 z-hud select-none font-mono text-[11px] opacity-70"
    >
      <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
        <Stat label="time" value={time} />
      </div>

      {/* lifted above the dock on small screens */}
      <div className="absolute bottom-20 left-3 sm:bottom-4 sm:left-4">
        <Stat
          label="view"
          value={mounted && size ? `${size.w}×${size.h}` : dash}
        />
      </div>
    </div>
  );
}
