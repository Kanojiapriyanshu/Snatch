// app/request-popup/page.js
import connectDb from "@/db/mongoose";
import OnboardingData from "@/models/onboarding.model";
import SendRequestPopup from "@/components/SendRequestPopup";

// ✅ This is a server component
export default async function RequestPopupPage({ searchParams }) {
  await connectDb();

  const username = searchParams?.username;
  if (!username) {
    return <div className="p-10">Invalid request: username missing</div>;
  }

  // Fetch user’s onboarding data
  const userData = await OnboardingData.findOne({ username }).lean();

  if (!userData) {
    return <div className="p-10">No user found for username: {username}</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SendRequestPopup
        username={userData.username}
        profilePicture={userData.profilePicture}
      />
    </div>
  );
}
