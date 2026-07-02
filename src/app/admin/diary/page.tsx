import { ContentListPage } from "@/components/admin/ContentListPage";

export default function DiaryListPage() {
  return (
    <ContentListPage
      heading="数学メモ"
      apiPath="/api/admin/diary"
      adminBasePath="/admin/diary"
      publicBasePath="/diary"
      fetchErrorMessage="Failed to fetch diary entries"
      deleteErrorMessage="Failed to delete entry"
    />
  );
}
