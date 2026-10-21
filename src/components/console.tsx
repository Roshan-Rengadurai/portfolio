"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { cn } from "@/lib/utils";
import { ProgramView, type ProgramName } from "@/components/console-programs";
import {
  LOGO,
  cowsay,
  formatUptime,
  fortune,
  toBinary,
  toHex,
} from "@/components/console-text";

type Line =
  | { kind: "cmd"; text: string }
  | { kind: "out"; node: ReactNode };

const PROMPT = ">";

const PROGRAM_ALIASES: Record<string, ProgramName> = {
  cmatrix: "cmatrix",
  matrix: "cmatrix",
  fluid: "fluid",
  sim: "fluid",
  life: "life",
  gol: "life",
  donut: "donut",
  torus: "donut",
};

const COMMANDS = [
  "about", "projects", "education", "github", "linkedin", "email", "theme",
  "clear", "help", "cowsay", "fortune", "neofetch", "date", "echo", "bin",
  "hex", "sudo", "cmatrix", "fluid", "life", "donut",
];

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="link-underline text-accent-strong"
    >
      {children}
    </a>
  );
}

/**
 * A small keyboard console for navigating the site. Deliberately plain: it
 * lists the same information the page shows, nothing invented.
 */
export function Console() {
  const { setTheme, resolvedTheme } = useTheme();
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [program, setProgram] = useState<ProgramName | null>(null);
  const exitProgram = useCallback(() => setProgram(null), []);
  const history = useRef<string[]>([]);
  const histIndex = useRef(-1);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  // Custom caret: glides to the character position instead of jumping.
  const [caretPos, setCaretPos] = useState(0);
  const [caretX, setCaretX] = useState(0);
  const [focused, setFocused] = useState(false);
  const [typing, setTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>();

  const syncCaret = () =>
    setCaretPos(inputRef.current?.selectionStart ?? value.length);

  useEffect(() => {
    setCaretX(measureRef.current?.offsetWidth ?? 0);
  }, [value, caretPos]);

  useEffect(() => {
    if (!typing) return;
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 420);
    return () => clearTimeout(typingTimer.current);
  }, [typing, value, caretPos]);

  const print = (node: ReactNode) =>
    setLines((prev) => [...prev, { kind: "out", node }]);

  useEffect(() => {
    setLines([
      {
        kind: "out",
        node: (
          <span className="text-muted">
            Type <span className="text-accent-strong">help</span> to see what
            this can do.
          </span>
        ),
      },
    ]);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines, program]);

  useEffect(() => {
    if (program) setFocused(false);
    else inputRef.current?.focus();
  }, [program]);

  const run = (raw: string) => {
    const input = raw.trim();
    setLines((prev) => [...prev, { kind: "cmd", text: raw }]);
    if (!input) return;
    history.current.unshift(input);
    histIndex.current = -1;

    const [cmd, ...args] = input.split(/\s+/);
    const arg = args.join(" ");

    switch (cmd.toLowerCase()) {
      case "help":
        print(
          <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
            {[
              ["about", "who I am"],
              ["projects", "what I'm building"],
              ["education", "where I study"],
              ["github", "open my GitHub"],
              ["linkedin", "open my LinkedIn"],
              ["email", "get in touch"],
              ["theme", "switch between light and dark"],
              ["neofetch", "system info, portfolio edition"],
              ["cowsay [text]", "a cow says things"],
              ["fortune", "a small engineering proverb"],
              ["bin | hex <text>", "encode text as binary or hex"],
              ["date", "current date and time"],
              ["cmatrix", "digital rain"],
              ["fluid", "ASCII fluid simulation"],
              ["life", "Conway's Game of Life"],
              ["donut", "spinning ASCII torus"],
              ["clear", "clear the screen"],
            ].map(([c, d]) => (
              <div key={c} className="contents">
                <span className="text-accent-strong">{c}</span>
                <span className="text-muted">{d}</span>
              </div>
            ))}
          </div>
        );
        break;

      case "about":
        print(
          <div className="text-muted">
            <span className="text-ink">{profile.name}</span> &middot;{" "}
            {profile.headline}
          </div>
        );
        break;

      case "projects":
        print(
          <div className="grid gap-1">
            {projects.map((p) => (
              <div key={p.slug} className="text-muted">
                <ExtLink href={p.href}>{p.name}</ExtLink>{" "}
                <span className="text-faint">({p.status})</span> &middot;{" "}
                {p.tags.join(", ")}
              </div>
            ))}
          </div>
        );
        break;

      case "education":
        print(
          <div className="grid gap-1">
            {profile.education.map((e) => (
              <div key={e.school} className="text-muted">
                <ExtLink href={e.href}>{e.school}</ExtLink>{" "}
                <span className="text-faint">
                  {e.start}-{e.end}
                </span>{" "}
                &middot; {e.degree}
              </div>
            ))}
          </div>
        );
        break;

      case "github":
        print(
          <span className="text-muted">
            Opening{" "}
            <ExtLink href={profile.links.github}>
              @{profile.githubUsername}
            </ExtLink>
          </span>
        );
        window.open(profile.links.github, "_blank", "noopener");
        break;

      case "linkedin":
        print(
          <span className="text-muted">
            Opening <ExtLink href={profile.links.linkedin}>LinkedIn</ExtLink>
          </span>
        );
        window.open(profile.links.linkedin, "_blank", "noopener");
        break;

      case "email":
      case "contact":
        print(
          <span className="text-muted">
            Reach me at{" "}
            <ExtLink href={profile.links.email}>{profile.email}</ExtLink>
          </span>
        );
        window.dispatchEvent(new Event("open-email-modal"));
        break;

      case "theme": {
        const t = arg.toLowerCase();
        const next =
          t === "dark" || t === "light"
            ? t
            : resolvedTheme === "dark"
              ? "light"
              : "dark";
        setTheme(next);
        print(<span className="text-muted">Switched to {next} mode.</span>);
        break;
      }

      case "cowsay":
        print(<pre className="text-accent-strong">{cowsay(arg || fortune())}</pre>);
        break;

      case "fortune":
        print(<span className="text-muted">{fortune()}</span>);
        break;

      case "neofetch": {
        const nav = navigator as Navigator & {
          userAgentData?: { platform?: string };
        };
        const rows: [string, string][] = [
          ["os", nav.userAgentData?.platform || nav.platform || "unknown"],
          ["lang", nav.language],
          ["cores", String(nav.hardwareConcurrency ?? "?")],
          ["screen", `${window.innerWidth}x${window.innerHeight}`],
          ["theme", resolvedTheme ?? "unknown"],
          ["projects", String(projects.length)],
          ["uptime", formatUptime(performance.now() / 1000)],
        ];
        print(
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <pre className="text-accent-strong">{LOGO.join("\n")}</pre>
            <div>
              <div>
                <span className="text-accent-strong">visitor</span>
                <span className="text-muted">@</span>
                <span className="text-accent-strong">
                  {profile.name.split(" ")[0].toLowerCase()}
                </span>
              </div>
              {rows.map(([k, val]) => (
                <div key={k} className="text-muted">
                  <span className="text-accent-strong">{k}</span>: {val}
                </div>
              ))}
            </div>
          </div>
        );
        break;
      }

      case "date":
        print(<span className="text-muted">{new Date().toString()}</span>);
        break;

      case "echo":
        print(<span className="text-muted">{arg}</span>);
        break;

      case "bin":
      case "hex":
        print(
          <span className="break-all text-muted">
            {arg
              ? cmd.toLowerCase() === "bin"
                ? toBinary(arg)
                : toHex(arg)
              : `usage: ${cmd} <text>`}
          </span>
        );
        break;

      case "sudo":
        print(
          <span className="text-muted">
            visitor is not in the sudoers file. This incident will be reported.
          </span>
        );
        break;

      case "clear":
        setLines([]);
        break;

      default: {
        const prog = PROGRAM_ALIASES[cmd.toLowerCase()];
        if (prog) {
          setProgram(prog);
          break;
        }
        print(
          <span className="text-muted">
            No command named &ldquo;{cmd}&rdquo;. Type{" "}
            <span className="text-accent-strong">help</span> for the list.
          </span>
        );
      }
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setTyping(true);
    if (e.key === "Enter") {
      run(value);
      setValue("");
      setCaretPos(0);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const prefix = value.trim().toLowerCase();
      if (!prefix || /\s/.test(prefix)) return;
      const hits = COMMANDS.filter((c) => c.startsWith(prefix));
      if (hits.length === 1) {
        setValue(hits[0]);
        setCaretPos(hits[0].length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const h = history.current;
      if (h.length) {
        histIndex.current = Math.min(histIndex.current + 1, h.length - 1);
        setValue(h[histIndex.current]);
        setCaretPos(h[histIndex.current].length);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIndex.current > 0) {
        histIndex.current -= 1;
        setValue(history.current[histIndex.current]);
        setCaretPos(history.current[histIndex.current].length);
      } else {
        histIndex.current = -1;
        setValue("");
        setCaretPos(0);
      }
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="overflow-hidden rounded-xl border border-border-strong bg-surface font-mono text-sm"
    >
      <div className="border-b border-border px-4 py-3">
        <span className="font-sans text-xs font-medium text-muted">Console</span>
      </div>

      {program ? (
        <ProgramView name={program} onExit={exitProgram} />
      ) : (
      <div
        ref={scrollRef}
        aria-live="polite"
        className="h-[min(50vh,320px)] space-y-1.5 overflow-y-auto p-4 leading-relaxed"
      >
        {lines.map((line, i) =>
          line.kind === "cmd" ? (
            <div key={i} className="flex gap-2 break-all">
              <span className="shrink-0 text-accent-strong">{PROMPT}</span>
              <span className="text-ink">{line.text}</span>
            </div>
          ) : (
            <div key={i} className="break-words">
              {line.node}
            </div>
          )
        )}

        <div className="flex gap-2">
          <label htmlFor="console-input" className="shrink-0 text-accent-strong">
            {PROMPT}
          </label>
          <div className="relative min-w-0 flex-1">
            <input
              id="console-input"
              ref={inputRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setCaretPos(e.target.selectionStart ?? e.target.value.length);
                setTyping(true);
              }}
              onKeyDown={onKeyDown}
              onSelect={syncCaret}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              aria-label="Console input"
              className="w-full bg-transparent text-ink caret-transparent outline-none"
            />
            {/* hidden measurer: width of the text before the caret */}
            <span
              ref={measureRef}
              aria-hidden="true"
              className="pointer-events-none invisible absolute left-0 top-0 whitespace-pre"
            >
              {value.slice(0, caretPos)}
            </span>
            {focused && (
              <span
                aria-hidden="true"
                className={cn(
                  "caret pointer-events-none absolute left-0 top-1/2 h-[1.15em] w-[2px] -translate-y-1/2 rounded-sm bg-accent",
                  typing && "caret-typing"
                )}
                style={{ transform: `translate(${caretX}px, -50%)` }}
              />
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
