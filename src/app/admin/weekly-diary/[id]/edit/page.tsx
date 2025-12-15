"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

import { DiaryForm, DiaryFormData } from "@/components/admin/DiaryForm";
import { useToast } from "@/components/admin/ToastProvider";

export default function EditWeeklyDiaryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { showSuccess, showError } = useToast();

  const [initialData, setInitialData] = useState<Partial<DiaryFormData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchEntry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchEntry = async () => {
    try {
      const response = await fetch(`/api/admin/weekly-diary/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch weekly diary entry");
      }
      const result = await response.json();
      const data = result.data;

      setInitialData({
        title: data.title,
        slug: data.slug,
        body: data.body || "",
        summary: data.summary || "",
        folder: data.folder || "",
        tags: data.tags || [],
        status: data.status,
        publishedAt: data.published_at
          ? new Date(data.published_at).toISOString().slice(0, 16)
          : data.status === "published"
            ? new Date().toISOString().slice(0, 16)
            : "",
        heroImageUrl: data.hero_image_url || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: DiaryFormData) => {
    try {
      const response = await fetch(`/api/admin/weekly-diary/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          slug: data.slug,
          body: data.body,
          summary: data.summary,
          folder: data.folder,
          tags: data.tags,
          status: data.status,
          publishedAt: data.publishedAt,
          heroImageUrl: data.heroImageUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update post");
      }

      showSuccess("Post updated successfully!");
      await fetchEntry();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to update post");
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/weekly-diary/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      showSuccess("Post deleted successfully!");
      router.push("/admin/weekly-diary");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to delete post");
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/weekly-diary"
          className="flex items-center gap-2 text-gray-400 hover:text-accent"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to list
        </Link>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          {error || "Failed to load weekly diary entry"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/weekly-diary"
          className="rounded-md border border-night-muted p-2 text-gray-400 hover:bg-night-muted hover:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-100">Edit Weekly Diary</h1>
      </div>

      <div className="rounded-lg border border-night-muted bg-night-soft p-6">
        <DiaryForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          isNew={false}
          previewBasePath="/weekly-diary"
          formKey="weekly-diary"
          folderDisabled
        />
      </div>
    </div>
  );
}
