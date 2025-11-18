type DiaryBodyProps = {
  html: string;
};

export function DiaryBody({ html }: DiaryBodyProps) {
  return (
    <div
      className="prose prose-invert max-w-none prose-headings:font-semibold prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
