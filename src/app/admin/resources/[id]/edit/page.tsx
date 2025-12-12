"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ResourceForm, type ResourceFormData } from "@/components/admin/ResourceForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EditResourcePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [initialData, setInitialData] = useState<ResourceFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await fetch(`/api/admin/resources/${id}`);
        if (res.ok) {
          const { data } = await res.json();
          setInitialData({
            title: data.title || "",
            description: data.description || "",
            category: data.category || "",
            fileUrl: data.file_url || "",
            externalUrl: data.external_url || "",
          });
        } else {
          router.push("/admin/resources");
        }
      } catch (error) {
        console.error("Failed to fetch resource:", error);
        router.push("/admin/resources");
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id, router]);

  const handleSubmit = async (data: ResourceFormData) => {
    const res = await fetch(`/api/admin/resources/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/admin/resources");
    } else {
      const error = await res.json();
      alert(error.error || "更新に失敗しました");
    }
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/admin/resources/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/admin/resources");
    } else {
      alert("削除に失敗しました");
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400">読み込み中...</div>;
  }

  if (!initialData) {
    return <div className="text-center text-gray-400">資料が見つかりません</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">資料を編集</h1>
      <ResourceForm initialData={initialData} onSubmit={handleSubmit} onDelete={handleDelete} isNew={false} />
    </div>
  );
}

