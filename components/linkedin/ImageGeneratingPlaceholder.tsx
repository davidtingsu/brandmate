"use client";

import { CircularProgressRing } from "@/components/ui/CircularProgressRing";

interface ImageGeneratingPlaceholderProps {
  progress: number;
  timeRemaining: string;
  className?: string;
}

export function ImageGeneratingPlaceholder({
  progress,
  timeRemaining,
  className = "",
}: ImageGeneratingPlaceholderProps) {
  return (
    <div
      className={`relative flex aspect-[1.91/1] w-full items-center justify-center bg-slate-100 ${className}`}
      data-testid="image-generating-placeholder"
    >
      <CircularProgressRing progress={progress} caption={timeRemaining} />
    </div>
  );
}
