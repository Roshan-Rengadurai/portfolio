"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { CornerReadouts } from "@/components/hud/corner-readouts";
import { ParticleField } from "@/components/hud/particle-field";
import { BottomNav } from "@/components/bottom-nav";
import { CommandPalette } from "@/components/command-palette";
import { NavHint } from "@/components/nav-hint";
import { SoundProvider } from "@/lib/sound";

export type ViewId = "home" | "education" | "github" | "projects" | "terminal";

type ViewCtx = { active: ViewId; setActive: (v: ViewId) => void };
const ViewContext = createContext<ViewCtx | null>(null);

export function useView() {
  const ctx = useContext(ViewContext);
  if (!ctx) throw new Error("useView must be used within AppShell");
  return ctx;
}

export function AppShell({
  views,
}: {
  views: Record<ViewId, ReactNode>;
}) {
  const [active, setActive] = useState<ViewId>("home");
  const reduced = useReducedMotion();

  return (
    <ViewContext.Provider value={{ active, setActive }}>
      <SoundProvider>
      <ParticleField />

      <div className="relative z-content flex h-dvh flex-col">
        <SiteHeader />
        <CornerReadouts />

        <main className="relative flex flex-1 items-center justify-center overflow-hidden px-5 pb-28 pt-20 sm:px-8">
          <div className="flex max-h-full w-full max-w-content items-center justify-center overflow-y-auto">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                className="w-full"
                initial={
                  reduced
                    ? false
                    : { opacity: 0, y: 18, scale: 0.985, filter: "blur(8px)" }
                }
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={
                  reduced
                    ? { opacity: 0 }
                    : { opacity: 0, y: -12, scale: 0.99, filter: "blur(8px)" }
                }
                transition={{
                  duration: reduced ? 0.12 : 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {views[active]}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <BottomNav />
        <NavHint />
        <CommandPalette />
      </div>
      </SoundProvider>
    </ViewContext.Provider>
  );
}
