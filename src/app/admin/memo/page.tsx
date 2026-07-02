import { ContentListPage } from "@/components/admin/ContentListPage";

export default function MemoListPage() {
  return (
    <ContentListPage
      heading="メモ"
      description="文章メモを管理します。"
      apiPath="/api/admin/memo"
      adminBasePath="/admin/memo"
      publicBasePath="/memo"
      fetchErrorMessage="メモの取得に失敗しました"
      deleteErrorMessage="メモの削除に失敗しました"
    />
  );
}
