"use client";

import Image from "next/image";
import { PLAN_TOOLTIPS } from "@/data/planTooltips";
import { isProLike, isFree, isTrial } from "@/utils/planUtils";
import { useUser } from "@/context/UserContext";

export default function ProBadge({ position = "top-left" }) {
  const { plan } = useUser();

  const tooltip = PLAN_TOOLTIPS[plan];

  // Decide icon
  let icon = "/assets/images/pro-grey.svg";
  if (isProLike(plan)) icon = "/assets/images/pro-white.svg";
  if (isTrial(plan)) icon = "/assets/images/pro-yellow.svg";

  const positionClasses =
    position === "top-left"
      ? "top-3 left-3"
      : position === "top-right"
      ? "top-3 right-3"
      : "";

  return (
    <div className={`absolute ${positionClasses} group z-10`}>
      <Image
        src={icon}
        alt="pro badge"
        width={22}
        height={22}
        className="cursor-pointer"
      />

      {/* Tooltip */}
      <div className="absolute left-0 top-7 w-[260px] bg-[#212121] text-white
                      rounded-md p-3 text-sm opacity-0 scale-95
                      group-hover:opacity-100 group-hover:scale-100
                      transition-all pointer-events-none shadow-lg">
        <p className="font-semibold mb-1">{tooltip.title}</p>
        <p className="text-sm text-smoke-shade-300">{tooltip.body}</p>
      </div>
    </div>
  );
}
