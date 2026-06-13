import { NextRequest, NextResponse } from "next/server";

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
}

interface GitHubUser {
  public_repos: number;
  followers: number;
  following: number;
}

interface GitHubEvent {
  type: string;
  created_at: string;
  repo: { name: string };
  payload?: {
    commits?: unknown[];
  };
}

interface ContributionDay {
  date: string;
  count: number;
}

function buildCommitActivity(events: GitHubEvent[]): {
  commitActivity: ContributionDay[];
  pushEventCount: number;
} {
  const contributionMap = new Map<string, number>();
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    contributionMap.set(date.toISOString().split("T")[0], 0);
  }

  let pushEventCount = 0;

  events.forEach((event) => {
    if (event.type !== "PushEvent") return;

    pushEventCount++;

    const date = event.created_at.split("T")[0];
    if (!contributionMap.has(date)) return;

    const commitCount = event.payload?.commits?.length || 1;
    contributionMap.set(date, (contributionMap.get(date) || 0) + commitCount);
  });

  return {
    commitActivity: Array.from(contributionMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    pushEventCount,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  const githubToken = process.env.GITHUB_TOKEN;

  // GitHub Token がある場合は認証付きで取得（レート制限緩和 + private activity 対応）
  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  }

  try {
    // Fetch user data, repos, and events in parallel
    const eventsPath = githubToken ? "events" : "events/public";
    const [userRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers,
        next: { revalidate: 3600 }, // 1時間キャッシュ
      }),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
        headers,
        next: { revalidate: 3600 },
      }),
      fetch(`https://api.github.com/users/${username}/${eventsPath}?per_page=100`, {
        headers,
        next: { revalidate: 3600 },
      }),
    ]);

    if (!userRes.ok || !reposRes.ok) {
      console.error(
        "[GitHub API] Failed to fetch:",
        userRes.status,
        reposRes.status
      );
      return NextResponse.json(
        { error: "Failed to fetch GitHub data" },
        { status: userRes.status }
      );
    }

    const userData: GitHubUser = await userRes.json();
    const reposData: GitHubRepo[] = await reposRes.json();
    const eventsData: GitHubEvent[] = eventsRes.ok ? await eventsRes.json() : [];
    const { commitActivity, pushEventCount } = buildCommitActivity(eventsData);

    return NextResponse.json({
      user: userData,
      repos: reposData,
      commitActivity,
      pushEventCount,
      activitySource: githubToken ? "authenticated" : "public",
    });
  } catch (error) {
    console.error("[GitHub API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
