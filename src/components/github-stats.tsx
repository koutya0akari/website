"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GitCommit, GitFork, Star, Book, ExternalLink } from "lucide-react";

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

interface ContributionDay {
  date: string;
  count: number;
}

interface GitHubStatsProps {
  username: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3776ab",
  Rust: "#dea584",
  Go: "#00add8",
  Ruby: "#cc342d",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  HTML: "#e34c26",
  CSS: "#563d7c",
  TeX: "#3D6117",
  Shell: "#89e051",
};

export function GitHubStats({ username }: GitHubStatsProps) {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGitHubData() {
      try {
        setLoading(true);
        
        // Fetch user data, repos, and events in parallel
        const [userRes, reposRes, eventsRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`),
          fetch(`https://api.github.com/users/${username}/events/public?per_page=100`),
        ]);

        if (!userRes.ok || !reposRes.ok) {
          throw new Error("Failed to fetch GitHub data");
        }

        const userData = await userRes.json();
        const reposData = await reposRes.json();
        const eventsData = eventsRes.ok ? await eventsRes.json() : [];

        setUser(userData);
        setRepos(reposData);
        setEvents(eventsData);

        // Calculate contribution data from events
        const contributionMap = new Map<string, number>();
        const today = new Date();
        
        // Initialize last 365 days
        for (let i = 0; i < 365; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          contributionMap.set(dateStr, 0);
        }

        // Count push events as contributions
        eventsData.forEach((event: GitHubEvent) => {
          if (event.type === "PushEvent") {
            const dateStr = event.created_at.split("T")[0];
            const current = contributionMap.get(dateStr) || 0;
            contributionMap.set(dateStr, current + 1);
          }
        });

        const contributionData = Array.from(contributionMap.entries())
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setContributions(contributionData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchGitHubData();
  }, [username]);

  // Calculate stats
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  const pushEvents = events.filter((e) => e.type === "PushEvent").length;
  
  // Get language distribution
  const languageCount = repos.reduce((acc, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topLanguages = Object.entries(languageCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalLangCount = topLanguages.reduce((sum, [, count]) => sum + count, 0);

  // Get top repos
  const topRepos = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 4);

  // Heatmap calculation
  const { weeks, months, maxCount } = (() => {
    const year = new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Adjust start to Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const dataMap = new Map(contributions.map((d) => [d.date, d.count]));
    const weeks: { date: Date; count: number }[][] = [];
    const months: { name: string; week: number }[] = [];

    let currentWeek: { date: Date; count: number }[] = [];
    const currentDate = new Date(startDate);
    let weekIndex = 0;
    let lastMonth = -1;

    while (currentDate <= endDate || currentWeek.length > 0) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const count = dataMap.get(dateStr) || 0;

      // Track months
      const month = currentDate.getMonth();
      if (month !== lastMonth && currentDate.getFullYear() === year) {
        months.push({
          name: currentDate.toLocaleDateString("ja-JP", { month: "short" }),
          week: weekIndex,
        });
        lastMonth = month;
      }

      currentWeek.push({ date: new Date(currentDate), count });

      if (currentDate.getDay() === 6 || currentDate > endDate) {
        weeks.push(currentWeek);
        currentWeek = [];
        weekIndex++;
      }

      currentDate.setDate(currentDate.getDate() + 1);

      if (currentDate > endDate && currentWeek.length === 0) break;
    }

    const maxCount = Math.max(...contributions.map((d) => d.count), 1);

    return { weeks, months, maxCount };
  })();

  const getIntensity = (count: number) => {
    if (count === 0) return 0;
    const ratio = count / maxCount;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  const intensityColors = [
    "bg-white/5 border-white/10",
    "bg-green-500/30 border-green-500/40",
    "bg-green-500/50 border-green-500/60",
    "bg-green-500/70 border-green-500/80",
    "bg-green-500 border-green-400",
  ];

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white/5" />
          ))}
        </div>
        <div className="h-48 rounded-xl bg-white/5" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-400">
        GitHub データの取得に失敗しました: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">@{username}</h3>
            <p className="text-sm text-white/50">GitHub Activity</p>
          </div>
        </div>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10"
        >
          View Profile
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <motion.div
          className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Book className="mx-auto h-5 w-5 text-blue-400" />
          <div className="mt-2 text-2xl font-bold text-white">{user?.public_repos || 0}</div>
          <div className="text-xs text-white/50">リポジトリ</div>
        </motion.div>
        <motion.div
          className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Star className="mx-auto h-5 w-5 text-yellow-400" />
          <div className="mt-2 text-2xl font-bold text-white">{totalStars}</div>
          <div className="text-xs text-white/50">スター</div>
        </motion.div>
        <motion.div
          className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GitFork className="mx-auto h-5 w-5 text-purple-400" />
          <div className="mt-2 text-2xl font-bold text-white">{totalForks}</div>
          <div className="text-xs text-white/50">フォーク</div>
        </motion.div>
        <motion.div
          className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <GitCommit className="mx-auto h-5 w-5 text-green-400" />
          <div className="mt-2 text-2xl font-bold text-white">{pushEvents}</div>
          <div className="text-xs text-white/50">直近のPush</div>
        </motion.div>
      </div>

      {/* Contribution Heatmap */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-4">
        <h4 className="mb-4 text-sm font-medium text-white/70">コミット活動</h4>
        
        {/* Month labels */}
        <div className="mb-2 ml-8 flex gap-1">
          {months.map((month, i) => (
            <div
              key={`${month.name}-${i}`}
              className="text-[10px] text-white/40"
              style={{ marginLeft: i > 0 ? `${(month.week - months[i - 1].week - 1) * 14}px` : 0 }}
            >
              {month.name}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 pr-2 text-[10px] text-white/40">
            <span className="h-3" />
            <span className="h-3">月</span>
            <span className="h-3" />
            <span className="h-3">水</span>
            <span className="h-3" />
            <span className="h-3">金</span>
            <span className="h-3" />
          </div>

          {/* Grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  const intensity = getIntensity(day.count);
                  const dateStr = day.date.toLocaleDateString("ja-JP", {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <motion.div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`group relative h-3 w-3 cursor-pointer rounded-sm border ${intensityColors[intensity]} transition-transform hover:scale-125`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: (weekIndex * 7 + dayIndex) * 0.001,
                        duration: 0.15,
                      }}
                    >
                      {/* Tooltip */}
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="whitespace-nowrap rounded-lg bg-night px-2 py-1 text-xs text-white shadow-lg">
                          <div className="font-medium">{dateStr}</div>
                          <div className="text-white/60">{day.count} contributions</div>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 border-4 border-transparent border-t-night" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-white/40">
          <span>Less</span>
          {intensityColors.map((color, i) => (
            <div key={i} className={`h-3 w-3 rounded-sm border ${color}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Language Distribution */}
      {topLanguages.length > 0 && (
        <motion.div
          className="rounded-xl border border-white/10 bg-white/5 p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h4 className="mb-4 text-sm font-medium text-white/70">使用言語</h4>
          <div className="mb-3 flex h-3 overflow-hidden rounded-full">
            {topLanguages.map(([lang, count]) => (
              <div
                key={lang}
                className="transition-all"
                style={{
                  width: `${(count / totalLangCount) * 100}%`,
                  backgroundColor: LANGUAGE_COLORS[lang] || "#888",
                }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            {topLanguages.map(([lang, count]) => (
              <div key={lang} className="flex items-center gap-2 text-sm">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: LANGUAGE_COLORS[lang] || "#888" }}
                />
                <span className="text-white/70">{lang}</span>
                <span className="text-white/40">
                  {((count / totalLangCount) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Top Repositories */}
      {topRepos.length > 0 && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h4 className="text-sm font-medium text-white/70">人気リポジトリ</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {topRepos.map((repo) => (
              <a
                key={repo.name}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
              >
                <div className="flex items-start justify-between">
                  <h5 className="font-medium text-white group-hover:text-accent">
                    {repo.name}
                  </h5>
                  {repo.language && (
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || "#888" }}
                    />
                  )}
                </div>
                {repo.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-white/50">
                    {repo.description}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-4 text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {repo.stargazers_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="h-3 w-3" />
                    {repo.forks_count}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
