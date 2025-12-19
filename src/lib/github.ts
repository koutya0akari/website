import "server-only";

const GITHUB_USERNAME = "Mori-Yusei";
const GITHUB_REPO = "website";

export type GitHubCommit = {
  sha: string;
  message: string;
  date: string;
  url: string;
};

export type GitHubActivityYear = {
  year: string;
  commits: GitHubCommit[];
};

// GitHub API からコミット履歴を取得
export async function getGitHubCommits(limit = 100): Promise<GitHubCommit[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/commits?per_page=${limit}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          // GitHub token がある場合は認証付きで取得（レート制限緩和）
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          }),
        },
        next: { revalidate: 3600 }, // 1時間キャッシュ
      }
    );

    if (!response.ok) {
      console.error("[GitHub] Failed to fetch commits:", response.status);
      return [];
    }

    const data = await response.json();

    return data.map((commit: {
      sha: string;
      commit: {
        message: string;
        author: { date: string };
      };
      html_url: string;
    }) => ({
      sha: commit.sha,
      message: commit.commit.message.split("\n")[0], // 最初の行のみ
      date: commit.commit.author.date,
      url: commit.html_url,
    }));
  } catch (error) {
    console.error("[GitHub] Error fetching commits:", error);
    return [];
  }
}

// 年別にコミットをグループ化
export async function getGitHubActivityByYear(): Promise<GitHubActivityYear[]> {
  const commits = await getGitHubCommits();

  const yearMap = new Map<string, GitHubCommit[]>();

  for (const commit of commits) {
    const year = new Date(commit.date).getFullYear().toString();
    const items = yearMap.get(year) || [];
    items.push(commit);
    yearMap.set(year, items);
  }

  const sortedYears = Array.from(yearMap.keys()).sort((a, b) => parseInt(b) - parseInt(a));

  return sortedYears.map((year) => ({
    year,
    commits: yearMap.get(year) || [],
  }));
}

