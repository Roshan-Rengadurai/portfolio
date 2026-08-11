import { ArrowUpRight, GraduationCap } from "lucide-react";
import { profile } from "@/data/profile";
import { Section, SectionHeading } from "@/components/section";

export function Education() {
  return (
    <Section id="education">
      <SectionHeading
        path="education"
        title="Education"
        aside={
          <span className="inline-flex items-center gap-1.5">
            <GraduationCap className="size-3.5" strokeWidth={1.75} />
            class of 2027
          </span>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profile.education.map((edu, i) => (
          <a
            key={edu.school}
            href={edu.href}
            target="_blank"
            rel="noreferrer"
            style={{ ["--i" as string]: i }}
            className="reveal focus-ring group flex flex-col rounded-xl border border-border bg-surface/90 p-6 transition-[color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-border-strong hover:shadow-[0_16px_32px_-20px_color-mix(in_oklab,var(--accent)_40%,transparent)]"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-11 place-items-center rounded-lg border border-border bg-surface-2 text-accent transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-rotate-6 group-hover:scale-110 group-active:scale-95 group-active:rotate-0">
                <GraduationCap className="size-5" strokeWidth={1.75} />
              </span>
              <span className="font-mono text-xs text-faint">
                {edu.start}-{edu.end}
              </span>
            </div>

            <h3 className="mt-4 flex items-start gap-1.5 text-lg font-semibold leading-snug text-ink">
              {edu.school}
              <ArrowUpRight
                className="mt-1 size-4 shrink-0 text-muted transition-colors group-hover:text-accent-strong"
                strokeWidth={2}
              />
            </h3>

            <p className="mt-2 text-sm text-muted">{edu.degree}</p>
          </a>
        ))}
      </div>
    </Section>
  );
}
