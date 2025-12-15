import { normalizeRichTextToHtml, normalizeRichTextToInlineHtml } from "@/lib/markdown";
import { cn } from "@/lib/utils";

type RichTextProps = {
  content: string;
  className?: string;
  prose?: boolean;
  compact?: boolean;
  as?: "div" | "span";
  inline?: boolean;
};

export function RichText({
  content,
  className,
  prose = true,
  compact = true,
  as: Tag = "div",
  inline = false,
}: RichTextProps) {
  const html = inline ? normalizeRichTextToInlineHtml(content) : normalizeRichTextToHtml(content);
  if (!html) return null;

  const proseClasses = prose
    ? cn(
        "prose prose-invert max-w-none",
        compact &&
          "prose-p:my-0 prose-ul:my-0 prose-ol:my-0 prose-li:my-0 prose-pre:my-0 prose-blockquote:my-0",
      )
    : "";

  return (
    <Tag
      className={cn(proseClasses, className)}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
