export const IncomeSourcesSkeleton = () => (
  <div className="grid md:grid-cols-2 gap-4 mt-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="h-32 rounded-2xl bg-muted animate-pulse"
      />
    ))}
  </div>
);
