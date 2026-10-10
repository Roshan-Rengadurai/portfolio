import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { Section } from "@/components/section";

export function Projects() {
  return (
    <Section id="projects" title="Projects" aside="Two in the open, more on the way.">
      <ul className="divide-y divide-border border-y border-border">
        {projects.map((project) => (
          <li
            key={project.slug}
            className="grid gap-2 py-7 sm:grid-cols-[7rem_1fr] sm:gap-6"
          >
            <span className="font-mono text-xs text-faint sm:pt-2">
              {project.status}
            </span>
            <div className="min-w-0">
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="link-underline focus-ring text-xl font-semibold text-ink"
              >
                {project.name}
              </a>
              <p className="mt-2 max-w-[65ch] text-pretty text-sm leading-relaxed text-muted">
                {project.blurb}
              </p>
              <p className="mt-3 font-mono text-xs text-faint">
                {project.tags.join(" / ")}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-muted">
        Everything else I build in the open is on{" "}
        <a
          href={profile.links.github}
          target="_blank"
          rel="noreferrer"
          className="link-underline font-medium text-ink"
        >
          GitHub
        </a>
        .
      </p>
    </Section>
  );
}
