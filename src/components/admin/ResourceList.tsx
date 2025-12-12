"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ExternalLink, FileText, Search, Filter } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  file_url: string | null;
  external_url: string | null;
  created_at: string;
}

export function ResourceList() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await fetch("/api/admin/resources");
      if (res.ok) {
        const { data } = await res.json();
        setResources(data || []);
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map((r: Resource) => r.category).filter(Boolean))] as string[];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この資料を削除しますか？")) return;

    try {
      const res = await fetch(`/api/admin/resources/${id}`, { method: "DELETE" });
      if (res.ok) {
        setResources(resources.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete resource:", error);
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesCategory = !categoryFilter || resource.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="text-center text-gray-400">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Resources</h1>
        <Link
          href="/admin/resources/new"
          className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-night hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" />
          新規作成
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-night-muted bg-night py-2 pl-10 pr-4 text-gray-100 placeholder-gray-500 focus:border-accent focus:outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none rounded-md border border-night-muted bg-night py-2 pl-10 pr-8 text-gray-100 focus:border-accent focus:outline-none"
          >
            <option value="">すべてのカテゴリ</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      {filteredResources.length === 0 ? (
        <div className="rounded-lg border border-night-muted bg-night-soft p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-500" />
          <p className="mt-4 text-gray-400">資料がありません</p>
          <Link
            href="/admin/resources/new"
            className="mt-4 inline-flex items-center gap-2 text-accent hover:underline"
          >
            <Plus className="h-4 w-4" />
            最初の資料を作成
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-night-muted">
          <table className="w-full">
            <thead className="bg-night-soft">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">タイトル</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">カテゴリ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">リンク</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">作成日</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-night-muted">
              {filteredResources.map((resource) => (
                <tr key={resource.id} className="hover:bg-night-soft/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{resource.title}</div>
                    {resource.description && (
                      <div className="mt-1 text-sm text-gray-400 line-clamp-1">{resource.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {resource.category && (
                      <span className="rounded-md bg-accent/10 px-2 py-1 text-xs text-accent">
                        {resource.category}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {(resource.file_url || resource.external_url) && (
                      <a
                        href={resource.file_url || resource.external_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-accent hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        開く
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(resource.created_at).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/resources/${resource.id}/edit`}
                        className="rounded p-1.5 text-gray-400 hover:bg-night-muted hover:text-white"
                        title="編集"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(resource.id)}
                        className="rounded p-1.5 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                        title="削除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

