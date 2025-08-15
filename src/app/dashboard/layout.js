// app/onboarding/layout.js   make it ssr by having compoenents using conetxt api
"use client";
import { useEffect } from "react";
import { FormProvider } from "../onboarding/context";
import Image from "next/image";
import { useFormContext } from "../onboarding/context";
import Preview from "@/components/Preview";
import { useRouter, usePathname } from "next/navigation";
import DashboardPreview from "@/components/DashboardPreview";
import StatsCard from "@/components/StatsCard";
import { useDashboardContext } from "./DashboardContext";

export default function OnboardingLayout({ children }) {

  const router = useRouter();
  const pathname = usePathname();
  const { isInstagramLinked } = useDashboardContext() || {};
  
  const handleNextClick = () => {
    router.push("/dashboard");
  }

  const handleProfileClick = () => {
    router.push("/profile");
  }

  const handleSettingClick = () => {
    router.push("/settings");
  }

  // Helper to determine if a route is active
  const isActive = (route) => {
    if (route === "/dashboard") {
      return pathname.startsWith("/dashboard");
    }
    return pathname === route;
  };
  return (
    <FormProvider>
      <div className="flex justify-center  h-[100vh] max-w-[99%] w-[100%] relative bg-[#E9E9E9] ">
        {/* Left side: Image with Preview items-center added above to center the dashboard */}
        <div className="w-[40vw] overflow-hidden relative flex items-center justify-center bg-[#E9E9E9] h-[100vh] ">
        <Image
        src="/assets/images/signup_background.png"
        alt="Background Image"
        layout="fill"
        className="absolute top-0 pt-5 pb-4 left-0 w-full h-screen object-cover rounded-tl-[40px] rounded-bl-[40px]"
        loading="eager"
        priority
      />


          <div className="relative mb-20 z-10 p-1 bg-white 2xl:p-4 py-  bg-opacity-90 rounded-lg shadow-lg grid grid-rows-1">
            <DashboardPreview />
            <StatsCard />
          </div>

        </div>

        <div className="absolute top-[87%] left-[37%]  w-[420px] h-[79px] flex justify-center items-center gap-3  bg-white font-apfel-grotezk-regular rounded-xl shadow-md z-50">
                  <button
              onClick={handleNextClick}
              className="w-[100px] h-[45px] text-2xl font-semibold text-center  text-electric-blue"
            >
                <Image 
                  src="https://res.cloudinary.com/dgk9ok5fx/image/upload/v1746447360/Group_7976_lzrnj5.png"
                  width={40}
                  height={40}
                  alt="snatchlogo"
                  className="mx-auto w-28 h-5"
                />
         </button>
          <button
            onClick={handleProfileClick}
            className={`w-[80px] h-[50px] rounded-md text-center font-medium ${isActive("/profile") ? "bg-electric-blue text-white" : "bg-gray-100 text-electric-blue border-2 border-transparent hover:border-electric-blue hover:bg-white hover:text-electric-blue"}`}
            disabled={isInstagramLinked === false}
            style={isInstagramLinked === false ? { opacity: 0.5, cursor: "not-allowed" } : {}}
          >
            Profile
          </button>

          <button
            onClick={handleNextClick}
            className={`w-[90px] h-[50px] rounded-md text-center font-medium ${isActive("/dashboard") ? "bg-electric-blue text-white" : "bg-gray-100 text-electric-blue border-2 border-transparent hover:border-electric-blue hover:bg-white hover:text-electric-blue "}`}
          >
            Dashboard
          </button>

          <button
            onClick={handleSettingClick}
            className={`w-[80px] h-[50px] rounded-md text-center font-medium ${isActive("/settings") ? "bg-electric-blue text-white" : "bg-gray-100 text-electric-blue border-2 border-transparent hover:border-electric-blue hover:bg-white hover:text-electric-blue"}`}
          >
           Settings
          </button>

        </div>

        {/* Right side: Form */}
        <div className="w-[60vw] max-w-[80%] flex flex-col bg-[#E9E9E9] h-[100vh]">
          <div className=" h-[100vh] w-[60vw] max-w-[98%] ">{children}</div>
        </div>
      </div>
    </FormProvider>
  );
}





