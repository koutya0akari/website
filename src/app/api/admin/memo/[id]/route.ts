import { createItemHandlers } from "@/lib/admin/content-route-factory";
import { memoRouteConfig } from "@/lib/admin/content-route-configs";

export const { GET, PUT, DELETE } = createItemHandlers(memoRouteConfig);
