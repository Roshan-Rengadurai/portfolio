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
