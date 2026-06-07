"use client";

import { useBrandProfile } from "@/contexts/BrandProfileContext";
import { findBrandProfile } from "@/lib/sessions/approved-post";
import {
  isProfileComplete,
  loadStoredProfile,
  saveStoredProfile,
  setOnboardedCookie,
} from "@/lib/brand-profile-storage";
import type { ChatThread } from "@/lib/types";
import { useEffect, useRef } from "react";

async function findLatestSessionProfile(): Promise<ReturnType<
  typeof findBrandProfile
> | null> {
  const res = await fetch("/api/sessions");
  if (!res.ok) return null;
  const data = (await res.json()) as {
    enabled?: boolean;
    threads?: ChatThread[];
  };
  if (!data.enabled || !data.threads?.length) return null;

  const sorted = [...data.threads].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  for (const thread of sorted) {
    const msgRes = await fetch(`/api/sessions/${thread.id}/messages`);
    if (!msgRes.ok) continue;
    const { messages } = (await msgRes.json()) as {
      messages: Parameters<typeof findBrandProfile>[0];
    };
    const profile = findBrandProfile(messages);
    if (isProfileComplete(profile)) return profile;
  }

  return null;
}

export function ProfileBootstrap() {
  const { brandProfile, setBrandProfile } = useBrandProfile();
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    const stored = loadStoredProfile();
    if (stored) {
      if (!isProfileComplete(brandProfile)) {
        setBrandProfile(stored);
      }
      setOnboardedCookie();
      return;
    }

    void (async () => {
      const sessionProfile = await findLatestSessionProfile();
      if (!sessionProfile) return;
      setBrandProfile(sessionProfile);
      saveStoredProfile(sessionProfile);
      setOnboardedCookie();
    })();
  }, [brandProfile, setBrandProfile]);

  return null;
}
