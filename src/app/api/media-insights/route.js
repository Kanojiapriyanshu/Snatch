import { NextResponse } from "next/server";
import User from "@/models/user.model";
import { getAuth } from "@clerk/nextjs/server";
import connectDb from "@/db/mongoose";

export const dynamic = "force-dynamic";

// Format helper
function formatCount(num) {
  if (num >= 1_000_000_000) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1_000_000) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(num);
}

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    const { mediaId } = await req.json();

    if (!userId || !mediaId) {
      return NextResponse.json(
        { error: "User ID or Media ID is missing" },
        { status: 400 }
      );
    }

    await connectDb();

    const user = await User.findOne({ userId });

    if (!user || !user.instagramAccessToken) {
      return NextResponse.json(
        { error: "User access token not found in the database." },
        { status: 404 }
      );
    }

    const { instagramAccessToken } = user;

    const insightsUrl = `https://graph.facebook.com/v17.0/${mediaId}/insights?metric=views,likes,comments,shares&access_token=${instagramAccessToken}`;
    const response = await fetch(insightsUrl);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: "Failed to fetch media insights.", details: errorData },
        { status: response.status }
      );
    }

    const insightsData = await response.json();

    // Replace raw value with formatted string
    const formattedInsights = insightsData.data.map((item) => {
      const rawValue = item.values?.[0]?.value ?? 0;

      return {
        ...item,
        values: [
          {
            ...item.values[0],
            value: formatCount(rawValue)
          }
        ]
      };
    });

    return NextResponse.json({ data: formattedInsights }, { status: 200 });
  } catch (error) {
    console.error("Error in fetching media insights:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
