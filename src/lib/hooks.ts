"use client";

import { useEffect, useRef, useState } from "react";

/** True only after mount — guards against hydration mismatches for live data. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/** Ticks once per second. */
export function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** Current viewport size, updated on resize (rAF-throttled). */
export function useViewportSize() {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setSize({ w: window.innerWidth, h: window.innerHeight })
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
    };
  }, []);
  return size;
}

export type GithubStats = {
  followers: number;
  repos: number;
  stars: number;
  lastPush: string | null;
};

/** Fetches live GitHub stats from our cached API route (once, on mount). */
export function useGithubStats() {
  const [stats, setStats] = useState<GithubStats | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/github")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: GithubStats | null) => {
        if (alive && data && typeof data.followers === "number") setStats(data);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return stats;
}

/** Respects the OS "reduce motion" preference and reacts to changes. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** Scroll-spy: returns the id of the section currently in view. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

/**
 * Runs a callback each animation frame, but only while `element` is on screen
 * and the tab is visible. Returns nothing; wire your canvas draw loop through it.
 */
export function useVisibleRaf(
  elementRef: React.RefObject<HTMLElement>,
  callback: (dt: number) => void,
  enabled = true
) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!enabled) return;
    const el = elementRef.current;
    if (!el) return;

    let raf = 0;
    let last = performance.now();
    let onScreen = false;

    const loop = (t: number) => {
      const dt = Math.min(t - last, 50);
      last = t;
      cbRef.current(dt);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const sync = () => {
      if (onScreen && document.visibilityState === "visible") start();
      else stop();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 }
    );
    io.observe(el);
    document.addEventListener("visibilitychange", sync);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [elementRef, enabled]);
}

/**
 * Cursor-magnetism for a group of elements inside `containerRef`: elements
 * marked `data-magnetic` lean gently toward the pointer within `radius` and
 * spring back to rest once it leaves. Same imperative rAF-lerp technique as
 * the hero title's letter warp (direct transform, no React state) so the
 * "the interface leans toward you" language shows up in the dock too.
 */
export function useMagnetic(
  containerRef: React.RefObject<HTMLElement>,
  {
    radius = 70,
    max = 6,
    enabled = true,
  }: { radius?: number; max?: number; enabled?: boolean } = {}
) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !enabled) return;
    const container = containerRef.current;
    if (!container) return;
    const els = Array.from(
      container.querySelectorAll<HTMLElement>("[data-magnetic]")
    );
    const n = els.length;
    if (!n) return;

    const curX = new Float32Array(n);
    const curY = new Float32Array(n);
    const pointer = { x: -9999, y: -9999, active: false };
    const K = 0.22; // lerp toward target

    let raf = 0;
    const frame = () => {
      for (let i = 0; i < n; i++) {
        const r = els[i].getBoundingClientRect();
        const cx = r.left + r.width / 2 - curX[i];
        const cy = r.top + r.height / 2 - curY[i];

        let tx = 0;
        let ty = 0;
        if (pointer.active) {
          const dx = pointer.x - cx;
          const dy = pointer.y - cy;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < radius) {
            const f = 1 - dist / radius;
            const ff = f * f;
            tx = (dx / dist) * ff * max;
            ty = (dy / dist) * ff * max;
          }
        }

        curX[i] += (tx - curX[i]) * K;
        curY[i] += (ty - curY[i]) * K;
        els[i].style.transform = `translate(${curX[i].toFixed(2)}px, ${curY[
          i
        ].toFixed(2)}px)`;
      }
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onLeave = () => (pointer.active = false);

    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
    };
  }, [containerRef, reduced, enabled, radius, max]);
}
