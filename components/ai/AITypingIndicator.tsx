export function AITypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3">
        <span className="size-2 animate-pulse rounded-full bg-primary" />
        <span className="size-2 animate-pulse rounded-full bg-primary delay-150" />
        <span className="size-2 animate-pulse rounded-full bg-primary delay-300" />
      </div>
    </div>
  );
}
