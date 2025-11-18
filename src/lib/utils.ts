import { clsx } from "clsx";
import { format } from "date-fns";

export function cn(...inputs: Array<string | undefined | false | null>) {
  return clsx(inputs);
}

export function formatDate(date: string, dateFormat = "yyyy.MM.dd") {
  try {
    return format(new Date(date), dateFormat);
  } catch {
    return date;
  }
}

export function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "");
}

export function createExcerpt(value: string, maxLength = 160) {
  const plain = stripHtml(value);
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength)}…`;
}

export function escapeHtml(value: string) {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (char) => entities[char] ?? char);
}
