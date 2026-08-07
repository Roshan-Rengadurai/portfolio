import { cn } from "@/lib/utils";

/** A view body. The shell handles centering/max-width; this just spaces content. */
export function Section({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("w-full", className)}>
      {children}
    </section>
  );
}

/**
 * Section heading using the site's terminal/path metaphor as one unit
 * (not a stacked eyebrow): a faint mono `cd ~/path` prefix + the title.
 */
export function SectionHeading({
  path,
  title,
  aside,
}: {
  path: string;
  title: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
      <div>
        <p className="font-mono text-xs text-faint">
          <span className="text-accent-strong">cd</span> ~/{path}
        </p>
        <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {title}
        </h2>
      </div>
      {aside ? (
        <div className="font-mono text-xs text-muted">{aside}</div>
      ) : null}
    </div>
  );
}
