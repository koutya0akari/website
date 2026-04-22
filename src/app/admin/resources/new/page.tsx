import { NewResourcePageClient } from "@/components/admin/NewResourcePageClient";
import type { ResourceFormData } from "@/components/admin/ResourceForm";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function NewResourcePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialData: Partial<ResourceFormData> = {
    title: getSearchParam(params.title),
    description: getSearchParam(params.description),
    category: getSearchParam(params.category),
    fileUrl: getSearchParam(params.fileUrl),
    externalUrl: getSearchParam(params.externalUrl),
  };
  const isGitHubResource = getSearchParam(params.source) === "github";

  return <NewResourcePageClient initialData={initialData} isGitHubResource={isGitHubResource} />;
}
