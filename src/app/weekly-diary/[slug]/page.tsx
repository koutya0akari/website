import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function WeeklyDiaryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/monthly-diary/${slug}`);
}
