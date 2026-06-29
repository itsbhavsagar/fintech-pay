import { revalidateTag } from "next/cache";

export function revalidateUserDashboard(userId: string): void {
  revalidateTag(`analytics-${userId}`);
  revalidateTag(`dashboard-stats-${userId}`);
  revalidateTag(`intelligence-${userId}`);
  revalidateTag(`transaction-filters-${userId}`);
}
