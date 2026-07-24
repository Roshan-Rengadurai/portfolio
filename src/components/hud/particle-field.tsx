"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks";

type Dot = { gx: number; gy: number };
type Ring = { x: number; y: number; r: number; life: number };

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let dots: Dot[] = [];
    let spacing = 30;
    let well = 210; // gravity-well radius
    const rings: Ring[] = [];
    const pointer = { x: -9999, y: -9999, active: false };

    // Colors are re-read whenever the theme class flips (see observer below).
    let bg = "#1d2021";
    let dotColor = "#504945";
    let accent = "#fabd2f";
    const readColors = () => {
      const css = getComputedStyle(document.documentElement);
      bg = css.getPropertyValue("--bg").trim() || "#1d2021";
      dotColor = css.getPropertyValue("--border-strong").trim() || "#504945";
      accent = css.getPropertyValue("--accent").trim() || "#fabd2f";
    };
    readColors();

    const build = () => {
      spacing = window.innerWidth < 640 ? 26 : 32;
      well = Math.max(170, Math.min(width, height) * 0.32);
      dots = [];
      // inset half a cell so the grid is centered and edges breathe
      const ox = (width % spacing) / 2 + spacing / 2;
      const oy = (height % spacing) / 2 + spacing / 2;
      for (let y = oy; y < height; y += spacing) {
        for (let x = ox; x < width; x += spacing) {
          dots.push({ gx: x, gy: y });
        }
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };
    resize();

    const drawStatic = () => {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = dotColor;
      ctx.globalAlpha = 0.5;
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.gx, d.gy, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const draw = (t: number) => {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      for (const d of dots) {
        // subtle ambient breathing so the grid is alive without a cursor
        const wave =
          Math.sin(d.gx * 0.012 + t * 0.9) +
          Math.cos(d.gy * 0.012 - t * 0.7);
        let x = d.gx + wave * 0.9;
        let y = d.gy + wave * 0.9;

        let influence = 0;

        // gravity well: pull dots toward the cursor with a smooth falloff
        if (pointer.active) {
          const dx = pointer.x - d.gx;
          const dy = pointer.y - d.gy;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < well) {
            const f = 1 - dist / well;
            influence = f * f;
            const pull = influence * 30;
            x += (dx / dist) * pull;
            y += (dy / dist) * pull;
          }
        }

        // click shockwaves: a moving ring of displacement + brightness
        for (const r of rings) {
          const dx = d.gx - r.x;
          const dy = d.gy - r.y;
          const dist = Math.hypot(dx, dy) || 1;
          const band = Math.abs(dist - r.r);
          if (band < 46) {
            const s = (1 - band / 46) * r.life;
            influence = Math.max(influence, s);
            const push = s * 16;
            x += (dx / dist) * push;
            y += (dy / dist) * push;
          }
        }

        const radius = 1.1 + influence * 2.2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        if (influence > 0.06) {
          ctx.fillStyle = accent;
          ctx.globalAlpha = 0.4 + influence * 0.6;
        } else {
          ctx.fillStyle = dotColor;
          ctx.globalAlpha = 0.45;
        }
        ctx.fill();
      }

      // draw + advance the shockwave rings
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.r += 7;
        r.life -= 0.018;
        if (r.life <= 0 || r.r > Math.hypot(width, height)) {
          rings.splice(i, 1);
        }
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    const loop = () => {
      draw(performance.now() / 1000);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    if (reduced) drawStatic();
    else start();

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onLeave = () => (pointer.active = false);
    const onDown = (e: PointerEvent) => {
      if (reduced) return;
      rings.push({ x: e.clientX, y: e.clientY, r: 6, life: 1 });
    };
    const onVisibility = () => {
      if (reduced) return;
      if (document.visibilityState === "visible") start();
      else stop();
    };

    const themeObserver = new MutationObserver(() => {
      readColors();
      if (reduced) drawStatic();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", resize);

    return () => {
      stop();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-particles h-full w-full"
    />
  );
}
