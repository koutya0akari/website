import { createItemHandlers } from "@/lib/admin/content-route-factory";
import { monthlyDiaryRouteConfig } from "@/lib/admin/content-route-configs";

export const { GET, PUT, DELETE } = createItemHandlers(monthlyDiaryRouteConfig);
