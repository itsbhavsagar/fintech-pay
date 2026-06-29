export const QUERY_STALE_TIME = 5 * 60 * 1000;
export const QUERY_GC_TIME = 10 * 60 * 1000;
export const NOTIFICATIONS_POLL_INTERVAL = 2 * 60 * 1000;

export function isPeriodTransitioning(query: {
  isFetching: boolean;
  isPlaceholderData: boolean;
}): boolean {
  return query.isFetching && query.isPlaceholderData;
}
