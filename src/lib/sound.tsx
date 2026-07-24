"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type SoundKind = "tick" | "nav" | "key" | "toggle";

type SoundCtx = {
  enabled: boolean;
  mounted: boolean;
  toggle: () => void;
  play: (kind: SoundKind) => void;
};

const Ctx = createContext<SoundCtx | null>(null);
const STORAGE_KEY = "sound-enabled";

export function useSound() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSound must be used within SoundProvider");
  return ctx;
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
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
      audioRef.current = new AC();
    }
    if (audioRef.current.state === "suspended") audioRef.current.resume();
    return audioRef.current;
  }, []);

  const tone = useCallback(
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
      g.gain.linearRampToValueAtTime(gain, t0 + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g).connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    },
    [ensureCtx]
  );

  const play = useCallback(
    (kind: SoundKind) => {
      if (!enabledRef.current) return;
      switch (kind) {
        case "tick":
          tone(1400 + Math.random() * 500, 0.028, 0.02, "sine");
          break;
        case "nav":
          tone(540, 0.07, 0.045, "sine", 820);
          break;
        case "key":
          tone(300 + Math.random() * 90, 0.022, 0.028, "triangle");
          break;
        case "toggle":
          tone(420, 0.12, 0.05, "sine", 700);
          break;
      }
    },
    [tone]
  );

  // trysnick-style "scroll sound": a soft tick as the wheel turns (throttled).
  useEffect(() => {
    const onWheel = () => {
      if (!enabledRef.current) return;
      const now = performance.now();
      if (now - lastTick.current < 85) return;
      lastTick.current = now;
      tone(900 + Math.random() * 700, 0.02, 0.014, "sine");
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [tone]);

  const toggle = useCallback(() => {
    ensureCtx();
    setEnabled((e) => {
      const next = !e;
      if (next) tone(420, 0.12, 0.05, "sine", 700);
      return next;
    });
  }, [ensureCtx, tone]);

  return (
    <Ctx.Provider value={{ enabled, mounted, toggle, play }}>
      {children}
    </Ctx.Provider>
  );
}
