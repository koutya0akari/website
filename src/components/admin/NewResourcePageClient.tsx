"use client";

import { useRouter } from "next/navigation";

import { ResourceForm, type ResourceFormData } from "@/components/admin/ResourceForm";

type NewResourcePageClientProps = {
  initialData: Partial<ResourceFormData>;
  isGitHubResource: boolean;
};

export function NewResourcePageClient({ initialData, isGitHubResource }: NewResourcePageClientProps) {
  const router = useRouter();

  const handleSubmit = async (data: ResourceFormData) => {
    const res = await fetch("/api/admin/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/admin/resources");
      return;
    }

    const error = await res.json();
    if (res.status === 409 && error.existingId) {
      router.push(`/admin/resources/${error.existingId}/edit`);
      return;
    }

    alert(error.error || "作成に失敗しました");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">
          {isGitHubResource ? "GitHub PDF の補足を追加" : "新規資料"}
        </h1>
        {isGitHubResource ? (
          <p className="text-sm text-gray-400">
            GitHub で公開している PDF に対して、説明やカテゴリを追加できます。
          </p>
        ) : null}
      </div>
      <ResourceForm initialData={initialData} onSubmit={handleSubmit} isNew lockFileUrl={isGitHubResource} />
    </div>
  );
}
