"use client";

import { useRef } from "react";
import {
  Home,
  GraduationCap,
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
import { useMagnetic, useMounted } from "@/lib/hooks";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";

type Tab = { id: ViewId; label: string; icon: LucideIcon };

const TABS: Tab[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "github", label: "GitHub", icon: Github },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "terminal", label: "Terminal", icon: SquareTerminal },
];

/** Icon wrapper that shows a label tooltip above on hover / focus. */
function Tip({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("group relative flex", className)}>
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

// 44px on mobile (touch minimum, and keeps the dock inside a 375px viewport);
// a little roomier from sm up, where there's space for it.
const iconBtn =
  "focus-ring flex size-11 sm:size-12 items-center justify-center rounded-full text-muted transition-[color,transform] duration-100 hover:text-ink active:scale-90";

const iconSize = "size-[18px] sm:size-5";

export function BottomNav() {
  const { active, setActive } = useView();
  const { enabled, mounted: soundMounted } = useSound();
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const { toggle: toggleSound } = useSound();
  const dockRef = useRef<HTMLDivElement>(null);
  useMagnetic(dockRef, { radius: 64, max: 5, enabled: mounted });

  const isDark = resolvedTheme === "dark";

  const select = (id: ViewId) => {
    setActive(id);
  };

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-3 z-nav flex justify-center px-3 sm:bottom-5"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div
        ref={dockRef}
        className="glass flex items-center gap-0.5 rounded-full p-1 sm:gap-1 sm:p-1.5"
      >
        {/* section navigation */}
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <Tip key={tab.id} label={tab.label}>
              <button
                type="button"
                onClick={() => select(tab.id)}
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
                  data-magnetic
                  className={iconSize}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
              </button>
            </Tip>
          );
        })}

        <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

        {/* external links (hidden on small screens — reachable via ⌘K) + settings */}
        <Tip label="GitHub ↗" className="hidden sm:flex">
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile (opens in new tab)"
            className={iconBtn}
          >
            <Github data-magnetic className={iconSize} strokeWidth={1.75} />
          </a>
        </Tip>
        <Tip label="LinkedIn ↗" className="hidden sm:flex">
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn profile (opens in new tab)"
            className={iconBtn}
          >
            <Linkedin data-magnetic className={iconSize} strokeWidth={1.75} />
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
              <VolumeX data-magnetic className={iconSize} strokeWidth={1.75} />
            ) : (
              <Volume2 data-magnetic className={iconSize} strokeWidth={1.75} />
            )}
          </button>
        </Tip>
        <Tip label={mounted && isDark ? "Light" : "Dark"}>
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={
              mounted
                ? `Switch to ${isDark ? "light" : "dark"} theme`
                : "Toggle theme"
            }
            className={iconBtn}
          >
            {mounted ? (
              isDark ? (
                <Sun data-magnetic className={iconSize} strokeWidth={1.75} />
              ) : (
                <Moon data-magnetic className={iconSize} strokeWidth={1.75} />
              )
            ) : (
              <span className={iconSize} />
            )}
          </button>
        </Tip>
      </div>
    </nav>
  );
}
