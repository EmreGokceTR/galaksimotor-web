export default function UrunlerLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Header skeleton */}
      <div className="mb-8 h-8 w-48 animate-shimmer rounded-lg bg-white/[0.06]" />

      {/* Filter bar skeleton */}
      <div className="mb-6 flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-24 animate-shimmer rounded-full bg-white/[0.06]" />
        ))}
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3">
            <div className="aspect-square animate-shimmer rounded-xl bg-white/[0.06]" />
            <div className="h-4 w-3/4 animate-shimmer rounded bg-white/[0.06]" />
            <div className="h-4 w-1/2 animate-shimmer rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>
    </div>
  );
}
