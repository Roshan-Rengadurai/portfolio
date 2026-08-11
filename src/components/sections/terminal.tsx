"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { profile } from "@/data/profile";
import { Section, SectionHeading } from "@/components/section";
import { MatrixRain } from "@/components/matrix-rain";
import { useSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

type Line =
  | { kind: "cmd"; text: string }
  | { kind: "out"; node: ReactNode };

const PROMPT = "guest@roshan.dev:~$";

const FORTUNES = [
  "There are two hard things in software: naming, off-by-one errors, and cache invalidation.",
  "Weeks of coding can save you hours of planning.",
  "A student who ships beats a genius who plans forever.",
  "The best debugger ever made is a good night's sleep.",
  "It works on my machine is a state of mind.",
  "Commit early, commit often, regret never.",
];

const LOGO = [
  "  .-----.  ",
  " /       \\ ",
  "|  o   o  |",
  "|         |",
  "|  \\___/  |",
  " \\       / ",
  "  '-----'  ",
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

function cowsay(text: string) {
  const msg = (text || "moo").slice(0, 40);
  const top = " " + "_".repeat(msg.length + 2);
  const bottom = " " + "-".repeat(msg.length + 2);
  return [
    top,
    `< ${msg} >`,
    bottom,
    "        \\   ^__^",
    "         \\  (oo)\\_______",
    "            (__)\\       )\\/\\",
    "                ||----w |",
    "                ||     ||",
  ].join("\n");
}

export function TerminalSection() {
  const { setTheme, resolvedTheme } = useTheme();
  const { play } = useSound();
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const history = useRef<string[]>([]);
  const histIndex = useRef(-1);
  const bootedAt = useRef(Date.now());

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

  // Measure after render so the caret lands on the real glyph boundary.
  useEffect(() => {
    setCaretX(measureRef.current?.offsetWidth ?? 0);
  }, [value, caretPos]);

  // Hold the caret solid while typing, then let it resume breathing.
  useEffect(() => {
    if (!typing) return;
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 420);
    return () => clearTimeout(typingTimer.current);
  }, [typing, value, caretPos]);

  const print = (node: ReactNode) =>
    setLines((prev) => [...prev, { kind: "out", node }]);
  const printPre = (text: string, className = "text-muted") =>
    print(<pre className={`whitespace-pre leading-tight ${className}`}>{text}</pre>);

  useEffect(() => {
    setLines([
      {
        kind: "out",
        node: (
          <span className="text-muted">
            {profile.name.split(" ")[0]}&apos;s shell. type{" "}
            <span className="text-accent-strong">help</span>, or poke around.
          </span>
        ),
      },
    ]);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

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
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5">
            {[
              ["whoami", "who is this"],
              ["projects", "what I'm building"],
              ["github", "open my GitHub"],
              ["linkedin", "open my LinkedIn"],
              ["email", "get in touch"],
              ["neofetch", "system info, the fun way"],
              ["cmatrix", "follow the white rabbit"],
              ["cowsay <text>", "a cow says your words"],
              ["fortune", "a random dev aphorism"],
              ["dark", "switch to dark mode"],
              ["light", "switch to light mode"],
              ["date", "current date & time"],
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
      case "whoami":
        print(
          <div className="text-muted">
            <span className="text-ink">{profile.name}</span>
            <br />
            {profile.headline}
          </div>
        );
        break;
      case "projects":
      case "ls":
        print(
          <span className="text-muted">
            projects/ is a work in progress. building in public →{" "}
            <ExtLink href={profile.links.github}>
              @{profile.githubUsername}
            </ExtLink>
          </span>
        );
        break;
      case "github":
      case "gh":
        print(
          <span className="text-muted">
            opening GitHub →{" "}
            <ExtLink href={profile.links.github}>@{profile.githubUsername}</ExtLink>
          </span>
        );
        window.open(profile.links.github, "_blank", "noopener");
        break;
      case "linkedin":
      case "li":
        print(
          <span className="text-muted">
            opening LinkedIn →{" "}
            <ExtLink href={profile.links.linkedin}>view profile</ExtLink>
          </span>
        );
        window.open(profile.links.linkedin, "_blank", "noopener");
        break;
      case "email":
      case "contact":
        print(
          <span className="text-muted">
            reach me at{" "}
            <ExtLink href={profile.links.email}>{profile.email}</ExtLink>
          </span>
        );
        window.location.href = profile.links.email;
        break;
      case "neofetch": {
        const up = Math.max(1, Math.round((Date.now() - bootedAt.current) / 1000));
        const info: [string, string][] = [
          ["host", "roshan-rengadurai.vercel.app"],
          ["os", "PortfolioOS (web)"],
          ["shell", "rsh 1.0"],
          ["theme", resolvedTheme ?? "dark"],
          ["res", `${window.innerWidth}x${window.innerHeight}`],
          ["uptime", `${up}s`],
          ["stack", "Next.js · TypeScript · Canvas"],
        ];
        print(
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <pre className="whitespace-pre leading-tight text-accent">
              {LOGO.join("\n")}
            </pre>
            <div className="font-mono text-xs">
              <div className="text-accent-strong">guest@roshan.dev</div>
              <div className="text-faint">----------------</div>
              {info.map(([k, v]) => (
                <div key={k}>
                  <span className="text-accent-strong">{k}</span>
                  <span className="text-faint"> : </span>
                  <span className="text-muted">{v}</span>
                </div>
              ))}
            </div>
          </div>
        );
        break;
      }
      case "cowsay":
        printPre(cowsay(arg), "text-ink");
        break;
      case "fortune":
        print(
          <span className="text-muted">
            {FORTUNES[(Math.random() * FORTUNES.length) | 0]}
          </span>
        );
        break;
      case "cmatrix":
        print(<MatrixRain />);
        break;
      case "dark":
        setTheme("dark");
        print(<span className="text-muted">theme set to dark</span>);
        break;
      case "light":
        setTheme("light");
        print(<span className="text-muted">theme set to light</span>);
        break;
      case "theme": {
        const t = arg.toLowerCase();
        if (t === "dark" || t === "light") {
          setTheme(t);
          print(<span className="text-muted">theme set to {t}</span>);
        } else {
          print(
            <span className="text-muted">usage: theme &lt;dark|light&gt;</span>
          );
        }
        break;
      }
      case "date":
        print(<span className="text-muted">{new Date().toString()}</span>);
        break;
      case "echo":
        print(<span className="text-muted">{arg}</span>);
        break;
      case "sudo":
        print(
          <span className="text-muted">
            nice try. this one runs on curiosity, not root.
          </span>
        );
        break;
      case "clear":
        setLines([]);
        break;
      default:
        print(
          <span className="text-muted">
            command not found: {cmd}. type{" "}
            <span className="text-accent-strong">help</span>
          </span>
        );
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setTyping(true);
    if (e.key === "Enter") {
      play("nav");
      run(value);
      setValue("");
      setCaretPos(0);
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
    } else if (e.key.length === 1 || e.key === "Backspace") {
      play("key");
    }
  };

  return (
    <Section id="terminal">
      <SectionHeading path="terminal" title="Terminal" aside={<span>type help</span>} />

      <div
        onClick={() => inputRef.current?.focus()}
        className="glass overflow-hidden rounded-xl font-mono text-sm"
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
          </span>
          <span className="text-xs text-faint">
            rsh - {profile.githubUsername}
          </span>
        </div>

        <div
          ref={scrollRef}
          aria-live="polite"
          className="h-[min(52vh,340px)] space-y-1 overflow-y-auto p-4 leading-relaxed"
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
            <label htmlFor="term-input" className="shrink-0 text-accent-strong">
              {PROMPT}
            </label>
            <div className="relative min-w-0 flex-1">
              <input
                id="term-input"
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
                aria-label="Terminal command input"
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
      </div>
    </Section>
  );
}
