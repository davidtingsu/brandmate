"use client";

interface CircularProgressRingProps {
  progress: number;
  size?: number;
  caption?: string;
  className?: string;
}

export function CircularProgressRing({
  progress,
  size = 72,
  caption,
  className = "",
}: CircularProgressRingProps) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, progress)) / 100);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-slate-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-linkedin transition-[stroke-dashoffset] duration-500"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-700">
          {Math.round(progress)}%
        </span>
      </div>
      {caption && (
        <p className="text-center text-xs font-medium text-slate-600">{caption}</p>
      )}
    </div>
  );
}
