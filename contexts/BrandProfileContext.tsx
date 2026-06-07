"use client";

import {
  getEmptyProfile,
  isProfileComplete,
  loadStoredProfile,
  saveStoredProfile,
} from "@/lib/brand-profile-storage";
import type { BrandProfile } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

interface BrandProfileContextValue {
  brandProfile: BrandProfile;
  setBrandProfile: Dispatch<SetStateAction<BrandProfile>>;
  hasProfile: boolean;
}

const BrandProfileContext = createContext<BrandProfileContextValue | null>(null);

export function BrandProfileProvider({ children }: { children: ReactNode }) {
  const [brandProfile, setBrandProfileState] = useState<BrandProfile>(
    getEmptyProfile()
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStoredProfile();
    if (stored) {
      setBrandProfileState(stored);
    }
    setHydrated(true);
  }, []);

  const setBrandProfile = useCallback<Dispatch<SetStateAction<BrandProfile>>>(
    (value) => {
      setBrandProfileState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        if (isProfileComplete(next)) {
          saveStoredProfile(next);
        }
        return next;
      });
    },
    []
  );

  const hasProfile = isProfileComplete(brandProfile);

  const value = useMemo(
    () => ({
      brandProfile,
      setBrandProfile,
      hasProfile: hydrated ? hasProfile : false,
    }),
    [brandProfile, setBrandProfile, hasProfile, hydrated]
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
