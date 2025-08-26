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
      <div className="flex h-screen bg-white">
        {/* Left: Preview */}
        <div className="w-[900px] 3xl:w-[45vw] overflow-hidden relative flex items-center justify-center bg-white h-[100vh]">
          <Image
            src="/assets/images/signup_background.png"
            alt="Background Image"
            fill
            className="absolute p-6 rounded-md top-0 left-0 w-full h-full object-left-bottom"
            priority
          />
          <div className="relative mb-20 z-10 p-4 bg-white bg-opacity-90 rounded-lg shadow-lg">
            <DashboardPreview userId={userId} />
            <StatsCard />
          </div>
        </div>

        {/* Toolbar */}
        <OnboardingToolbar />

        {/* Right: Form */}
        <div className="w-[900px] flex flex-col flex-grow justify-center items-center bg-white">
          <div className="w-[100vw] 3xl:max-w-3xl max-w-2xl">{children}</div>
        </div>
      </div>
    </FormProvider>
  );
}
