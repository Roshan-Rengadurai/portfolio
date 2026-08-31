import { ArrowUpRight, Crop, Vibrate } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { Section } from "@/components/section";

const icons: Record<string, LucideIcon> = {
  vibrate: Vibrate,
  crop: Crop,
};

export function Projects() {
  return (
    <Section id="projects" title="Projects" aside="Two in the open, more on the way.">
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project, i) => {
          const Icon = icons[project.icon];
          return (
            <a
              key={project.slug}
              href={project.href}
              target="_blank"
              rel="noreferrer"
              style={{ ["--i" as string]: i }}
              className="reveal focus-ring group flex flex-col rounded-xl border border-border bg-surface/90 p-6 transition-[border-color] duration-200 hover:border-border-strong sm:p-8"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-lg border border-border bg-surface-2 text-accent">
                  {Icon ? <Icon className="size-5" strokeWidth={1.75} /> : null}
                </span>
                <span className="text-xs text-faint">{project.status}</span>
              </div>

              <h3 className="mt-5 flex items-center gap-1.5 text-xl font-semibold text-ink">
                {project.name}
                <ArrowUpRight
                  className="size-4 text-muted transition-colors group-hover:text-accent-strong"
                  strokeWidth={2}
                />
              </h3>

              <p className="mt-2 max-w-[60ch] text-pretty text-sm leading-relaxed text-muted">
                {project.blurb}
              </p>

              <div className="mt-auto flex flex-wrap gap-1.5 pt-6 font-mono text-xs text-faint">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-border bg-surface-2 px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          );
        })}
      </div>

      <div
        style={{ ["--i" as string]: projects.length }}
        className="reveal mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface/80 px-6 py-5"
      >
        <p className="text-sm text-muted">
          Everything I build in the open lives on GitHub.
        </p>

        <a
          href={profile.links.github}
          target="_blank"
          rel="noreferrer"
          className="focus-ring inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-strong"
        >
          View on GitHub
          <ArrowUpRight className="size-4" strokeWidth={2} />
        </a>
      </div>
    </Section>
  );
}
