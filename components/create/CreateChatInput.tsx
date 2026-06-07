"use client";

export function CreateChatInput({ hint }: { hint: string }) {
  return (
    <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
      {hint}
    </div>
  );
}
