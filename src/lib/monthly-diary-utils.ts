import { format } from "date-fns";

import { estimateReadingTime } from "@/lib/reading-time";
import { createExcerpt, stripHtml } from "@/lib/utils";

export function formatMonthlyDiaryLabel(date: string) {
  try {
    return format(new Date(date), "yyyy年M月");
  } catch {
    return date;
  }
}

export function getMonthlyDiarySectionCount(html: string) {
  const h2Count = (html.match(/<h2\b/gi) || []).length;
  if (h2Count > 0) {
    return h2Count;
  }

  return (html.match(/<h3\b/gi) || []).length;
}

export function getMonthlyDiarySummary(summary: string, body: string, maxLength = 200) {
  const source = summary.trim() ? summary : body;
  return createExcerpt(stripHtml(source), maxLength);
}

export function getMonthlyDiaryReadingMinutes(body: string) {
  return estimateReadingTime(body);
}
