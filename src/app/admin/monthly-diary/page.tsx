import { ContentListPage } from "@/components/admin/ContentListPage";

export default function MonthlyDiaryListPage() {
  return (
    <ContentListPage
      heading="日記"
      description="1 か月を 1 エントリとして管理します。"
      apiPath="/api/admin/monthly-diary"
      adminBasePath="/admin/monthly-diary"
      publicBasePath="/monthly-diary"
      fetchErrorMessage="日記の取得に失敗しました"
      deleteErrorMessage="日記の削除に失敗しました"
    />
  );
}
