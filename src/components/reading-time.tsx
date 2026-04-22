"use client";

import { Clock } from "lucide-react";

import { estimateReadingTime } from "@/lib/reading-time";

interface ReadingTimeProps {
  content: string;
  wordsPerMinute?: number;
}

export function ReadingTime({ content, wordsPerMinute = 400 }: ReadingTimeProps) {
  const displayTime = estimateReadingTime(content, wordsPerMinute);

  return (
    <div className="flex items-center gap-1.5 text-xs text-white/50">
      <Clock className="h-3.5 w-3.5" />
      <span>約 {displayTime} 分で読めます</span>
    </div>
  );
}

export function calculateReadingTime(content: string, wordsPerMinute = 400): number {
  return estimateReadingTime(content, wordsPerMinute);
}
