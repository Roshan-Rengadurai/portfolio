import { ArrowUpRight, Crop, Vibrate } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { Section, SectionHeading } from "@/components/section";

const icons: Record<string, LucideIcon> = {
  vibrate: Vibrate,
  crop: Crop,
};

export function Projects() {
  return (
    <Section id="projects">
      <SectionHeading
        path="projects"
        title="Projects"
        aside={
          <span className="inline-flex items-center gap-1.5">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
            </span>
            WIP
          </span>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => {
          const Icon = icons[project.icon];
          return (
            <a
              key={project.slug}
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="focus-ring group flex flex-col rounded-xl border border-border bg-surface/90 p-6 transition-colors hover:border-border-strong"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-lg border border-border bg-surface-2 text-accent">
                  {Icon ? <Icon className="size-5" strokeWidth={1.75} /> : null}
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-faint">
                  <span className="size-1.5 rounded-full bg-accent" />
                  {project.status}
                </span>
              </div>

              <h3 className="mt-4 flex items-center gap-1.5 text-lg font-semibold text-ink">
                {project.name}
                <ArrowUpRight
                  className="size-4 text-muted transition-colors group-hover:text-accent-strong"
                  strokeWidth={2}
                />
              </h3>

              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted">
                {project.blurb}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5 font-mono text-xs text-faint">
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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed border-border-strong bg-surface/80 px-5 py-4">
        <p className="font-mono text-xs text-faint">
          <span className="text-accent-strong">$</span> git commit -m
          &quot;more coming soon&quot;
        </p>

        <a
          href={profile.links.github}
          target="_blank"
          rel="noreferrer"
          className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-strong"
        >
          Browse all on GitHub
          <ArrowUpRight className="size-4" strokeWidth={2} />
        </a>
      </div>
    </Section>
  );
}
