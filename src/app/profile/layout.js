//app/profile/layout.js

//ssr main layout
import DashboardPreview from "@/components/DashboardPreview";
import StatsCard from "@/components/StatsCard";
import { FormProvider } from "../onboarding/context";
import OnboardingToolbar from "@/components/OnboardingToolbar";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";

export default async function OnboardingLayout({ children }) {
  const user = await currentUser();
  const userId = user?.id;

  return (
    <FormProvider>
      <div className="flex h-screen bg-white max-w-[100%] w-[100%] relative">
        {/* Left: Preview w-[42vw]  */}
          <div className="w-[39.7vw] overflow-hidden relative flex items-center justify-center bg-white h-[100vh] left-3">
          <Image
            src="/assets/images/signup_background.png"
            alt="Background Image"
            fill
            className="absolute top-0 pt-5 pb-4 left-0 w-full h-screen object-cover rounded-tl-[40px] rounded-bl-[40px]"
            priority
          />

         
          <div className="relative mb-20 z-10 ">
             <DashboardPreview userId={userId} />
            <StatsCard />
          </div>
        </div>

        {/* Toolbar */}
        <OnboardingToolbar />

        {/* Right: Form */}
       <div className=" w-[60vw] max-w-[80%] flex flex-col flex-grow justify-center items-center bg-white">
          <div className="w-[100vw] 3xl:max-w-3xl max-w-2xl ">{children}</div>
        </div>
      </div>
    </FormProvider>
  );
}
