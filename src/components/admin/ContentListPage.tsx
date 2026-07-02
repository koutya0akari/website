"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { FilePlus } from "lucide-react";

import { DiaryList } from "@/components/admin/DiaryList";
import { useToast } from "@/components/admin/ToastProvider";

// admin の diary / memo / monthly-diary 一覧ページの共通実装。
// 各ページはパスと文言を渡すだけの薄いラッパーになる。

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  folder?: string;
  tags: string[];
  link_only?: boolean;
  view_count: number;
  created_at: string;
  published_at?: string;
}

type ContentListPageProps = {
  heading: string;
  description?: string;
  apiPath: string;
  adminBasePath: string;
  publicBasePath: string;
  fetchErrorMessage: string;
  deleteErrorMessage: string;
};

export function ContentListPage({
  heading,
  description,
  apiPath,
  adminBasePath,
  publicBasePath,
  fetchErrorMessage,
  deleteErrorMessage,
}: ContentListPageProps) {
  const { showError } = useToast();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch(apiPath);
      if (!response.ok) {
        throw new Error(fetchErrorMessage);
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
  }, [apiPath, fetchErrorMessage, showError]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${apiPath}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(deleteErrorMessage);
      }

      await fetchItems();
    } catch (err) {
      showError(err instanceof Error ? err.message : deleteErrorMessage);
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-100 sm:text-3xl">{heading}</h1>
          {description && <p className="mt-2 text-sm text-gray-400">{description}</p>}
        </div>
        <Link
          href={`${adminBasePath}/new` as Route}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 font-medium text-night transition-colors hover:bg-accent/90 sm:w-auto"
        >
          <FilePlus className="h-4 w-4" />
          新規作成
        </Link>
      </div>

      <DiaryList
        items={items}
        onDelete={handleDelete}
        adminBasePath={adminBasePath}
        publicBasePath={publicBasePath}
      />
    </div>
  );
}
