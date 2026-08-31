import { Github, ArrowUpRight } from "lucide-react";
import { profile } from "@/data/profile";
import { Section } from "@/components/section";

type Level = 0 | 1 | 2 | 3 | 4;
type Day = { date: string; count: number; level: Level };
type Normalized = { total: number; contributions: Day[] };

const GQL_LEVEL: Record<string, Level> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const LEVEL_BG = [
  "var(--surface-2)",
  "color-mix(in oklab, var(--accent) 28%, var(--surface-2))",
  "color-mix(in oklab, var(--accent) 52%, var(--surface-2))",
  "color-mix(in oklab, var(--accent) 76%, var(--surface-2))",
  "var(--accent)",
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Official GitHub GraphQL API. Includes PRIVATE contributions (so the total
 * matches github.com) when GITHUB_TOKEN is the account owner's token.
 */
async function fromGraphQL(token: string): Promise<Normalized | null> {
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount contributionLevel}}}}}}`,
        variables: { login: profile.githubUsername },
      }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: {
        user?: {
          contributionsCollection?: {
            contributionCalendar?: {
              totalContributions: number;
              weeks: {
                contributionDays: {
                  date: string;
                  contributionCount: number;
                  contributionLevel: string;
                }[];
              }[];
            };
          };
        };
      };
    };
    const cal = json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!cal) return null;
    const contributions: Day[] = cal.weeks.flatMap((w) =>
      w.contributionDays.map((d) => ({
        date: d.date,
        count: d.contributionCount,
        level: GQL_LEVEL[d.contributionLevel] ?? 0,
      }))
    );
    return { total: cal.totalContributions, contributions };
  } catch {
    return null;
  }
}

/** Public, token-free fallback. Sees only PUBLIC contributions. */
async function fromPublic(): Promise<Normalized | null> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${profile.githubUsername}?y=last`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      total?: Record<string, number>;
      contributions?: Day[];
    };
    if (!json.contributions?.length) return null;
    const total =
      json.total?.lastYear ??
      Object.values(json.total ?? {}).reduce((a, b) => a + b, 0);
    return { total, contributions: json.contributions };
  } catch {
    return null;
  }
}

async function getContributions(): Promise<Normalized | null> {
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    const viaToken = await fromGraphQL(token);
    if (viaToken) return viaToken;
  }
  return fromPublic();
}

/** Group chronological days into GitHub-style week columns (Sun–Sat). */
function toWeeks(days: Day[]) {
  const weeks: (Day | null)[][] = [];
  let current: (Day | null)[] = [];

  days.forEach((day, i) => {
    if (i === 0) {
      const offset = new Date(`${day.date}T00:00:00`).getDay();
      current = Array(offset).fill(null);
    }
    current.push(day);
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  });
  if (current.length) {
    while (current.length < 7) current.push(null);
    weeks.push(current);
  }
  return weeks;
}

function GraphFallback() {
  return (
    <div className="rounded-xl border border-border bg-surface/90 p-8 text-center">
      <p className="text-sm text-muted">
        Contribution data is unavailable right now.
      </p>
      <a
        href={profile.links.github}
        target="_blank"
        rel="noreferrer"
        className="link-underline mt-2 inline-flex items-center gap-1 text-sm font-medium text-ink"
      >
        View it on GitHub
        <ArrowUpRight className="size-3.5" strokeWidth={2} />
      </a>
    </div>
  );
}

/** One computed figure. All values come from the real contribution data. */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-xl font-semibold tabular-nums text-ink sm:text-2xl">
        {value}
      </p>
      <p className="mt-0.5 text-xs leading-snug text-muted">{label}</p>
    </div>
  );
}

export async function GithubContributions() {
  const data = await getContributions();

  const aside = (
    <a
      href={profile.links.github}
      target="_blank"
      rel="noreferrer"
      className="link-underline inline-flex items-center gap-1.5"
    >
      <Github className="size-3.5" strokeWidth={1.75} />@{profile.githubUsername}
    </a>
  );

  if (!data?.contributions?.length) {
    return (
      <Section id="github" title="Contributions" aside={aside}>
        <GraphFallback />
      </Section>
    );
  }

  const total = data.total;
  const weeks = toWeeks(data.contributions);

  const activeDays = data.contributions.filter((d) => d.count > 0).length;
  const busiest = data.contributions.reduce(
    (best, d) => (d.count > best.count ? d : best),
    data.contributions[0]
  );

  // Month labels: one at the first week of each month. A label is ~3 columns
  // wide, so drop any that would land on top of the one before it (which is
  // what happens when the graph starts mid-month).
  let lastLabelAt = -Infinity;
  const monthLabels = weeks.map((week, i) => {
    const firstReal = week.find((d) => d);
    if (!firstReal) return null;
    const m = new Date(`${firstReal.date}T00:00:00`).getMonth();
    const prev = weeks[i - 1]?.find((d) => d);
    const prevM = prev ? new Date(`${prev.date}T00:00:00`).getMonth() : -1;
    if (m === prevM || i - lastLabelAt < 3) return null;
    lastLabelAt = i;
    return MONTHS[m];
  });

  return (
    <Section id="github" title="Contributions" aside={aside}>
      <div className="min-w-0 rounded-xl border border-border bg-surface/90 p-4 sm:p-6">
        <div className="mb-5 grid grid-cols-3 gap-3 border-b border-border pb-4 sm:mb-6 sm:gap-4 sm:pb-5">
          <Stat value={total.toLocaleString()} label="In the last year" />
          <Stat value={activeDays.toLocaleString()} label="Days with commits" />
          <Stat value={busiest.count.toLocaleString()} label="Busiest day" />
        </div>

        {/* One fractional column per week, so the graph stretches to fill the
            card on wide screens and scrolls horizontally below its min width. */}
        <div className="scroll-slim overflow-x-auto pb-1">
          <div
            className="flex min-w-[560px] flex-col gap-1.5"
            style={{
              ["--cols" as string]: weeks.length,
            }}
          >
            {/* month labels */}
            <div className="grid gap-[3px] [grid-template-columns:repeat(var(--cols),minmax(0,1fr))]">
              {monthLabels.map((label, i) => (
                <div
                  key={i}
                  className="whitespace-nowrap font-mono text-[10px] text-faint"
                >
                  {label ?? ""}
                </div>
              ))}
            </div>

            {/* grid */}
            <div
              className="grid grid-flow-col grid-rows-7 gap-[3px] [grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
              role="img"
              aria-label={`GitHub contribution graph: ${total.toLocaleString()} contributions in the last year`}
            >
              {weeks.flatMap((week, wi) =>
                week.map((day, di) =>
                  day ? (
                    <div
                      key={`${wi}-${di}`}
                      title={`${day.count} on ${day.date}`}
                      className="relative aspect-square w-full rounded-[2px] transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:z-10 hover:scale-125"
                      style={{ backgroundColor: LEVEL_BG[day.level] }}
                    />
                  ) : (
                    <div key={`${wi}-${di}`} className="aspect-square w-full" />
                  )
                )
              )}
            </div>
          </div>
        </div>

        {/* legend */}
        <div className="mt-4 flex items-center justify-end gap-1.5 font-mono text-[10px] text-faint">
          <span>less</span>
          {LEVEL_BG.map((bg, i) => (
            <span
              key={i}
              className="size-[11px] rounded-[2px]"
              style={{ backgroundColor: bg }}
            />
          ))}
          <span>more</span>
        </div>
      </div>
    </Section>
  );
}
