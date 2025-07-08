"use client";
import React from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation"; 
import SvgComponent from "@/components/svg/Instagramsvg";
import Writesvg from "@/components/svg/Writesvg";
import Viewsvg from "@/components/svg/Viewsvg";
import { useSelectedProjects } from "@/app/manage-projects/context"; // adjust path if needed

const steps = [
  {
    id: "/manage-projects/pick-projects",
    label: "Pick Projects",
    icon: <SvgComponent />,
  },
  {
    id: "/manage-projects/add-details",
    label: "Add Details",
    icon: <Writesvg />,
  },
  {
    id: "/manage-projects/preview",
    label: "Preview",
    icon: <Viewsvg />,
  },
];

const Header = () => {
 const pathname = usePathname();
 const router = useRouter();
 const { selectionState } = useSelectedProjects();

   // Calculate if Add Details should be enabled
  const totalSelected =
    (selectionState?.instagramSelected?.length || 0) +
    (selectionState?.uploadedFiles?.length || 0);
  const canGoToAddDetails = totalSelected >= 4;

  return (
    <div className="sticky top-0 bg-electric-blue p-4 text-white shadow-lg">
      <div className="flex items-center justify-around">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step Marker */}
            <button
              type="button"
              onClick={() => {
                // Only allow navigation to Add Details if allowed
                if (
                  step.id !== "/manage-projects/add-details" ||
                  canGoToAddDetails
                ) {
                  router.push(step.id);
                }
              }}
              className={`focus:outline-none ${
                step.id === "/manage-projects/add-details" && !canGoToAddDetails
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={
                step.id === "/manage-projects/add-details" && !canGoToAddDetails
              }
            >
              <div className="flex flex-col items-center px-10">
                {/* SVG Icon */}
                <div
                  className={`w-5 h-5 transition-all duration-300 mr-2 ${
                    pathname === step.id ? "text-lime-yellow" : "text-white"
                  }`}
                >
                  {step.icon}
                </div>
                {/* Step Label */}
                <span
                  className={`mt-2 transition-all duration-300 font-apfel-grotezk-regular ${
                    pathname === step.id
                      ? "text-lime-yellow "
                      : "text-gray-300"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </button>
            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-[0.95px] mx-2 transition-all duration-300 ${
                  pathname === step.id || pathname === steps[index + 1].id
                    ? "bg-[#CBCBCB] opacity-75"
                    : "bg-gray-400"
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Header;

