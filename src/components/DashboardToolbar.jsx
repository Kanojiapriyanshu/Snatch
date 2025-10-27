"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import * as gtag from "@/lib/gtag";

export default function DashboardToolbar({ isInstagramLinked }) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route) =>
    route === "/dashboard" ? pathname.startsWith("/dashboard") : pathname === route;

  const handleDashboardClick = () => {
  gtag.event({
    action: "dashboard_click",
    category: "navigation",
    label: "Dashboard Button",
  });
  router.push("/dashboard");
};

const handleProfileClick = () => {
  gtag.event({
    action: "profile_click",
    category: "navigation",
    label: "Profile Button",
  });
  router.push("/profile");
};

const handleSettingsClick = () => {
  gtag.event({
    action: "settings_click",
    category: "navigation",
    label: "Settings Button",
  });
  router.push("/settings");
};


  return (
    <div   className={`absolute top-[87%] h-[79px] flex justify-center items-center gap-3 bg-white font-apfel-grotezk-regular rounded-xl shadow-md z-50 ${
    isInstagramLinked ? "w-[430px] left-[37%] " : "w-[270px] left-[42%] "
  }`}>
      {/* Always show Snatch Logo */}
      <button
        onClick={handleDashboardClick}
        className="w-[100px] h-[45px] text-2xl font-semibold text-electric-blue flex justify-center items-center"
      >
        <Image
          src="/assets/images/snatch.svg"
          width={40}
          height={40}
          alt="snatchlogo"
          className="mx-auto w-28 h-5"
        />
      </button>

       <button
        onClick={handleDashboardClick}
        className={`w-[90px] h-[50px] rounded-md text-center font-medium ${
          isActive("/dashboard")
            ? "bg-electric-blue text-white"
            : "bg-gray-100 text-electric-blue border-2 border-transparent hover:border-electric-blue hover:bg-white hover:text-electric-blue"
        }`}
      >
        Dashboard
      </button>

      {/* Show Profile + Settings only if Instagram connected */}
      {isInstagramLinked && (
        <>
          <button
            onClick={handleProfileClick}
            className={`w-[80px] h-[50px] rounded-md text-center font-medium ${
              isActive("/profile")
                ? "bg-electric-blue text-white"
                : "bg-gray-100 text-electric-blue border-2 border-transparent hover:border-electric-blue hover:bg-white hover:text-electric-blue"
            }`}
          >
            Profile
          </button>

          <button
            onClick={handleSettingsClick}
            className={`w-[80px] h-[50px] rounded-md text-center font-medium ${
              isActive("/settings")
                ? "bg-electric-blue text-white"
                : "bg-gray-100 text-electric-blue border-2 border-transparent hover:border-electric-blue hover:bg-white hover:text-electric-blue"
            }`}
          >
            Settings
          </button>
        </>
      )}
    </div>
  );
}
