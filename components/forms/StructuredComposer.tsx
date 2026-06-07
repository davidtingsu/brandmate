"use client";

import type { BrandProfile } from "@/lib/types";
import { GeneratePostForm, type GeneratePostValues } from "./GeneratePostForm";
import { ProfileForm } from "./ProfileForm";

interface StructuredComposerProps {
  brandProfile: BrandProfile;
  hasProfile: boolean;
  generating?: boolean;
  showProfileForm?: boolean;
  onCreateProfile: (profile: BrandProfile) => Promise<void>;
  onGenerate: (values: GeneratePostValues) => Promise<void>;
}

export function StructuredComposer({
  brandProfile,
  hasProfile,
  generating = false,
  showProfileForm = true,
  onCreateProfile,
  onGenerate,
}: StructuredComposerProps) {
  return (
    <div className="space-y-4 border-t border-slate-200 bg-slate-50/80 p-4">
      {showProfileForm && !hasProfile && (
        <ProfileForm compact onSubmit={onCreateProfile} initial={brandProfile} />
      )}
      <GeneratePostForm
        hasProfile={hasProfile}
        hasHandle={Boolean(brandProfile.handle?.trim())}
        hasProfileImage={Boolean(brandProfile.profileImageUrl)}
        loading={generating}
        onSubmit={onGenerate}
      />
    </div>
  );
}
