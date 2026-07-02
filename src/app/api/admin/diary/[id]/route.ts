import { createItemHandlers } from "@/lib/admin/content-route-factory";
import { diaryRouteConfig } from "@/lib/admin/content-route-configs";

export const { GET, PUT, DELETE } = createItemHandlers(diaryRouteConfig);
