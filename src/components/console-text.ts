const BUBBLE_MAX = 36;

const COW = [
  "        \\   ^__^",
  "         \\  (oo)\\_______",
  "            (__)\\       )\\/\\",
  "                ||----w |",
  "                ||     ||",
];

function wrap(text: string, width: number) {
  const lines: string[] = [];
  let cur = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (cur && cur.length + 1 + word.length > width) {
      lines.push(cur);
      cur = "";
    }
    // Hard-split words longer than a line.
    let w = word;
    while (w.length > width) {
      if (cur) {
        lines.push(cur);
        cur = "";
      }
      lines.push(w.slice(0, width));
      w = w.slice(width);
    }
    cur = cur ? `${cur} ${w}` : w;
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

export function cowsay(text: string, maxWidth = BUBBLE_MAX) {
  const lines = wrap(text, maxWidth);
  const w = Math.max(...lines.map((l) => l.length));
  const body = lines.map((l, i) => {
    const pad = l.padEnd(w);
    if (lines.length === 1) return `< ${pad} >`;
    if (i === 0) return `/ ${pad} \\`;
    if (i === lines.length - 1) return `\\ ${pad} /`;
    return `| ${pad} |`;
  });
  return [` ${"_".repeat(w + 2)}`, ...body, ` ${"-".repeat(w + 2)}`, ...COW].join("\n");
}

export const FORTUNES = [
  "It works on my machine.",
  "Premature optimization is the root of a lot of unfinished projects.",
  "A week of debugging can save an hour of reading the docs.",
  "There is nothing more permanent than a temporary fix.",
  "The bug is always in the last place you look, because you stop looking.",
  "Measure twice, cut once, then check the tolerance stack.",
  "Every system is a prototype if you squint hard enough.",
  "If the simulation looks right on the first try, check the boundary conditions.",
  "Units are not optional.",
  "Make it work, make it right, make it fast, in that order.",
  "Sleep is a debugging tool.",
  "Off-by-one errors: there are two hard problems in computer science.",
];

export const fortune = () =>
  FORTUNES[(Math.random() * FORTUNES.length) | 0];

export const LOGO = [
  " ____  ____  ",
  "|  _ \\|  _ \\ ",
  "| |_) | |_) |",
  "|  _ <|  _ < ",
  "|_| \\_\\_| \\_\\",
];

export function toBinary(text: string) {
  return Array.from(new TextEncoder().encode(text))
    .map((b) => b.toString(2).padStart(8, "0"))
    .join(" ");
}

export function toHex(text: string) {
  return Array.from(new TextEncoder().encode(text))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");
}

export function formatUptime(seconds: number) {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  return m ? `${m}m ${s % 60}s` : `${s}s`;
}
