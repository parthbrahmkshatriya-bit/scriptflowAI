export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 space-y-2">
            <div className="h-3 w-20 rounded bg-white/[0.06]" />
            <div className="h-7 w-12 rounded-lg bg-white/[0.08]" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-white/[0.06]">
          <div className="h-5 w-24 rounded bg-white/[0.06]" />
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-4">
            <div className="h-4 w-48 rounded bg-white/[0.06]" />
            <div className="h-4 w-16 rounded-full bg-white/[0.04]" />
            <div className="h-4 w-12 rounded bg-white/[0.04]" />
            <div className="h-4 w-20 rounded bg-white/[0.04] ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
