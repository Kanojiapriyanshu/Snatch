// app/onboarding/layout.js   make it ssr by having compoenents using conetxt api

import Image from "next/image";
import DashboardPreview from "@/components/DashboardPreview";
import StatsCard from "@/components/StatsCard";
import { FormProvider } from "../onboarding/context";
import DashboardToolbar from "@/components/DashboardToolbar";
import { currentUser } from "@clerk/nextjs/server";
import connectDb from "@/db/mongoose";
import OnboardingData from "@/models/onboarding.model";

export default async function OnboardingLayout({ children }) {
   const user = await currentUser();
  const userId = user?.id;

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

          <div className="relative mb-20 z-10 p-1 bg-white 2xl:p-4 py- bg-opacity-90 rounded-lg shadow-lg grid grid-rows-1">
            <DashboardPreview userId={userId} />
            <StatsCard />
          </div>
        </div>

        {/* Toolbar */}
        <DashboardToolbar isInstagramLinked={true} />

        {/* Right: Form */}
        <div className="w-[60vw] max-w-[80%] flex flex-col bg-[#E9E9E9] h-[100vh]">
          <div className="h-[100vh] w-[60vw] max-w-[98%]">{children}</div>
        </div>
      </div>
    </FormProvider>
  );
}
