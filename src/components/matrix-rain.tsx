"use client";

import { useEffect, useRef } from "react";

const GLYPHS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロ0123456789".split(
    ""
  );

const FONT_SIZE = 14;
const HEIGHT = 176;

/** Classic falling-glyph rain, themed to the Gruvbox palette. */
export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const css = getComputedStyle(document.documentElement);
    const bg = css.getPropertyValue("--surface").trim() || "#282828";
    const trail = css.getPropertyValue("--p2").trim() || "#b8bb26";
    const head = css.getPropertyValue("--accent").trim() || "#fabd2f";
    const family =
      css.getPropertyValue("--font-mono").trim() || "ui-monospace, monospace";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    let width = 0;
    let cols = 0;
    let drops: number[] = [];
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const setup = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth ?? 480;
      canvas.width = width * dpr;
      canvas.height = HEIGHT * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${HEIGHT}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.floor(width / FONT_SIZE));
      drops = Array.from(
        { length: cols },
        () => -Math.floor(Math.random() * 24)
      );
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, HEIGHT);
    };
    setup();

    const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

    const frame = () => {
      // fade previous frame to leave comet trails
      ctx.globalAlpha = 0.09;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, HEIGHT);
      ctx.globalAlpha = 1;

      ctx.font = `${FONT_SIZE}px ${family}`;
      ctx.textBaseline = "top";

      for (let i = 0; i < cols; i++) {
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;

        ctx.fillStyle = head;
        ctx.fillText(glyph(), x, y);
        ctx.fillStyle = trail;
        ctx.globalAlpha = 0.7;
        ctx.fillText(glyph(), x, y - FONT_SIZE);
        ctx.globalAlpha = 1;

        if (y > HEIGHT && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    // Reduced motion: render one static frame, no loop.
    if (reduced) {
      for (let i = 0; i < 14; i++) frame();
      return;
    }

    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      // ~18fps keeps the classic chunky cadence and stays cheap
      if (t - last > 55) {
        frame();
        last = t;
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    start();

    const onVisibility = () =>
      document.visibilityState === "visible" ? start() : stop();
    document.addEventListener("visibilitychange", onVisibility);

    const ro = new ResizeObserver(() => setup());
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="my-1">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="block rounded-md border border-border"
      />
      <p className="mt-1 text-xs text-faint">
        wake up... type <span className="text-accent-strong">clear</span> to stop
      </p>
    </div>
  );
}
