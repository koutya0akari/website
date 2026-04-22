import { redirect } from "next/navigation";

export default function NewWeeklyDiaryPage() {
  redirect("/admin/monthly-diary/new");
}
