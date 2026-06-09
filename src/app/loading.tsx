/**
 * App-level loading UI — Next.js streaming için kritik.
 * Bu dosya VAR OLDUĞU İÇİN kullanıcı artık beyaz ekran görmüyor;
 * tarayıcı, sayfanın SSR'ı bitmeden önce buradaki skeleton'ı anında çiziyor.
 *
 * Aynı zamanda navigation transitions sırasında da gösterilir
 * (Link tıklaması → yeni sayfa hazırlanırken).
 */
export default function Loading() {
  return (
    <div className="relative min-h-[60vh] overflow-hidden">
      {/* Hero skeleton */}
      <section className="relative overflow-hidden">
        {/* Ambient orbs — aynı görsel imza */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute left-[8%] top-[15%] h-64 w-64 rounded-full bg-brand-yellow/15 blur-[60px]" />
          <div className="absolute right-[5%] top-[25%] h-80 w-80 rounded-full bg-brand-yellow/10 blur-[70px]" />
        </div>

        <div className="mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-6 py-24 text-center">
          {/* Badge skeleton */}
          <div className="mb-6 h-8 w-48 animate-pulse rounded-full bg-white/5 ring-1 ring-white/10" />

          {/* Title skeleton */}
          <div className="space-y-3">
            <div className="mx-auto h-14 w-[min(620px,80vw)] animate-pulse rounded-2xl bg-white/[0.04]" />
            <div className="mx-auto h-14 w-[min(540px,70vw)] animate-pulse rounded-2xl bg-brand-yellow/10" />
            <div className="mx-auto h-14 w-[min(580px,75vw)] animate-pulse rounded-2xl bg-white/[0.04]" />
          </div>

          {/* Subtitle */}
          <div className="mt-8 space-y-2">
            <div className="mx-auto h-4 w-[min(520px,70vw)] animate-pulse rounded-full bg-white/[0.04]" />
            <div className="mx-auto h-4 w-[min(420px,60vw)] animate-pulse rounded-full bg-white/[0.04]" />
          </div>

          {/* CTA skeletons */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <div className="h-12 w-44 animate-pulse rounded-full bg-brand-yellow/30" />
            <div className="h-12 w-44 animate-pulse rounded-full bg-white/5 ring-1 ring-white/15" />
          </div>

          {/* Stats skeleton */}
          <div className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-black/20 px-4 py-6 text-center">
                <div className="mx-auto h-7 w-14 animate-pulse rounded bg-brand-yellow/10" />
                <div className="mx-auto mt-2 h-3 w-16 animate-pulse rounded bg-white/[0.06]" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
