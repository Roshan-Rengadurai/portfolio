import { profile } from "@/data/profile";
import { Section } from "@/components/section";

export function Education() {
  return (
    <Section id="education" title="Education" aside="Class of 2027">
      <ul className="divide-y divide-border border-y border-border">
        {profile.education.map((edu) => (
          <li
            key={edu.school}
            className="grid gap-1 py-5 sm:grid-cols-[7rem_1fr_auto] sm:items-baseline sm:gap-6"
          >
            <span className="font-mono text-xs tabular-nums text-faint">
              {edu.start}-{edu.end}
            </span>
            <a
              href={edu.href}
              target="_blank"
              rel="noreferrer"
              className="link-underline focus-ring justify-self-start text-lg font-semibold text-ink"
            >
              {edu.school}
            </a>
            <span className="text-sm text-muted">{edu.degree}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
