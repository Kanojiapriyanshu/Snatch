// app/onboarding/Toolbar.js
"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

export default function Toolbar({ isInstagramLinked }) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route) => (route === "/dashboard" ? pathname.startsWith("/dashboard") : pathname === route);

  const handleDashboardClick = () => router.push("/dashboard");
  const handleProfileClick = () => router.push("/profile");
  const handleSettingsClick = () => router.push("/settings");

  return (
    <div className="absolute top-[87%] left-[37%] w-[420px] h-[79px] flex justify-center items-center gap-3 bg-white font-apfel-grotezk-regular rounded-xl shadow-md z-50">
      
      {/* Dashboard Logo */}
      <button
        onClick={handleDashboardClick}
        className="w-[100px] h-[45px] text-2xl font-semibold text-electric-blue flex justify-center items-center"
      >
        <Image
          src="https://res.cloudinary.com/dgk9ok5fx/image/upload/v1746447360/Group_7976_lzrnj5.png"
          width={40}
          height={40}
          alt="snatchlogo"
          className="mx-auto w-28 h-5"
        />
      </button>

      {/* Profile */}
      <button
        onClick={handleProfileClick}
        className={`w-[80px] h-[50px] rounded-md text-center font-medium ${
          isActive("/profile")
            ? "bg-electric-blue text-white"
            : "bg-gray-100 text-electric-blue border-2 border-transparent hover:border-electric-blue hover:bg-white hover:text-electric-blue"
        }`}
        disabled={isInstagramLinked === false}
        style={isInstagramLinked === false ? { opacity: 0.5, cursor: "not-allowed" } : {}}
      >
        Profile
      </button>

      {/* Dashboard */}
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

      {/* Settings */}
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
    </div>
  );
}
