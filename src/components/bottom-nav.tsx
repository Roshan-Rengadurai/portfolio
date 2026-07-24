"use client";

import {
  Home,
  Github,
  FolderGit2,
  SquareTerminal,
  Linkedin,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useView, type ViewId } from "@/components/app-shell";
import { useSound } from "@/lib/sound";
import { useMounted } from "@/lib/hooks";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";

type Tab = { id: ViewId; label: string; icon: LucideIcon };

const TABS: Tab[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "github", label: "GitHub", icon: Github },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "terminal", label: "Terminal", icon: SquareTerminal },
];

/** Icon wrapper that shows a label tooltip above on hover / focus. */
function Tip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="group relative flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 font-mono text-[11px] text-ink opacity-0 shadow-lg shadow-black/20 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}

const iconBtn =
  "focus-ring flex size-11 items-center justify-center rounded-full text-muted transition-colors hover:text-ink";

export function BottomNav() {
  const { active, setActive } = useView();
  const { play, enabled, mounted: soundMounted } = useSound();
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const { toggle: toggleSound } = useSound();

  const isDark = resolvedTheme === "dark";

  const select = (id: ViewId) => {
    if (id !== active) play("nav");
    setActive(id);
  };

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-3 z-nav flex justify-center px-3 sm:bottom-5"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center gap-0.5 rounded-full border border-border bg-surface/80 p-1 shadow-lg shadow-black/25 backdrop-blur-md">
        {/* section navigation */}
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <Tip key={tab.id} label={tab.label}>
              <button
                type="button"
                onClick={() => select(tab.id)}
                onPointerEnter={() => play("tick")}
                aria-current={isActive ? "page" : undefined}
                aria-label={tab.label}
                className={cn(
                  iconBtn,
                  "relative",
                  isActive && "text-accent-ink hover:text-accent-ink"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute inset-0 -z-10 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon
                  className="size-[18px]"
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
              </button>
            </Tip>
          );
        })}

        <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

        {/* external links + settings */}
        <Tip label="GitHub ↗">
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile (opens in new tab)"
            onPointerEnter={() => play("tick")}
            className={iconBtn}
          >
            <Github className="size-[18px]" strokeWidth={1.75} />
          </a>
        </Tip>
        <Tip label="LinkedIn ↗">
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn profile (opens in new tab)"
            onPointerEnter={() => play("tick")}
            className={iconBtn}
          >
            <Linkedin className="size-[18px]" strokeWidth={1.75} />
          </a>
        </Tip>
        <Tip label={soundMounted && !enabled ? "Sound off" : "Sound on"}>
          <button
            type="button"
            onClick={toggleSound}
            aria-label={
              soundMounted && !enabled ? "Enable sounds" : "Mute sounds"
            }
            aria-pressed={enabled}
            className={iconBtn}
          >
            {soundMounted && !enabled ? (
              <VolumeX className="size-[18px]" strokeWidth={1.75} />
            ) : (
              <Volume2 className="size-[18px]" strokeWidth={1.75} />
            )}
          </button>
        </Tip>
        <Tip label={mounted && isDark ? "Light" : "Dark"}>
          <button
            type="button"
            onClick={() => {
              play("toggle");
              setTheme(isDark ? "light" : "dark");
            }}
            aria-label={
              mounted
                ? `Switch to ${isDark ? "light" : "dark"} theme`
                : "Toggle theme"
            }
            className={iconBtn}
          >
            {mounted ? (
              isDark ? (
                <Sun className="size-[18px]" strokeWidth={1.75} />
              ) : (
                <Moon className="size-[18px]" strokeWidth={1.75} />
              )
            ) : (
              <span className="size-[18px]" />
            )}
          </button>
        </Tip>
      </div>
    </nav>
  );
}
