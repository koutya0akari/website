import { createCollectionHandlers } from "@/lib/admin/content-route-factory";
import { memoRouteConfig } from "@/lib/admin/content-route-configs";

export const { GET, POST } = createCollectionHandlers(memoRouteConfig);
