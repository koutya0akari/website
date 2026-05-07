'use client';

import Giscus from '@giscus/react';

const GISCUS_REPO = "koutya0akari/website";
const GISCUS_REPO_ID = "R_kgDOP878Hw";
const GISCUS_CATEGORY = "General";
const GISCUS_CATEGORY_ID = "DIC_kwDOP878H84Cx8Ub";

export function Comments() {
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID || GISCUS_REPO_ID;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || GISCUS_CATEGORY_ID;

  return (
    <div className="mt-10 border-t border-transparent pt-10">
      <h2 className="mb-6 text-2xl font-semibold text-white">Comments</h2>
      <Giscus
        id="comments"
        repo={GISCUS_REPO}
        repoId={repoId}
        category={GISCUS_CATEGORY}
        categoryId={categoryId}
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme="dark"
        lang="ja"
        loading="lazy"
      />
    </div>
  );
}
