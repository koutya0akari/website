'use client';

import Giscus from '@giscus/react';

export function Comments() {
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  if (!repoId || !categoryId) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="mt-10 border-t border-white/10 pt-10">
          <h2 className="mb-6 text-2xl font-semibold text-white">Comments</h2>
          <div className="rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-4 text-yellow-200">
            <p className="font-semibold">Giscus Configuration Missing</p>
            <p className="mt-1 text-sm">
              Please set <code>NEXT_PUBLIC_GISCUS_REPO_ID</code> and <code>NEXT_PUBLIC_GISCUS_CATEGORY_ID</code> in your
              environment variables.
            </p>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="mt-10 border-t border-white/10 pt-10">
      <h2 className="mb-6 text-2xl font-semibold text-white">Comments</h2>
      <Giscus
        id="comments"
        repo="koutya0akari/website"
        repoId={repoId}
        category="Announcements"
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
