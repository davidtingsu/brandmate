"use client";

import {
  computeEstimatedProgress,
  formatTimeRemaining,
} from "@/lib/generation-estimates";
import { useEffect, useState } from "react";

export function useGenerationProgress(
  startedAt: number,
  estimateMs: number,
  complete = false
) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (complete) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [startedAt, estimateMs, complete]);

  void tick;

  const progress = computeEstimatedProgress(startedAt, estimateMs, complete);
  const timeRemaining = formatTimeRemaining(startedAt, estimateMs);

  return { progress, timeRemaining };
}
