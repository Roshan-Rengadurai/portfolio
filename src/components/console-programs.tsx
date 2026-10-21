"use client";

import { useEffect, useRef } from "react";

/**
 * Full-screen console programs. Each factory takes the character grid size and
 * returns a frame function producing the screen as an HTML string (only fixed
 * glyphs and our own class names, so it is safe for innerHTML).
 */

export type ProgramName = "cmatrix" | "fluid" | "life" | "donut";

type Frame = (t: number, dt: number) => string;
type Factory = (cols: number, rows: number) => Frame;

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

// ---------------------------------------------------------------- cmatrix

const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789@#$%*+=-:;";
const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

const cmatrix: Factory = (cols, rows) => {
  const spawn = (initial: boolean) => ({
    y: initial ? -Math.random() * rows * 2 : -Math.random() * rows * 0.5,
    speed: 6 + Math.random() * 14,
    len: 5 + ((Math.random() * rows) | 0),
  });
  const drops = Array.from({ length: cols }, () => spawn(true));
  const grid = Array.from({ length: cols * rows }, glyph);

  return (_t, dt) => {
    for (let i = 0; i < grid.length; i++) {
      if (Math.random() < 0.02) grid[i] = glyph();
    }
    for (let c = 0; c < cols; c++) {
      const d = drops[c];
      d.y += d.speed * dt;
      if (d.y - d.len > rows) drops[c] = spawn(false);
    }

    const out: string[] = [];
    for (let r = 0; r < rows; r++) {
      let line = "";
      for (let c = 0; c < cols; c++) {
        const d = drops[c];
        const depth = Math.floor(d.y) - r;
        if (depth < 0 || depth >= d.len) {
          line += " ";
          continue;
        }
        const ch = grid[r * cols + c];
        if (depth === 0) line += `<span class="text-ink">${ch}</span>`;
        else if (depth < d.len * 0.35)
          line += `<span class="text-accent-strong">${ch}</span>`;
        else if (depth < d.len * 0.7)
          line += `<span class="text-accent">${ch}</span>`;
        else line += `<span class="text-faint">${ch}</span>`;
      }
      out.push(line);
    }
    return out.join("\n");
  };
};

// ----------------------------------------------------------------- fluid

const SMOKE = " .:-=+*#%@";

/**
 * Stam-style "stable fluids": semi-Lagrangian advection of velocity and
 * density, with a Jacobi pressure solve to keep the velocity field
 * divergence-free. The sim grid is twice as tall as the screen so cells are
 * square; pairs of rows are averaged into one character.
 */
const fluid: Factory = (cols, rows) => {
  const W = cols;
  const H = rows * 2;
  const N = W * H;
  const mk = () => new Float32Array(N);
  let u = mk(), v = mk(), u0 = mk(), v0 = mk();
  let d = mk(), d0 = mk();
  const p = mk(), div = mk();

  const sample = (a: Float32Array, x: number, y: number) => {
    x = clamp(x, 0, W - 1.001);
    y = clamp(y, 0, H - 1.001);
    const i = x | 0;
    const j = y | 0;
    const fx = x - i;
    const fy = y - j;
    const k = j * W + i;
    return (
      (a[k] * (1 - fx) + a[k + 1] * fx) * (1 - fy) +
      (a[k + W] * (1 - fx) + a[k + W + 1] * fx) * fy
    );
  };

  const advect = (
    dst: Float32Array,
    src: Float32Array,
    vx: Float32Array,
    vy: Float32Array
  ) => {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const k = y * W + x;
        dst[k] = sample(src, x - vx[k], y - vy[k]);
      }
    }
  };

  const project = () => {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const k = y * W + x;
        const xl = x > 0 ? k - 1 : k;
        const xr = x < W - 1 ? k + 1 : k;
        const yu = y > 0 ? k - W : k;
        const yd = y < H - 1 ? k + W : k;
        div[k] = -0.5 * (u[xr] - u[xl] + v[yd] - v[yu]);
        p[k] = 0;
      }
    }
    for (let it = 0; it < 18; it++) {
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const k = y * W + x;
          const xl = x > 0 ? k - 1 : k;
          const xr = x < W - 1 ? k + 1 : k;
          const yu = y > 0 ? k - W : k;
          const yd = y < H - 1 ? k + W : k;
          p[k] = (div[k] + p[xl] + p[xr] + p[yu] + p[yd]) * 0.25;
        }
      }
    }
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const k = y * W + x;
        const xl = x > 0 ? k - 1 : k;
        const xr = x < W - 1 ? k + 1 : k;
        const yu = y > 0 ? k - W : k;
        const yd = y < H - 1 ? k + W : k;
        u[k] -= 0.5 * (p[xr] - p[xl]);
        v[k] -= 0.5 * (p[yd] - p[yu]);
      }
    }
  };

  const splat = (cx: number, cy: number, radius: number, fn: (k: number, w: number) => void) => {
    const r2 = radius * radius;
    for (let y = Math.max(0, Math.floor(cy - radius)); y <= Math.min(H - 1, Math.ceil(cy + radius)); y++) {
      for (let x = Math.max(0, Math.floor(cx - radius)); x <= Math.min(W - 1, Math.ceil(cx + radius)); x++) {
        const dd = (x - cx) * (x - cx) + (y - cy) * (y - cy);
        if (dd < r2) fn(y * W + x, 1 - dd / r2);
      }
    }
  };

  return (t) => {
    // Two orbiting emitters that blow smoke upward and into each other.
    const radius = Math.max(2, W / 16);
    for (const [phase, dir] of [[0, 1], [Math.PI, -1]] as const) {
      const a = t * 0.8 + phase;
      const cx = W / 2 + Math.cos(a) * W * 0.3;
      const cy = H * 0.9 + Math.sin(a * 1.7) * H * 0.04;
      splat(cx, cy, radius, (k, w) => {
        d[k] = Math.min(1, d[k] + w * 0.1);
        v[k] -= w * 0.12;
        u[k] += w * 0.1 * dir * Math.sin(t * 2 + phase);
      });
    }

    // Buoyancy plus a gentle crosswind so the plume keeps curling.
    for (let y = 0; y < H; y++) {
      const wind = Math.sin(t * 0.9 + y * 0.25) * 0.012;
      for (let x = 0; x < W; x++) {
        const k = y * W + x;
        v[k] -= d[k] * 0.012;
        u[k] += wind;
      }
    }

    advect(u0, u, u, v);
    advect(v0, v, u, v);
    [u, u0] = [u0, u];
    [v, v0] = [v0, v];
    project();
    advect(d0, d, u, v);
    [d, d0] = [d0, d];

    for (let k = 0; k < N; k++) {
      d[k] *= 0.972;
      u[k] *= 0.985;
      v[k] *= 0.985;
    }

    const last = SMOKE.length - 1;
    const out: string[] = [];
    for (let r = 0; r < rows; r++) {
      let line = "";
      for (let c = 0; c < cols; c++) {
        const k = r * 2 * W + c;
        const val = (d[k] + d[k + W]) * 0.5;
        line += SMOKE[Math.min(last, (val * last * 1.4) | 0)];
      }
      out.push(`<span class="text-accent-strong">${line}</span>`);
    }
    return out.join("\n");
  };
};

// ------------------------------------------------------------------ life

const life: Factory = (cols, rows) => {
  const size = cols * rows;
  let cells = new Uint8Array(size);
  let next = new Uint8Array(size);
  let acc = 0;
  let gen = 0;
  let stale = 0;
  let prevPop = -1;
  let prevPop2 = -1;

  const seed = () => {
    for (let i = 0; i < size; i++) cells[i] = Math.random() < 0.25 ? 1 : 0;
    stale = 0;
    gen = 0;
  };
  seed();

  const step = () => {
    let pop = 0;
    for (let r = 0; r < rows; r++) {
      const up = ((r + rows - 1) % rows) * cols;
      const mid = r * cols;
      const dn = ((r + 1) % rows) * cols;
      for (let c = 0; c < cols; c++) {
        const l = (c + cols - 1) % cols;
        const rt = (c + 1) % cols;
        const n =
          cells[up + l] + cells[up + c] + cells[up + rt] +
          cells[mid + l] + cells[mid + rt] +
          cells[dn + l] + cells[dn + c] + cells[dn + rt];
        const alive = cells[mid + c] ? n === 2 || n === 3 : n === 3;
        next[mid + c] = alive ? 1 : 0;
        pop += next[mid + c];
      }
    }
    [cells, next] = [next, cells];
    gen++;
    // Reseed once the population has settled into a still life or short cycle.
    stale = pop === prevPop || pop === prevPop2 ? stale + 1 : 0;
    prevPop2 = prevPop;
    prevPop = pop;
    if (stale > 25 || pop === 0) seed();
  };

  return (_t, dt) => {
    acc += dt;
    while (acc > 0.09) {
      acc -= 0.09;
      step();
    }
    const out: string[] = [];
    for (let r = 0; r < rows; r++) {
      let line = "";
      for (let c = 0; c < cols; c++) line += cells[r * cols + c] ? "o" : " ";
      out.push(line);
    }
    return `<span class="text-accent-strong">${out.join("\n")}</span>`;
  };
};

// ----------------------------------------------------------------- donut

const LUMA = ".,-~:;=!*#$@";

/** The classic spinning torus, ray-free: project points, keep the nearest. */
const donut: Factory = (cols, rows) => {
  const ky = rows * 0.68;
  const kx = Math.min(cols * 0.375, ky * 2);
  const buf = new Array<string>(cols * rows);
  const zbuf = new Float32Array(cols * rows);

  return (t) => {
    const A = t * 0.9;
    const B = t * 0.5;
    buf.fill(" ");
    zbuf.fill(0);
    const sinA = Math.sin(A), cosA = Math.cos(A);
    const sinB = Math.sin(B), cosB = Math.cos(B);

    for (let j = 0; j < 6.28; j += 0.07) {
      const ct = Math.cos(j), st = Math.sin(j);
      for (let i = 0; i < 6.28; i += 0.02) {
        const sp = Math.sin(i), cp = Math.cos(i);
        const h = ct + 2;
        const D = 1 / (sp * h * sinA + st * cosA + 5);
        const tt = sp * h * cosA - st * sinA;
        const x = (cols / 2 + kx * D * (cp * h * cosB - tt * sinB)) | 0;
        const y = (rows / 2 + ky * D * (cp * h * sinB + tt * cosB)) | 0;
        if (x < 0 || x >= cols || y < 0 || y >= rows) continue;
        const o = x + cols * y;
        if (D > zbuf[o]) {
          zbuf[o] = D;
          const L =
            8 * ((st * sinA - sp * ct * cosA) * cosB - sp * ct * sinA - st * cosA - cp * ct * sinB);
          buf[o] = LUMA[L > 0 ? Math.min(LUMA.length - 1, L | 0) : 0];
        }
      }
    }

    const out: string[] = [];
    for (let r = 0; r < rows; r++) out.push(buf.slice(r * cols, (r + 1) * cols).join(""));
    return `<span class="text-accent-strong">${out.join("\n")}</span>`;
  };
};

const FACTORIES: Record<ProgramName, Factory> = { cmatrix, fluid, life, donut };

// ------------------------------------------------------------------ view

const PROBE = "MMMMMMMMMM";
const MIN_FRAME_MS = 33;

export function ProgramView({
  name,
  onExit,
}: {
  name: ProgramName;
  onExit: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const pre = preRef.current;
    const probe = probeRef.current;
    if (!box || !pre || !probe) return;

    const cw = probe.getBoundingClientRect().width / PROBE.length;
    const lh = parseFloat(getComputedStyle(pre).lineHeight) || 17;
    const cols = Math.max(10, Math.floor((box.clientWidth - 32) / cw));
    // One row is reserved for the "q to quit" hint.
    const rows = Math.max(5, Math.floor((box.clientHeight - 32) / lh) - 1);

    const frame = FACTORIES[name](cols, rows);
    const start = performance.now();
    let lastDraw = start;
    let raf = 0;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - lastDraw < MIN_FRAME_MS) return;
      const dt = Math.min(0.1, (now - lastDraw) / 1000);
      lastDraw = now;
      pre.innerHTML = frame((now - start) / 1000, dt);
    };
    raf = requestAnimationFrame(loop);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "q" || e.key === "Q" || (e.ctrlKey && e.key === "c")) {
        e.preventDefault();
        onExit();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, [name, onExit]);

  return (
    <div
      ref={boxRef}
      onClick={onExit}
      className="relative h-[min(50vh,320px)] cursor-pointer select-none overflow-hidden p-4 text-sm"
    >
      <span
        ref={probeRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-0 top-0 whitespace-pre"
      >
        {PROBE}
      </span>
      <pre ref={preRef} aria-hidden="true" className="whitespace-pre leading-[1.2]" />
      <div className="absolute bottom-2 left-4 text-xs text-faint">
        press q, ctrl+c, or tap to exit
      </div>
    </div>
  );
}
