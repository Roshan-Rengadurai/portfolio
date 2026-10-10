import { cn } from "@/lib/utils";

/**
 * A page section. On large screens the title sits in a narrow left rail and the
 * content takes the remaining width, so the page uses the full viewport instead
 * of a single centred column. Below `lg` it collapses to a normal stack.
 */
export function Section({
  id,
  title,
  aside,
  className,
  children,
}: {
  id: string;
  title: string;
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-4 border-t border-border py-16 sm:py-20 lg:py-24",
        className
      )}
    >
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-3">
          {/* Stacked on small screens; a sticky rail once there's room beside it. */}
          <div className="lg:sticky lg:top-24">
            <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {title}
            </h2>
            {aside ? (
              <p className="mt-1.5 text-sm text-muted lg:mt-2">{aside}</p>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 lg:col-span-9">{children}</div>
      </div>
    </section>
  );
}
