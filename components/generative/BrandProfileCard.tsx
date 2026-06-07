"use client";

import { formatHandle } from "@/lib/branding";
import type { BrandProfile } from "@/lib/types";

interface BrandProfileCardProps {
  profile: BrandProfile;
}

export function BrandProfileCard({ profile }: BrandProfileCardProps) {
  const handle = formatHandle(profile.handle);

  return (
    <div className="my-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        {profile.profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.profileImageUrl}
            alt={profile.name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : null}
        <div>
          <h3 className="text-sm font-semibold text-indigo-900">
            {profile.name}
          </h3>
          {handle && <p className="text-xs text-indigo-700">{handle}</p>}
        </div>
      </div>
      <dl className="grid gap-1 text-sm text-indigo-800">
        <div>
          <dt className="inline font-medium">Niche: </dt>
          <dd className="inline">{profile.niche}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Audience: </dt>
          <dd className="inline">{profile.audience}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Voice: </dt>
          <dd className="inline">{profile.voice}</dd>
        </div>
        {profile.goals && (
          <div>
            <dt className="inline font-medium">Goals: </dt>
            <dd className="inline">{profile.goals}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
