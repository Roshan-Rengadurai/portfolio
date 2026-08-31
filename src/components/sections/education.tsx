import { ArrowUpRight, GraduationCap } from "lucide-react";
import { profile } from "@/data/profile";
import { Section } from "@/components/section";

export function Education() {
  return (
    <Section id="education" title="Education" aside="Class of 2027">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {profile.education.map((edu, i) => (
          <a
            key={edu.school}
            href={edu.href}
            target="_blank"
            rel="noreferrer"
            style={{ ["--i" as string]: i }}
            className="reveal focus-ring group flex flex-col rounded-xl border border-border bg-surface/90 p-6 transition-[border-color] duration-200 hover:border-border-strong"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-11 place-items-center rounded-lg border border-border bg-surface-2 text-accent">
                <GraduationCap className="size-5" strokeWidth={1.75} />
              </span>
              <span className="font-mono text-xs tabular-nums text-faint">
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
