"use client"
import React from 'react'
import useFontSize from "@/hooks/useFontSize";
import Image from "next/image";
import Tooltip from "@/components/ui/Tooltip";
import { PLAN_TOOLTIPS } from "@/data/planTooltips";

const DashboardCard = ({count,label, plan}) => {
const countSize = useFontSize(28, 58, 1100, 1920); // count scales from 28px → 56px
const labelSize = useFontSize(22, 28, 1100, 1920); // label scales from 16px → 24px

  const isFreePlan = plan === "free";
  const tooltip =
  PLAN_TOOLTIPS.dashboard_analytics[plan] ??
  PLAN_TOOLTIPS.dashboard_analytics.free;
  const hideProIcon = label === "Request received";  

  return (
  <div>
      {!isFreePlan && ( <div className="relative w-full h-full py-6 rounded-md bg-white font-qimano flex-auto overflow-visible">
            {!hideProIcon && (
            <div className="absolute top-3 left-3">
              <Tooltip title={tooltip.title} body={tooltip.body} placement="bottom">
                <Image
                  src="/assets/images/pro-grey.svg"
                  alt="pro"
                  width={22}
                  height={22}
                  className="cursor-pointer"
                />
              </Tooltip>
            </div>
          )}
            {/* Normal Card */}
            <div
              className={`w-full h-full rounded-md ${
                isFreePlan ? "opacity-0" : "opacity-100"
              }`}
            >
              <h5
                style={{ fontSize: countSize }}
                className="absolute top-2 right-4 font-medium"
              >
                {count}
              </h5>

              <h3
                style={{ fontSize: labelSize }}
                className="absolute top-[68%] left-2"
              >
                {label}
              </h3>
            </div>


          </div>)}
     

      {/* Free Plan Overlay */}
      {isFreePlan && (
        <div className="relative w-full h-full inset-0 bg-white rounded-md flex flex-col justify-end p-4 font-qimano flex-auto overflow-visible">
            {!hideProIcon && (
            <div className="absolute top-3 right-3">
              <Tooltip title={tooltip.title} body={tooltip.body} placement="bottom">
                <Image
                  src="/assets/images/pro-grey.svg"
                  alt="pro"
                  width={22}
                  height={22}
                  className="cursor-pointer"
                />
              </Tooltip>
            </div>
          )}

          <h3
            style={{ fontSize: labelSize }}
            className="text-[#878787] -mb-2"
          >
            {label}
          </h3>
        </div>
      )}

  </div>
  )
}

export default DashboardCard
