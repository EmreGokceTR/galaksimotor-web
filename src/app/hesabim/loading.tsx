export default function HesabimLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Page title skeleton */}
      <div className="mb-8 h-8 w-40 animate-shimmer rounded-lg bg-white/[0.06]" />

      {/* Profile card skeleton */}
      <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 animate-shimmer rounded-full bg-white/[0.06]" />
          <div className="flex flex-col gap-2">
            <div className="h-5 w-36 animate-shimmer rounded bg-white/[0.06]" />
            <div className="h-4 w-48 animate-shimmer rounded bg-white/[0.06]" />
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="mb-6 flex gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-28 animate-shimmer rounded-full bg-white/[0.06]" />
        ))}
      </div>

      {/* Content rows skeleton */}
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-shimmer rounded-xl bg-white/[0.06]" />
        ))}
      </div>
    </div>
  );
}
