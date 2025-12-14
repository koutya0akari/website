"use client";

import Link from "next/link";
import { useState } from "react";
import { Edit, Eye, Trash2, Search } from "lucide-react";

interface DiaryListItem {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  folder?: string;
  tags: string[];
  view_count: number;
  created_at: string;
  published_at?: string;
}

interface DiaryListProps {
  items: DiaryListItem[];
  onDelete: (id: string) => Promise<void>;
  adminBasePath?: string;
  publicBasePath?: string;
}

export function DiaryList({
  items,
  onDelete,
  adminBasePath = "/admin/diary",
  publicBasePath = "/diary",
}: DiaryListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [sortBy, setSortBy] = useState<"created" | "published" | "title" | "views">("created");

  const filteredItems = items
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "created":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "published":
          return (
            new Date(b.published_at || b.created_at).getTime() -
            new Date(a.published_at || a.created_at).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        case "views":
          return b.view_count - a.view_count;
        default:
          return 0;
      }
    });

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await onDelete(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-lg border border-night-muted bg-night-soft p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts..."
            className="w-full rounded-md border border-night-muted bg-night py-2 pl-10 pr-4 text-gray-100 placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "draft" | "published")}
          className="rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="created">Sort by Created</option>
          <option value="published">Sort by Published</option>
          <option value="title">Sort by Title</option>
          <option value="views">Sort by Views</option>
        </select>
      </div>

      <div className="rounded-lg border border-night-muted bg-night-soft">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {searchTerm || statusFilter !== "all" ? "No posts match your filters" : "No posts yet"}
          </div>
        ) : (
          <div className="divide-y divide-night-muted">
            {filteredItems.map((item) => (
              <div key={item.id} className="p-4 transition-colors hover:bg-night">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        href={`${adminBasePath}/${item.id}/edit` as any}
                        className="text-lg font-medium text-gray-100 hover:text-accent"
                      >
                        {item.title}
                      </Link>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.status === "published"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="mt-1 text-sm text-gray-400">
                      <span className="font-mono">{item.slug}</span>
                      {item.folder && <span className="ml-3">📁 {item.folder}</span>}
                    </div>

                    {item.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-accent/10 px-2 py-0.5 text-xs text-accent"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 text-xs text-gray-500">
                      Created: {new Date(item.created_at).toLocaleDateString()}
                      {item.published_at && (
                        <> • Published: {new Date(item.published_at).toLocaleDateString()}</>
                      )}
                      <> • Views: {item.view_count}</>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      href={`${adminBasePath}/${item.id}/edit` as any}
                      className="rounded-md border border-night-muted bg-night px-3 py-2 text-gray-300 transition-colors hover:bg-night-muted"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>

                    {item.status === "published" && (
                      <a
                        href={`${publicBasePath}/${item.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md border border-night-muted bg-night px-3 py-2 text-gray-300 transition-colors hover:bg-night-muted"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    )}

                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="rounded-md border border-red-500/20 bg-night px-3 py-2 text-red-400 transition-colors hover:bg-red-500/10"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center text-sm text-gray-500">
        Showing {filteredItems.length} of {items.length} posts
      </div>
    </div>
  );
}
