"use client";

import { useEffect, useRef } from "react";

/**
 * A fluid ASCII field: a domain-warped scalar field sampled on a character
 * grid, so the glyphs read as smoke or flame curling in place.
 *
 * Rendered to a canvas rather than DOM text, and drawn one `fillText` per
 * (row, colour bucket) instead of one per cell, so a ~70x46 grid costs a few
 * hundred draw calls a frame. The loop is a bare `requestAnimationFrame` with
 * no throttling, so it runs at whatever the display offers (120Hz on
 * ProMotion). It parks itself when scrolled out of view or the tab is hidden,
 * and renders a single still frame under `prefers-reduced-motion`.
 */

// Low-to-high density. Leading space means "empty", which keeps the field airy.
const RAMP = " .:-=+*oO#@";
const CELL_W = 8.5;
const CELL_H = 14;
/** Grid cell -> field-space units. Lower = larger, softer structures. */
const SCALE = 0.42;

export function AsciiFlow({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cols = 0;
    let rows = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    // Grid centre in field units. Derived from the grid in `layout` so the
    // radial term stays concentric with the elliptical falloff at any size;
    // hard-coding it puts the rings off-centre and the mass reads lopsided.
    let fcx = 0;
    let fcy = 0;

    // Three colour buckets: dim body, mid, hot core.
    let colors = ["#7c6f64", "#fabd2f", "#fe8019"];
    const readColors = () => {
      const css = getComputedStyle(document.documentElement);
      const pick = (name: string, fallback: string) =>
        css.getPropertyValue(name).trim() || fallback;
      colors = [
        pick("--border-strong", "#7c6f64"),
        pick("--accent", "#fabd2f"),
        pick("--accent-strong", "#fe8019"),
      ];
    };
    readColors();

    // Reused per row so the render loop allocates nothing.
    let rowChars: string[][] = [];

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.max(1, Math.floor(width / CELL_W));
      rows = Math.max(1, Math.floor(height / CELL_H));
      fcx = (cols * SCALE) / 2;
      fcy = (rows * SCALE) / 2;

      rowChars = Array.from({ length: colors.length }, () =>
        new Array<string>(cols).fill(" ")
      );

      const family =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--font-mono")
          .trim() || "ui-monospace";
      ctx.font = `${CELL_H - 2}px ${family}, ui-monospace, monospace`;
      ctx.textBaseline = "top";
    };

    /**
     * Sum-of-sines scalar field in [-1, 1]. Cheap enough to sample twice per
     * cell, which is what buys the domain warp (and with it the curling,
     * fluid motion rather than a sliding plaid).
     */
    const field = (x: number, y: number, t: number) => {
      const dx = x - fcx;
      const dy = y - fcy;
      return (
        (Math.sin(x * 0.19 + t * 0.9) +
          Math.sin(y * 0.27 - t * 0.65) +
          Math.sin((x + y) * 0.13 + t * 0.8) +
          Math.sin(Math.sqrt(dx * dx + dy * dy) * 0.33 - t * 1.15)) *
        0.25
      );
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      const last = RAMP.length - 1;

      for (let r = 0; r < rows; r++) {
        for (let b = 0; b < colors.length; b++) rowChars[b].fill(" ");

        // Elliptical falloff from the panel centre, so the mass sits in the
        // middle of the column and frays at the edges instead of hitting them.
        const ny = (r / rows - 0.5) * 2;
        const fy = ny * ny;

        for (let c = 0; c < cols; c++) {
          const x = c * SCALE;
          const y = r * SCALE;

          const w = field(x, y, t);
          // Warp the sample point by the field itself, with a slow upward
          // drift so the structure rises as it churns.
          let v = field(x + w * 4.0, y + w * 4.0 - t * 0.9, t * 0.55);

          const nx = (c / cols - 0.5) * 2;
          const falloff = 1 - Math.min(1, (nx * nx * 0.78 + fy * 0.92) * 0.9);
          if (falloff <= 0) continue;

          v = (v + 1) * 0.5;
          v = v * v * (3 - 2 * v); // smoothstep: pushes mids apart
          v *= falloff;
          if (v <= 0.08) continue;

          const idx = Math.min(last, (v * last * 1.9) | 0);
          if (idx === 0) continue;

          const bucket = idx > last * 0.66 ? 2 : idx > last * 0.36 ? 1 : 0;
          rowChars[bucket][c] = RAMP[idx];
        }

        const y = r * CELL_H;
        for (let b = 0; b < colors.length; b++) {
          const line = rowChars[b].join("");
          if (!line.trim()) continue;
          ctx.fillStyle = colors[b];
          ctx.globalAlpha = b === 0 ? 0.45 : b === 1 ? 0.8 : 1;
          ctx.fillText(line, 0, y);
        }
      }
      ctx.globalAlpha = 1;
    };

    layout();

    let raf = 0;
    let onScreen = true;
    const start0 = performance.now();

    const loop = () => {
      draw((performance.now() - start0) / 1000);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && !reduced) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const sync = () => {
      if (onScreen && document.visibilityState === "visible") start();
      else stop();
    };

    if (reduced) draw(0);
    else start();

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      layout();
      if (reduced) draw(0);
    });
    ro.observe(canvas);

    const themeObserver = new MutationObserver(() => {
      readColors();
      if (reduced) draw(0);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    document.addEventListener("visibilitychange", sync);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
