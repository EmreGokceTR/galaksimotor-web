export default function RandevuLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <div className="border-b border-white/10 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mx-auto mb-4 h-3 w-32 animate-shimmer rounded bg-white/[0.06]" />
          <div className="mx-auto mb-3 h-10 w-3/4 max-w-lg animate-shimmer rounded-lg bg-white/[0.06]" />
          <div className="mx-auto h-4 w-2/3 max-w-md animate-shimmer rounded bg-white/[0.06]" />
        </div>
      </div>

      {/* Servisler skeleton */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto mb-2 h-6 w-56 animate-shimmer rounded bg-white/[0.06]" />
        <div className="mx-auto mb-10 h-4 w-80 max-w-full animate-shimmer rounded bg-white/[0.06]" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="h-5 w-32 animate-shimmer rounded bg-white/[0.06]" />
                <div className="h-5 w-16 animate-shimmer rounded bg-white/[0.06]" />
              </div>
              <div className="mb-2 h-3 w-full animate-shimmer rounded bg-white/[0.06]" />
              <div className="mb-3 h-3 w-3/4 animate-shimmer rounded bg-white/[0.06]" />
              <div className="h-3 w-20 animate-shimmer rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
