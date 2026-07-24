import { Github, ArrowUpRight } from "lucide-react";
import { profile } from "@/data/profile";
import { Section, SectionHeading } from "@/components/section";

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

export async function GithubContributions() {
  const data = await getContributions();

  const aside = (
    <a
      href={profile.links.github}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-ink"
    >
      <Github className="size-3.5" strokeWidth={1.75} />@{profile.githubUsername}
    </a>
  );

  if (!data?.contributions?.length) {
    return (
      <Section id="github">
        <SectionHeading path="github" title="Contributions" aside={aside} />
        <GraphFallback />
      </Section>
    );
  }

  const total = data.total;
  const weeks = toWeeks(data.contributions);

  // Month labels: place a label at the first week each month appears.
  const monthLabels = weeks.map((week, i) => {
    const firstReal = week.find((d) => d);
    if (!firstReal) return null;
    const m = new Date(`${firstReal.date}T00:00:00`).getMonth();
    const prev = weeks[i - 1]?.find((d) => d);
    const prevM = prev
      ? new Date(`${prev.date}T00:00:00`).getMonth()
      : -1;
    return m !== prevM ? MONTHS[m] : null;
  });

  return (
    <Section id="github">
      <SectionHeading path="github" title="Contributions" aside={aside} />

      <div className="rounded-xl border border-border bg-surface/90 p-4 sm:p-6">
        <p className="mb-4 text-sm text-muted">
          <span className="font-mono font-semibold text-ink">
            {total.toLocaleString()}
          </span>{" "}
          contributions in the last year.
        </p>

        <div className="overflow-x-auto pb-1">
          <div className="inline-flex min-w-max flex-col gap-1.5">
            {/* month labels */}
            <div className="flex gap-[3px] pl-0">
              {monthLabels.map((label, i) => (
                <div
                  key={i}
                  className="w-[11px] font-mono text-[9px] text-faint"
                >
                  {label ?? ""}
                </div>
              ))}
            </div>

            {/* grid */}
            <div
              className="grid grid-flow-col grid-rows-7 gap-[3px]"
              role="img"
              aria-label={`GitHub contribution graph: ${total.toLocaleString()} contributions in the last year`}
            >
              {weeks.flatMap((week, wi) =>
                week.map((day, di) =>
                  day ? (
                    <div
                      key={`${wi}-${di}`}
                      title={`${day.count} on ${day.date}`}
                      className="size-[11px] rounded-[2px]"
                      style={{ backgroundColor: LEVEL_BG[day.level] }}
                    />
                  ) : (
                    <div key={`${wi}-${di}`} className="size-[11px]" />
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
