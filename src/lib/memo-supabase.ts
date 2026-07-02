import "server-only";

import { createContentEntriesModule } from "@/lib/content-entries";
import { MEMO_FOLDER } from "@/lib/monthly-diary-config";

const memoModule = createContentEntriesModule({
  label: "memo",
  applyScope: (query) => query.eq("folder", MEMO_FOLDER),
  resolveFolder: () => MEMO_FOLDER,
});

export const getMemoEntries = memoModule.getEntries;
export const getMemoBySlug = memoModule.getBySlug;
