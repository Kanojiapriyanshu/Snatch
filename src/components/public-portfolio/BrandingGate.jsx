// src/components/media-kit/BrandingGate.tsx
"use client";

import { usePathname } from "next/navigation";

export default function BrandingGate({ children }) {
  const pathname = usePathname();

  // Hide banner on loading & post pages
  if (
    pathname.includes("/loading") ||
    pathname.includes("/post")
  ) {
    return null;
  }

  return <>{children}</>;
}
