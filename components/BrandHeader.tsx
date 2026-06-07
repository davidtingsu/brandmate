import Image from "next/image";

export function BrandHeader() {
  return (
    <header className="border-b border-slate-200/80 bg-gradient-to-r from-white to-blue-50/40 px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <Image
          src="/brandmate-logo.png"
          alt="BrandMate"
          width={40}
          height={40}
          className="h-10 w-10 rounded-xl"
          priority
        />
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
