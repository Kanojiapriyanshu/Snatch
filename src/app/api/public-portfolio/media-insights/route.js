import { NextResponse } from "next/server";
import User from "@/models/user.model";
import connectDb from "@/db/mongoose";

export const dynamic = "force-dynamic";

// Format utility
function formatCount(num) {
  if (num >= 1_000_000_000) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1_000_000) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(num);
}

export async function GET(req) {
  try {
    await connectDb();

    const url = new URL(req.url);
    const instagramUsername = url.searchParams.get("username");
    const postId = url.searchParams.get("postId");

    if (!instagramUsername || !postId) {
      return NextResponse.json(
        { success: false, error: "Username and Post ID are required." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ instagramUsername });

    if (!user || !user.instagramAccessToken) {
      return NextResponse.json(
        { success: false, error: "User not found or missing Instagram Access Token." },
        { status: 404 }
      );
    }

    const { instagramAccessToken } = user;

    const insightsUrl = `https://graph.facebook.com/v17.0/${postId}/insights?metric=views,likes,comments,shares&access_token=${instagramAccessToken}`;
    const response = await fetch(insightsUrl);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching Instagram insights:", errorData);
      return NextResponse.json(
        { success: false, error: "Failed to fetch media insights.", details: errorData },
        { status: response.status }
      );
    }

    const insightsData = await response.json();

    // Format the values
    const formattedData = insightsData.data.map(item => {
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

    return NextResponse.json({ success: true, insights: { data: formattedData } }, { status: 200 });

  } catch (error) {
    console.error("Error fetching media insights:", error);
    return NextResponse.json(
      { success: false, error: "Server Error", details: error.message },
      { status: 500 }
    );
  }
}
