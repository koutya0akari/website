"use client";

import { useRouter } from "next/navigation";
import { ResourceForm, type ResourceFormData } from "@/components/admin/ResourceForm";

export default function NewResourcePage() {
  const router = useRouter();

  const handleSubmit = async (data: ResourceFormData) => {
    const res = await fetch("/api/admin/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/admin/resources");
    } else {
      const error = await res.json();
      alert(error.error || "作成に失敗しました");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">新規資料</h1>
      <ResourceForm onSubmit={handleSubmit} isNew />
    </div>
  );
}

