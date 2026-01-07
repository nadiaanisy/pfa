export const ExpensesSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {Array.from({ length: 10 }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse bg-card p-4 rounded-2xl border border-border/50"
      >
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-muted rounded-xl" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-3 bg-muted rounded w-1/3" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);
