"use client";

import type { BrandProfile } from "@/lib/types";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

const DEFAULT_PROFILE: BrandProfile = {
  name: "",
  niche: "",
  audience: "",
  voice: "",
};

interface BrandProfileContextValue {
  brandProfile: BrandProfile;
  setBrandProfile: Dispatch<SetStateAction<BrandProfile>>;
}

const BrandProfileContext = createContext<BrandProfileContextValue | null>(null);

export function BrandProfileProvider({ children }: { children: ReactNode }) {
  const [brandProfile, setBrandProfile] = useState<BrandProfile>(DEFAULT_PROFILE);
  const value = useMemo(
    () => ({ brandProfile, setBrandProfile }),
    [brandProfile]
  );
  return (
    <BrandProfileContext.Provider value={value}>
      {children}
    </BrandProfileContext.Provider>
  );
}

export function useBrandProfile(): BrandProfileContextValue {
  const ctx = useContext(BrandProfileContext);
  if (!ctx) {
    throw new Error("useBrandProfile requires BrandProfileProvider");
  }
  return ctx;
}
