// app/dashboard/layout.js
import Image from "next/image";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import DashboardPreview from "@/components/DashboardPreview";
import StatsCard from "@/components/StatsCard";
import DashboardToolbar from "@/components/DashboardToolbar";

import { FormProvider } from "../onboarding/context";
import { UserProvider } from "@/context/UserContext";

import connectDb from "@/db/mongoose";
import User from "@/models/user.model";

export default async function DashboardLayout({ children }) {
  // 🔐 AUTH GUARD
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId) {
    redirect("/");
  }

  const hasCompletedOnboarding =
    user?.publicMetadata?.hasCompletedOnboarding;

  if (!hasCompletedOnboarding) {
    redirect("/onboarding/step-1");
  }

  // 🔎 DB FETCH
  let isInstagramLinked = false;
  let plan = "free";

  await connectDb();
  const dbUser = await User.findOne({ userId });

  if (dbUser) {
    isInstagramLinked = !!(dbUser?.instagramAccessToken && dbUser?.instagramAccountId);
    plan = dbUser?.subscription?.plan || 'free';
  }

  return (
    <FormProvider>
      <UserProvider plan={plan}>
        <div className="flex justify-center gap-3 h-[100vh] max-w-[100%] w-[100%] relative bg-[#E9E9E9] overflow-hidden">
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
          <div className="w-[60vw] max-w-[80%] flex flex-col bg-[#E9E9E9] h-[100vh] overflow-visisble">
            <div className="flex-1 min-h-0 max-w-[100%]">{children}</div>
          </div>
        </div>
      </UserProvider>
      </FormProvider>
  );
}
