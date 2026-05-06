import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type LoadMoreButtonProps = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  itemName?: string;
  isInitialLoading?: boolean;
  isRefreshing?: boolean;
  itemCount?: number;
};

export function LoadMoreButton({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  itemName = "items",
  isInitialLoading = false,
  isRefreshing = false,
  itemCount = 0,
}: LoadMoreButtonProps) {
  if (isInitialLoading) return null;

  return (
    <div className="flex justify-center py-4">
      {hasNextPage ? (
        <Button
          variant="outline"
          onClick={() => void fetchNextPage()}
          disabled={isFetchingNextPage}
          className="min-w-[140px]"
        >
          {isFetchingNextPage ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Load More"
          )}
        </Button>
      ) : !isRefreshing && itemCount > 0 ? (
        <p className="text-sm text-muted-foreground">No more {itemName} to show</p>
      ) : null}
    </div>
  );
}
