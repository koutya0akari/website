import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditWeeklyDiaryPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/admin/monthly-diary/${id}/edit`);
}
