export default function AdminLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-yellow/20 border-t-brand-yellow" />
        <p className="text-sm text-white/40">Yükleniyor…</p>
      </div>
    </div>
  );
}
