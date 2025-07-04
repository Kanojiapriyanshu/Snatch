import { NextResponse } from "next/server";
import User from "@/models/user.model";
import { getAuth } from "@clerk/nextjs/server";
import connectDb from "@/db/mongoose";

export const dynamic = "force-dynamic";

// Format helper function
function formatCount(num) {
  if (num >= 1_000_000_000) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1_000_000) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(num);
}

export async function GET(req) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: User ID is missing" },
        { status: 401 }
      );
    }

    await connectDb();

    const user = await User.findOne({ userId });

    if (!user || !user.instagramAccessToken || !user.instagramAccountId) {
      return NextResponse.json(
        { error: "User or Instagram credentials not found" },
        { status: 404 }
      );
    }

    const { instagramAccessToken, instagramAccountId } = user;

    const url = `https://graph.facebook.com/v19.0/${instagramAccountId}?fields=followers_count,media_count,insights.metric(reach).period(days_28)&access_token=${instagramAccessToken}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: "Failed to fetch Instagram data", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    const followers = data.followers_count || 0;
    const media = data.media_count || 0;
    const reach =
      data?.insights?.data?.find((item) => item.name === "reach")?.values?.[0]?.value || 0;

    return NextResponse.json(
      {
        followers_count: formatCount(followers),
        media_count: formatCount(media),
        reach: formatCount(reach),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching Instagram data:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching data" },
      { status: 500 }
    );
  }
}
