"use client";

import { BrandHeader } from "@/components/BrandHeader";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { useBrandProfile } from "@/contexts/BrandProfileContext";
import {
  saveStoredProfile,
  setOnboardedCookie,
} from "@/lib/brand-profile-storage";
import type { BrandProfile } from "@/lib/types";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export function OnboardPage() {
  const { brandProfile, setBrandProfile } = useBrandProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("edit") === "1";
  const returnTo = searchParams.get("return") ?? "/";

  const handleSubmit = async (profile: BrandProfile) => {
    setBrandProfile(profile);
    saveStoredProfile(profile);
    setOnboardedCookie();

    if (isEdit) {
      router.replace(returnTo.startsWith("/") ? returnTo : "/");
      return;
    }

    router.replace(returnTo.startsWith("/") ? returnTo : "/");
  };

  return (
    <main
      data-testid="onboard-page"
      className="flex min-h-screen flex-col"
    >
      <BrandHeader />
      <div className="brandmate-layout mx-auto w-full max-w-2xl flex-1 p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              {isEdit ? "Update your profile" : "Welcome to BrandMate"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {isEdit
                ? "Update your brand details before creating more posts."
                : "Set up your profile first, then head to the studio to create LinkedIn posts."}
            </p>
          </div>

          <ProfileForm initial={brandProfile} onSubmit={handleSubmit} />

          {isEdit && (
            <p className="text-center text-sm">
              <Link
                href="/"
                className="font-medium text-linkedin hover:text-blue-700"
              >
                Back to gallery
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
