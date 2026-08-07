"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks";

/**
 * The hero name, rendered per-letter so the cursor can gently "warp" it.
 * Letters are repelled from the pointer with a soft falloff, rAF-lerped for
 * smoothness, and spring back to rest when the pointer leaves. Transform-only
 * (no blur / no color shift) so the text stays crisp and readable. Scoped to
 * the title alone — nothing else on the page reacts.
 */
export function HeroTitle({
  first,
  last,
  className,
  style,
}: {
  first: string;
  last: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    if (!root) return;
    // Leaf spans are the individual letters (the only nested span is the
    // muted wrapper around the surname, which has element children).
    const els = Array.from(root.querySelectorAll<HTMLSpanElement>("span")).filter(
      (el) => el.childElementCount === 0
    );
    const n = els.length;
    if (!n) return;

    const curX = new Float32Array(n);
    const curY = new Float32Array(n);
    const curS = new Float32Array(n);
    const pointer = { x: -9999, y: -9999, active: false };

    const R = 150; // influence radius (px)
    const MAX = 9; // max letter shift (px) — small, stays legible
    const K = 0.18; // lerp toward target

    let raf = 0;
    const frame = () => {
      for (let i = 0; i < n; i++) {
        const r = els[i].getBoundingClientRect();
        // rest center = live center minus the offset we're currently applying
        const cx = r.left + r.width / 2 - curX[i];
        const cy = r.top + r.height / 2 - curY[i];

        let tx = 0;
        let ty = 0;
        let ts = 0;
        if (pointer.active) {
          const dx = cx - pointer.x;
          const dy = cy - pointer.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < R) {
            const f = 1 - dist / R;
            const ff = f * f;
            tx = (dx / dist) * ff * MAX;
            ty = (dy / dist) * ff * MAX;
            ts = ff * 0.12;
          }
        }

        curX[i] += (tx - curX[i]) * K;
        curY[i] += (ty - curY[i]) * K;
        curS[i] += (ts - curS[i]) * K;

        els[i].style.transform = `translate(${curX[i].toFixed(2)}px,${curY[
          i
        ].toFixed(2)}px) scale(${(1 + curS[i]).toFixed(3)})`;
      }
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onLeave = () => (pointer.active = false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  const split = (text: string) =>
    Array.from(text).map((ch, i) => (
      <span
        key={i}
        data-letter=""
        style={{ display: "inline-block", willChange: "transform" }}
      >
        {ch === " " ? " " : ch}
      </span>
    ));

  return (
    <h1 ref={rootRef} className={className} style={style}>
      {split(first)}
      <br />
      <span className="text-muted">{split(last)}</span>
    </h1>
  );
}
