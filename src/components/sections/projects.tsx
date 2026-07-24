import { ArrowUpRight, Hammer } from "lucide-react";
import { profile } from "@/data/profile";
import { Section, SectionHeading } from "@/components/section";

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

      <div className="rounded-xl border border-dashed border-border-strong bg-surface/80 p-8 text-center sm:p-12">
        <span className="mx-auto mb-4 grid size-11 place-items-center rounded-lg border border-border bg-surface-2 text-accent">
          <Hammer className="size-5" strokeWidth={1.75} />
        </span>

        <h3 className="text-lg font-semibold text-ink">
          Under construction
        </h3>
        <p className="mx-auto mt-2 max-w-[46ch] text-pretty text-sm leading-relaxed text-muted">
          I&apos;m building a few things right now. Once they&apos;re worth
          showing, they&apos;ll land here. Until then, the work happens in the
          open.
        </p>

        <a
          href={profile.links.github}
          target="_blank"
          rel="noreferrer"
          className="focus-ring mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-strong"
        >
          Browse the code on GitHub
          <ArrowUpRight className="size-4" strokeWidth={2} />
        </a>

        <p className="mt-6 font-mono text-xs text-faint">
          <span className="text-accent-strong">$</span> git commit -m
          &quot;coming soon&quot;
        </p>
      </div>
    </Section>
  );
}
