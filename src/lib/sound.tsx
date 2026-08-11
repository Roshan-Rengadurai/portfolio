"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type SoundKind = "tap" | "tick" | "nav" | "key" | "toggle";

type SoundCtx = {
  enabled: boolean;
  mounted: boolean;
  toggle: () => void;
  play: (kind: SoundKind) => void;
};

const Ctx = createContext<SoundCtx | null>(null);
const STORAGE_KEY = "sound-enabled";

/** Elements that thock when pressed. */
const INTERACTIVE =
  'a[href], button, [role="button"], input, select, textarea, label, summary';

/**
 * Elements that tick on hover — controls only. Text fields and their labels
 * are deliberately excluded: they cover large areas (the terminal prompt spans
 * the whole panel), so ticking on them turns into constant noise.
 */
const HOVERABLE = 'a[href], button, [role="button"], summary';

export function useSound() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSound must be used within SoundProvider");
  return ctx;
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const noiseRef = useRef<AudioBuffer | null>(null);
  const lastTick = useRef(0);
  const enabledRef = useRef(true);

  // Restore preference.
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved != null) setEnabled(saved === "true");
  }, []);

  useEffect(() => {
    enabledRef.current = enabled;
    if (mounted) localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled, mounted]);

  const ensureCtx = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      const ac = new AC();
      audioRef.current = ac;

      // Master bus: a gentle compressor keeps things punchy and lets the
      // sounds sit loud without harsh clipping — key to the "thock".
      const comp = ac.createDynamicsCompressor();
      comp.threshold.value = -20;
      comp.knee.value = 18;
      comp.ratio.value = 6;
      comp.attack.value = 0.003;
      comp.release.value = 0.15;
      const master = ac.createGain();
      master.gain.value = 1;
      master.connect(comp).connect(ac.destination);
      masterRef.current = master;
    }
    if (audioRef.current.state === "suspended") {
      audioRef.current.resume().catch(() => {});
    }
    return audioRef.current;
  }, []);

  // Unlock audio on the very first trusted gesture anywhere on the page.
  // Browsers only allow AudioContext.resume() to succeed inside a genuine
  // user gesture (pointerdown / keydown / touchstart) — hover doesn't count,
  // and most of this page (particle field, hero text) isn't a button/link,
  // so without this, the first real gesture that happens to land on a
  // control is the earliest point sound could ever start. Unconditional and
  // selector-independent on purpose: it must fire on literally any first
  // click or keypress, not just ones that land on interactive elements.
  useEffect(() => {
    const unlock = () => {
      ensureCtx();
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      window.removeEventListener("touchstart", unlock, true);
    };
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
    window.addEventListener("touchstart", unlock, true);
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      window.removeEventListener("touchstart", unlock, true);
    };
  }, [ensureCtx]);

  /** A short reusable white-noise buffer, built once, for click transients. */
  const noiseBuffer = useCallback((ac: AudioContext) => {
    if (!noiseRef.current) {
      const len = Math.floor(ac.sampleRate * 0.12);
      const buf = ac.createBuffer(1, len, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      noiseRef.current = buf;
    }
    return noiseRef.current;
  }, []);

  /**
   * Pitched "body" with a downward glide — the deep, resonant thock.
   * Soft linear attack (no click) into an exponential decay.
   */
  const blip = useCallback(
    (
      freq: number,
      dur: number,
      gain: number,
      type: OscillatorType = "sine",
      slideTo?: number
    ) => {
      const ac = ensureCtx();
      if (!ac) return;
      const t0 = ac.currentTime;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(gain, t0 + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g).connect(masterRef.current ?? ac.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    },
    [ensureCtx]
  );

  /** A brief low-passed noise burst — the physical knock at the attack. */
  const noise = useCallback(
    (dur: number, gain: number, cutoff: number) => {
      const ac = ensureCtx();
      if (!ac) return;
      const t0 = ac.currentTime;
      const src = ac.createBufferSource();
      src.buffer = noiseBuffer(ac);
      const lp = ac.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = cutoff;
      const g = ac.createGain();
      g.gain.setValueAtTime(gain, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(lp).connect(g).connect(masterRef.current ?? ac.destination);
      src.start(t0);
      src.stop(t0 + dur + 0.01);
    },
    [ensureCtx, noiseBuffer]
  );

  const play = useCallback(
    (kind: SoundKind) => {
      if (!enabledRef.current) return;
      switch (kind) {
        // press: a dull low knock + a deep triangle body that drops in pitch —
        // hollow and resonant, i.e. thocky
        case "tap":
          noise(0.014, 0.09, 1000);
          blip(165, 0.14, 0.11, "triangle", 58);
          break;
        // hover: a lighter, deep tactile tick (fires on every hover, so subtle)
        case "tick":
          noise(0.005, 0.03, 900);
          blip(150, 0.035, 0.04, "sine", 115);
          break;
        // command run / view change: a fuller, deeper thock
        case "nav":
          noise(0.013, 0.085, 1050);
          blip(200, 0.15, 0.11, "triangle", 78);
          break;
        // keystroke: short deep mechanical thock
        case "key":
          noise(0.006, 0.06, 1100);
          blip(150, 0.06, 0.07, "triangle", 95);
          break;
        // toggle: a deep thunk that rises for the "on" feel
        case "toggle":
          noise(0.01, 0.075, 1100);
          blip(130, 0.18, 0.1, "sine", 210);
          break;
      }
    },
    [noise, blip]
  );

  // Scroll: a soft, deep tick as the wheel turns (throttled).
  useEffect(() => {
    const onWheel = () => {
      if (!enabledRef.current) return;
      const now = performance.now();
      if (now - lastTick.current < 90) return;
      lastTick.current = now;
      blip(140 + Math.random() * 60, 0.03, 0.018, "sine");
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [blip]);

  // Universal tactile press: any button / link / control thocks on press.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!enabledRef.current) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      const el = target.closest(INTERACTIVE);
      if (!el) return;
      if (
        el.hasAttribute("disabled") ||
        el.getAttribute("aria-disabled") === "true"
      )
        return;
      play("tap");
    };
    window.addEventListener("pointerdown", onDown, { capture: true });
    return () =>
      window.removeEventListener("pointerdown", onDown, { capture: true });
  }, [play]);

  // Universal tactile hover: a light tick when the pointer enters a new
  // interactive element (only on real hover devices, so touch stays quiet).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    let last: Element | null = null;
    const onOver = (e: PointerEvent) => {
      if (!enabledRef.current) return;
      const target = e.target;
      const el = target instanceof Element ? target.closest(HOVERABLE) : null;
      if (el === last) return;
      last = el;
      if (
        el &&
        !el.hasAttribute("disabled") &&
        el.getAttribute("aria-disabled") !== "true"
      ) {
        play("tick");
      }
    };
    window.addEventListener("pointerover", onOver);
    return () => window.removeEventListener("pointerover", onOver);
  }, [play]);

  const toggle = useCallback(() => {
    ensureCtx();
    setEnabled((prev) => {
      const next = !prev;
      if (next) {
        noise(0.01, 0.075, 1100);
        blip(130, 0.18, 0.1, "sine", 220);
      }
      return next;
    });
  }, [ensureCtx, noise, blip]);

  return (
    <Ctx.Provider value={{ enabled, mounted, toggle, play }}>
      {children}
    </Ctx.Provider>
  );
}
