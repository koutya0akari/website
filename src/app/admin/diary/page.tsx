"use client";

import { useState, useEffect } from "react";
import { DiaryList } from "@/components/admin/DiaryList";
import { FilePlus } from "lucide-react";
import Link from "next/link";

interface DiaryItem {
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

export default function DiaryListPage() {
  const [items, setItems] = useState<DiaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/admin/diary");
      if (!response.ok) {
        throw new Error("Failed to fetch diary entries");
      }
      const result = await response.json();
      setItems(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/diary/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete entry");
      }

      // Refresh the list
      await fetchItems();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete entry");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-100">Diary Posts</h1>
        <Link
          href="/admin/diary/new"
          className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 font-medium text-night transition-colors hover:bg-accent/90"
        >
          <FilePlus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      <DiaryList items={items} onDelete={handleDelete} />
    </div>
  );
}
