// src/components/DashboardPreview.jsx
import connectDb from "@/db/mongoose";
import OnboardingData from "@/models/onboarding.model";
import User from "@/models/user.model";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic"; // always fetch fresh SSR data

export default async function DashboardPreview({ userId }) {
  await connectDb();

  if (!userId) return <div>User not found</div>;

  const user = await User.findOne({ userId }).lean(); // use lean for plain JS
  const onboardingDoc = await OnboardingData.findOne({ userId }).lean();

  if (!onboardingDoc) return <div>No onboarding data yet</div>;

  // make sure it's plain JSON
  const onboarding = JSON.parse(JSON.stringify(onboardingDoc));

  const story = Number(onboarding.story) || 0;
  const reels = Number(onboarding.reels) || 0;
  const post = Number(onboarding.post) || 0;

  const values = [story, reels, post].filter((v) => v > 0);
  const lowest = values.length ? Math.min(...values) : 0;
  const highest = values.length ? Math.max(...values) : 0;

  const formatNumber = (value) => {
    const num = Number(value);
    if (isNaN(num)) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  const priceRange =
    lowest === highest
      ? `₹ ${formatNumber(lowest)}`
      : `₹ ${formatNumber(lowest)} - ₹ ${formatNumber(highest)}`;

  return (
    <DashboardClient onboarding={onboarding} priceRange={priceRange} />
  );
}

