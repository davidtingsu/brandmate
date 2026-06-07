"use client";

import { ProfileBootstrap } from "@/components/providers/ProfileBootstrap";
import { BrandProfileProvider } from "@/contexts/BrandProfileContext";
import { ChatSessionProvider } from "@/contexts/ChatSessionContext";
import type { ReactNode } from "react";

export function BrandMateProviders({ children }: { children: ReactNode }) {
  return (
    <ChatSessionProvider>
      <BrandProfileProvider>
        <ProfileBootstrap />
        {children}
      </BrandProfileProvider>
    </ChatSessionProvider>
  );
}
