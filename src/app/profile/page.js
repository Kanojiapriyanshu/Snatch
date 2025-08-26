// app/profile/page.js
import { redirect } from "next/navigation";
import connectDb from "@/db/mongoose";
import User from "@/models/user.model";
import OnboardingData from "@/models/onboarding.model"; // adjust path if needed
import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardRedirect() {
  await connectDb();

  // ✅ get the authenticated user
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/sign-in"); // or some fallback route
  }

  const userId = clerkUser.id;

  // ✅ try to fetch onboarding data directly
  const onboarding = await OnboardingData.findOne({ userId });

  if (onboarding?.username) {
    // Redirect to profile page if username exists
    redirect(`/profile/${onboarding.username}`);
  }

  // Optional: fallback UI if no username found
  return (
    <div className="h-screen bg-white text-graphite font-apfel-grotezk-regular flex justify-center items-center">
      <p>No username found. Please finish onboarding.</p>
    </div>
  );
}
