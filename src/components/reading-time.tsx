"use client";

import { Clock } from "lucide-react";

interface ReadingTimeProps {
  content: string;
  wordsPerMinute?: number;
}

export function ReadingTime({ content, wordsPerMinute = 400 }: ReadingTimeProps) {
  // Count Japanese characters and words
  // Japanese: ~400-600 characters per minute
  // English: ~200-250 words per minute
  
  // Strip HTML tags
  const text = content.replace(/<[^>]*>/g, "");
  
  // Count Japanese characters (Hiragana, Katakana, Kanji)
  const japaneseChars = (text.match(/[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]/g) || []).length;
  
  // Count English words
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  
  // Calculate reading time
  const japaneseMinutes = japaneseChars / wordsPerMinute;
  const englishMinutes = englishWords / 250;
  const totalMinutes = Math.ceil(japaneseMinutes + englishMinutes);
  
  const displayTime = totalMinutes < 1 ? 1 : totalMinutes;

  return (
    <div className="flex items-center gap-1.5 text-xs text-white/50">
      <Clock className="h-3.5 w-3.5" />
      <span>約 {displayTime} 分で読めます</span>
    </div>
  );
}

export function calculateReadingTime(content: string, wordsPerMinute = 400): number {
  const text = content.replace(/<[^>]*>/g, "");
  const japaneseChars = (text.match(/[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const japaneseMinutes = japaneseChars / wordsPerMinute;
  const englishMinutes = englishWords / 250;
  return Math.ceil(japaneseMinutes + englishMinutes) || 1;
}

