import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f3f2ef] p-6 text-center">
      <h1 className="text-lg font-semibold text-slate-900">Page not found</h1>
      <p className="text-sm text-slate-600">
        The page you are looking for does not exist or may have been removed.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-linkedin hover:text-blue-700"
      >
        Back to posts
      </Link>
    </main>
  );
}
