export type Project = {
  slug: string;
  name: string;
  /** One-line, understated summary. */
  blurb: string;
  /** Short mono tags shown under the title. */
  tags: readonly string[];
  /** Terminal-style status, e.g. "early", "in progress". */
  status: string;
  /** Lucide icon name, resolved in the section. */
  icon: "vibrate" | "crop";
  href: string;
};

export const projects: readonly Project[] = [
  {
    slug: "bump",
    name: "Bump",
    blurb:
      "Control your Mac with taps — bump the chassis or trackpad to trigger mute, lock, screenshot, and more. A free, native alternative to paid tap-control apps.",
    tags: ["macOS", "Swift", "open source"],
    status: "early",
    icon: "vibrate",
    href: "https://github.com/Roshan-Rengadurai/bump",
  },
  {
    slug: "nab",
    name: "Nab",
    blurb:
      "Screenshot to a clean, shareable link — straight to a storage bucket you own. Region capture, syntax-highlighted code snippets, and S3-compatible uploads with no middleman.",
    tags: ["macOS", "Swift", "S3"],
    status: "in progress",
    icon: "crop",
    href: "https://github.com/Roshan-Rengadurai/nab",
  },
] as const;
