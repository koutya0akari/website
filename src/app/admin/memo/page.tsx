"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FilePlus } from "lucide-react";

import { DiaryList } from "@/components/admin/DiaryList";
import { useToast } from "@/components/admin/ToastProvider";

interface MemoItem {
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

export default function MemoListPage() {
  const { showError } = useToast();
  const [items, setItems] = useState<MemoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/admin/memo");
      if (!response.ok) {
        throw new Error("メモの取得に失敗しました");
      }
      const result = await response.json();
      setItems(result.data || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/memo/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("メモの削除に失敗しました");
      }

      await fetchItems();
    } catch (err) {
      showError(err instanceof Error ? err.message : "メモの削除に失敗しました");
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
        <div>
          <h1 className="text-3xl font-bold text-gray-100">メモ</h1>
          <p className="mt-2 text-sm text-gray-400">文章メモを管理します。</p>
        </div>
        <Link
          href="/admin/memo/new"
          className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 font-medium text-night transition-colors hover:bg-accent/90"
        >
          <FilePlus className="h-4 w-4" />
          新規作成
        </Link>
      </div>

      <DiaryList
        items={items}
        onDelete={handleDelete}
        adminBasePath="/admin/memo"
        publicBasePath="/memo"
      />
    </div>
  );
}
