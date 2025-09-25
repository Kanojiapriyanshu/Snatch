// app/dashboard/layout.js   make it ssr by having compoenents using conetxt api

import Image from "next/image";
import DashboardPreview from "@/components/DashboardPreview";
import StatsCard from "@/components/StatsCard";
import { FormProvider } from "../onboarding/context";
import DashboardToolbar from "@/components/DashboardToolbar";
import { currentUser } from "@clerk/nextjs/server";
import connectDb from "@/db/mongoose";
import User from "@/models/user.model";

export default async function OnboardingLayout({ children }) {
   const user = await currentUser();
  const userId = user?.id;

  let isInstagramLinked = false;

  if (userId) {
    await connectDb();
    const dbUser = await User.findOne({ userId });
    isInstagramLinked = !!(dbUser?.instagramAccessToken && dbUser?.instagramAccountId);
  }


  return (
    <FormProvider>

      <div className="flex justify-center gap-3 h-[100vh] max-w-[100%] w-[100%] relative bg-[#E9E9E9] ">
        {/* Left side: Image with Preview items-center added above to center the dashboard */}
        <div className="w-[40vw] overflow-hidden relative flex items-center justify-center bg-[#E9E9E9] h-[100vh] left-3 ">
        <Image
        src="/assets/images/signup_background.png"
        alt="Background Image"
        layout="fill"
        className="absolute top-0 pt-5 pb-4 left-0 w-full h-screen object-cover rounded-tl-[40px] rounded-bl-[40px]"
        loading="eager"
        priority
      />


          <div className="relative z-10">
            <DashboardPreview userId={userId} />
            <StatsCard />
          </div>
        </div>

        {/* Toolbar */}
        <DashboardToolbar isInstagramLinked={isInstagramLinked} />

        {/* Right: Form */}
        <div className="w-[60vw] max-w-[80%] flex flex-col bg-[#E9E9E9] h-[100vh] overflow-hidden">
          <div className="flex-1 min-h-0 max-w-[100%]">{children}</div>
        </div>
      </div>
    </FormProvider>
  );
}
