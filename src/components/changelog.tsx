"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GitCommit, ExternalLink, Calendar, ChevronDown, ChevronUp } from "lucide-react";

interface CommitData {
  sha: string;
  message: string;
  date: string;
  url: string;
}

interface GroupedCommits {
  date: string;
  displayDate: string;
  commits: CommitData[];
}

interface ChangelogProps {
  username?: string;
  repo?: string;
}

export function Changelog({ username = "Mori-Yusei", repo = "website" }: ChangelogProps) {
  const [commits, setCommits] = useState<CommitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function fetchCommits() {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.github.com/repos/${username}/${repo}/commits?per_page=50`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch commits");
        }

        const data = await response.json();
        const formattedCommits: CommitData[] = data.map(
          (commit: {
            sha: string;
            commit: {
              message: string;
              author: { date: string };
            };
            html_url: string;
          }) => ({
            sha: commit.sha,
            message: commit.commit.message.split("\n")[0],
            date: commit.commit.author.date,
            url: commit.html_url,
          })
        );

        setCommits(formattedCommits);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchCommits();
  }, [username, repo]);

  // 日付でグループ化
  const groupedCommits: GroupedCommits[] = (() => {
    const groups = new Map<string, CommitData[]>();

    commits.forEach((commit) => {
      const date = new Date(commit.date);
      const dateKey = date.toISOString().split("T")[0];
      const existing = groups.get(dateKey) || [];
      existing.push(commit);
      groups.set(dateKey, existing);
    });

    return Array.from(groups.entries())
      .map(([dateKey, commits]) => ({
        date: dateKey,
        displayDate: new Date(dateKey).toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        commits,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  })();

  const displayedGroups = expanded ? groupedCommits : groupedCommits.slice(0, 5);
  const hasMore = groupedCommits.length > 5;

  // コミットメッセージをカテゴリ分け
  const getCommitCategory = (message: string): { label: string; color: string } => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.startsWith("feat") || lowerMessage.includes("add")) {
      return { label: "✨ 新機能", color: "text-green-400" };
    }
    if (lowerMessage.startsWith("fix") || lowerMessage.includes("bug")) {
      return { label: "🐛 修正", color: "text-yellow-400" };
    }
    if (lowerMessage.startsWith("refactor")) {
      return { label: "♻️ リファクタ", color: "text-blue-400" };
    }
    if (lowerMessage.startsWith("style") || lowerMessage.includes("ui")) {
      return { label: "🎨 スタイル", color: "text-purple-400" };
    }
    if (lowerMessage.startsWith("docs")) {
      return { label: "📝 ドキュメント", color: "text-cyan-400" };
    }
    if (lowerMessage.startsWith("perf")) {
      return { label: "⚡ パフォーマンス", color: "text-orange-400" };
    }
    if (lowerMessage.startsWith("chore") || lowerMessage.startsWith("build")) {
      return { label: "🔧 メンテナンス", color: "text-gray-400" };
    }
    return { label: "🔄 更新", color: "text-white/70" };
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-3 w-3 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded bg-white/10" />
              <div className="h-3 w-48 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-400">
        変更履歴の取得に失敗しました
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="text-center text-white/50">
        変更履歴はありません
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-accent/50 via-white/20 to-transparent" />

        <div className="space-y-6">
          {displayedGroups.map((group, groupIndex) => (
            <motion.div
              key={group.date}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: groupIndex * 0.05 }}
              className="relative pl-8"
            >
              {/* Date marker */}
              <div className="absolute left-0 top-0 flex h-3 w-3 items-center justify-center">
                <div className="h-3 w-3 rounded-full border-2 border-accent bg-night" />
              </div>

              {/* Date header */}
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/80">
                <Calendar className="h-3.5 w-3.5 text-accent" />
                {group.displayDate}
              </div>

              {/* Commits for this date */}
              <div className="space-y-2">
                {group.commits.map((commit, commitIndex) => {
                  const category = getCommitCategory(commit.message);
                  return (
                    <motion.a
                      key={commit.sha}
                      href={commit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: groupIndex * 0.05 + commitIndex * 0.02 }}
                      className="group flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-all hover:border-white/10 hover:bg-white/5"
                    >
                      <GitCommit className="mt-0.5 h-4 w-4 flex-shrink-0 text-white/30 group-hover:text-accent" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${category.color}`}>
                            {category.label}
                          </span>
                          <span className="font-mono text-[10px] text-white/30">
                            {commit.sha.slice(0, 7)}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm text-white/70 group-hover:text-white">
                          {commit.message}
                        </p>
                      </div>
                      <ExternalLink className="h-3 w-3 flex-shrink-0 text-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Show more/less button */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-3 text-sm text-white/60 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              折りたたむ
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              もっと見る ({groupedCommits.length - 5} 日分)
            </>
          )}
        </button>
      )}
    </div>
  );
}
