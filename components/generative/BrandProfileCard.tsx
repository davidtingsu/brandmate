"use client";

import type { BrandProfile } from "@/lib/types";

interface BrandProfileCardProps {
  profile: BrandProfile;
}

export function BrandProfileCard({ profile }: BrandProfileCardProps) {
  return (
    <div className="my-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-indigo-900">Brand profile</h3>
      <dl className="grid gap-1 text-sm text-indigo-800">
        <div>
          <dt className="inline font-medium">Name: </dt>
          <dd className="inline">{profile.name}</dd>
        </div>
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
