export function BrandHeader() {
  return (
    <header className="border-b border-slate-200/80 bg-gradient-to-r from-white to-blue-50/40 px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linkedin text-sm font-bold text-white">
          B
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Brand<span className="text-linkedin">Mate</span>
          </h1>
          <p className="text-sm text-slate-600">
            LinkedIn coach that learns from every draft
          </p>
        </div>
      </div>
    </header>
  );
}
