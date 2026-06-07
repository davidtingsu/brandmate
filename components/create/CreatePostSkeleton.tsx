export function CreatePostSkeleton() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-200" />
          <div className="space-y-2">
            <div className="h-3.5 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
        <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6">
        <div className="flex flex-1 flex-col gap-6">
          <div className="flex justify-end">
            <div className="h-10 w-48 animate-pulse rounded-2xl rounded-br-sm bg-slate-200" />
          </div>
          <div className="flex justify-start">
            <div className="space-y-2">
              <div className="h-4 w-72 max-w-full animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-56 max-w-full animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-64 max-w-full animate-pulse rounded bg-slate-100" />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="h-10 w-36 animate-pulse rounded-2xl rounded-br-sm bg-slate-200" />
          </div>
          <div className="flex justify-start">
            <div className="space-y-2">
              <div className="h-4 w-80 max-w-full animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-52 max-w-full animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
          <div className="h-11 flex-1 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
    </main>
  );
}
