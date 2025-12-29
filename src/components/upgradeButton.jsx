"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

export default function UpgradeFloatingButton() {
  const router = useRouter();
  const pathname = usePathname();

  // ❌ pages where button should NOT appear
  const hiddenRoutes = [
    "/pricing",
    "/onboarding",
    "/media-kit",
    "/loading",
  ];

  const shouldHide = hiddenRoutes.some(route =>
    pathname.includes(route)
  );

  if (shouldHide) return null;

  return (
    <button
      onClick={() => router.push("/pricing")}
      className="
        fixed bottom-6 right-6 z-[1000]
        bg-graphite text-white
        px-4 py-3 rounded-full
        flex items-center gap-2
        transition-all duration-200
        hover:scale-[1.03]
      "
    >
      <Image
        src="/assets/images/pro-yellow.svg"
        alt="Upgrade"
        width={16}
        height={16}
      />
      <span className="font-apfel-grotezk-regular text-sm">
        Upgrade to Pro
      </span>
    </button>
  );
}
