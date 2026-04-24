"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DiaryForm, DiaryFormData } from "@/components/admin/DiaryForm";
import { useToast } from "@/components/admin/ToastProvider";
import { MEMO_FOLDER } from "@/lib/monthly-diary-config";

export default function NewMemoPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (data: DiaryFormData) => {
    try {
      const response = await fetch("/api/admin/memo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          slug: data.slug,
          body: data.body,
          summary: data.summary,
          tags: data.tags,
          status: data.status,
          publishedAt: data.publishedAt,
          heroImageUrl: data.heroImageUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "メモの作成に失敗しました");
      }

      const result = await response.json();
      showSuccess("メモを作成しました");
      router.push(`/admin/memo/${result.data.id}/edit`);
    } catch (error) {
      showError(error instanceof Error ? error.message : "メモの作成に失敗しました");
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/memo"
          className="rounded-md border border-night-muted p-2 text-gray-400 hover:bg-night-muted hover:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-100">新しいメモを作成</h1>
      </div>

      <div className="rounded-lg border border-night-muted bg-night-soft p-6">
        <DiaryForm
          initialData={{ folder: MEMO_FOLDER }}
          onSubmit={handleSubmit}
          isNew={true}
          previewBasePath="/memo"
          formKey="memo"
          folderDisabled
        />
      </div>
    </div>
  );
}
