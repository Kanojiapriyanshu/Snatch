// src/app/page.js
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SignUp from "./(auth)/signup/SignupClient";
export default async function HomePage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (userId) {
    const hasCompletedOnboarding =
      user?.publicMetadata?.hasCompletedOnboarding;
    const username =
      user?.publicMetadata?.username;

    redirect(
      hasCompletedOnboarding && username
        ? `/dashboard/${username}`
        : "/onboarding/step-1"
    );
  }

  // 👇 Not signed in → show signup UI
  return <SignUp />;
}

