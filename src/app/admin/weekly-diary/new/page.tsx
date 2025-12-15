"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DiaryForm, DiaryFormData } from "@/components/admin/DiaryForm";
import { useToast } from "@/components/admin/ToastProvider";

export default function NewWeeklyDiaryPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (data: DiaryFormData) => {
    try {
      const response = await fetch("/api/admin/weekly-diary", {
        method: "POST",
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
        throw new Error(error.error || "Failed to create post");
      }

      const result = await response.json();
      showSuccess("Post created successfully!");
      router.push(`/admin/weekly-diary/${result.data.id}/edit`);
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to create post");
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/weekly-diary"
          className="rounded-md border border-night-muted p-2 text-gray-400 hover:bg-night-muted hover:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-100">Create New Weekly Diary</h1>
      </div>

      <div className="rounded-lg border border-night-muted bg-night-soft p-6">
        <DiaryForm
          initialData={{ folder: "Weekly Diary" }}
          onSubmit={handleSubmit}
          isNew={true}
          previewBasePath="/weekly-diary"
          formKey="weekly-diary"
          folderDisabled
        />
      </div>
    </div>
  );
}
