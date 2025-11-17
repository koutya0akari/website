type DiaryBodyProps = {
  html: string;
};

export function DiaryBody({ html }: DiaryBodyProps) {
  return <div className="prose-custom" dangerouslySetInnerHTML={{ __html: html }} />;
}
