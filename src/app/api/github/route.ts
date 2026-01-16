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

  // GitHub Token がある場合は認証付きで取得（レート制限緩和: 5000/時間）
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    // Fetch user data, repos, and events in parallel
    const [userRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers,
        next: { revalidate: 3600 }, // 1時間キャッシュ
      }),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
        headers,
        next: { revalidate: 3600 },
      }),
      fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, {
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

    return NextResponse.json({
      user: userData,
      repos: reposData,
      events: eventsData,
    });
  } catch (error) {
    console.error("[GitHub API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
