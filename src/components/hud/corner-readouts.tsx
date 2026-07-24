"use client";

import { useTheme } from "next-themes";
import {
  useClock,
  useFps,
  useMounted,
  usePointer,
  useViewportSize,
} from "@/lib/hooks";

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <span className="text-[10px] uppercase tracking-[0.14em] text-faint">
        {label}
      </span>
      <span className="tabular-nums text-ink/80">{value}</span>
    </span>
  );
}

const dash = "—";
const pad = (n: number) => String(n).padStart(2, "0");

export function CornerReadouts() {
  const mounted = useMounted();
  const now = useClock();
  const fps = useFps();
  const size = useViewportSize();
  const pointer = usePointer();
  const { resolvedTheme } = useTheme();

  const time = now
    ? `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    : dash;

  return (
    <div
      aria-hidden="true"
      className="hud-text pointer-events-none fixed inset-0 z-hud select-none font-mono text-xs"
    >
      {/* top-right: clock · fps · theme */}
      <div className="absolute right-3 top-3 flex flex-col items-end gap-1 sm:right-4 sm:top-4">
        <Stat label="time" value={time} />
        <div className="flex items-baseline gap-3">
          <Stat label="fps" value={mounted && fps != null ? fps : dash} />
          <Stat label="theme" value={mounted ? resolvedTheme ?? dash : dash} />
        </div>
      </div>

      {/* bottom-left: viewport · cursor (lifted above the dock on small screens) */}
      <div className="absolute bottom-20 left-3 flex flex-col gap-1 sm:bottom-4 sm:left-4">
        <Stat
          label="view"
          value={mounted && size ? `${size.w}×${size.h}` : dash}
        />
        <span className="hidden md:inline-flex">
          <Stat
            label="cur"
            value={
              mounted && pointer
                ? `${pad(pointer.x)},${pad(pointer.y)}`
                : `${dash},${dash}`
            }
          />
        </span>
      </div>
    </div>
  );
}
