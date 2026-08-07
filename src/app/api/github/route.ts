import { NextResponse } from "next/server";
import { profile } from "@/data/profile";

export const revalidate = 3600; // refresh at most once an hour

type Stats = {
  followers: number;
  repos: number;
  stars: number;
  lastPush: string | null;
};

function headers() {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": profile.githubUsername,
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `bearer ${token}`;
  return h;
}

async function getStats(): Promise<Stats | null> {
  const user = profile.githubUsername;
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${user}`, {
        headers: headers(),
        next: { revalidate },
      }),
      fetch(
        `https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`,
        { headers: headers(), next: { revalidate } }
      ),
    ]);
    if (!userRes.ok) return null;

    const u = (await userRes.json()) as {
      followers?: number;
      public_repos?: number;
    };

    let stars = 0;
    let lastPush: string | null = null;
    if (reposRes.ok) {
      const repos = (await reposRes.json()) as {
        stargazers_count?: number;
        pushed_at?: string;
        fork?: boolean;
      }[];
      for (const r of repos) {
        stars += r.stargazers_count ?? 0;
        if (!r.fork && r.pushed_at && (!lastPush || r.pushed_at > lastPush)) {
          lastPush = r.pushed_at;
        }
      }
    }

    return {
      followers: u.followers ?? 0,
      repos: u.public_repos ?? 0,
      stars,
      lastPush,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const stats = await getStats();
  if (!stats) {
    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }
  return NextResponse.json(stats, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
