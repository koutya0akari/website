export function estimateReadingTime(content: string, wordsPerMinute = 400): number {
  const text = content.replace(/<[^>]*>/g, "");
  const japaneseChars =
    (text.match(/[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]/g) || [])
      .length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;

  const japaneseMinutes = japaneseChars / wordsPerMinute;
  const englishMinutes = englishWords / 250;

  return Math.ceil(japaneseMinutes + englishMinutes) || 1;
}
