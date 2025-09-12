// "use client";
// import { useState } from "react";
// import SendRequestPopup from "@/components/SendRequestPopup";
// import { useSearchParams } from "next/navigation";
// import { useRouter } from "next/navigation";

// export default function RequestPopupWrapper() {
//   const [showPopup, setShowPopup] = useState(true);
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const username = searchParams.get("username") || "unknown influencer";

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">

//       {showPopup && (
//         <SendRequestPopup   onClose={() => {
//         router.push(`/${username}/media-kit`);}}  
//         username={username} />
//       )}
//     </div>
//   );
// }


// app/request-popup/page.tsx
import connectDb from "@/db/mongoose";
import OnboardingData from "@/models/onboarding.model";
import SendRequestPopup from "@/components/SendRequestPopup";

// Mark as server component (default in App Router)
export default async function RequestPopupPage({ searchParams }) {
  await connectDb();

  const username = searchParams?.username;
  if (!username) {
    return <div className="p-10">Invalid request: username missing</div>;
  }

  // Fetch user’s onboarding data
  const userData = await OnboardingData.findOne({ username }).lean();

  console.log("Fetched userData:", userData);

  if (!userData) {
    return <div className="p-10">No user found for username: {username}</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* ✅ SendRequestPopup is client, pass server-fetched props */}
      <SendRequestPopup
        username={userData.username}
        profilePicture={userData.profilePicture}
      />
    </div>
  );
}
