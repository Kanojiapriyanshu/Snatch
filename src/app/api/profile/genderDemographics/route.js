import { NextResponse } from "next/server";
import connectDb from "@/db/mongoose";
import User from "@/models/user.model";
import { getAuth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDb();
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await User.findOne({ userId });
    if (!user?.instagramAccessToken || !user?.instagramAccountId) {
      return NextResponse.json({ error: "Instagram details not found" }, { status: 404 });
    }

    const url = `https://graph.facebook.com/v18.0/${user.instagramAccountId}/insights?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=gender&access_token=${user.instagramAccessToken}`;
    const response = await fetch(url);
    const data = await response.json();

    const breakdown = data?.data?.[0]?.total_value?.breakdowns?.[0];
    const results = breakdown?.results;

    console.log("Breakdown RESULTS GENDER DEOMOGRAPH:", results); 

    if (!results || !Array.isArray(results)) {
      console.warn("⚠️ No gender results found. Raw breakdown:", breakdown);
      return NextResponse.json({
        demographics: { male: 0, female: 0, unknown: 0 },
        message: "No gender data available for this account.",
      }, { status: 200 });
    }

    // Process breakdown data
    let demographics = { male: 0, female: 0, unknown: 0 };
    let totalFollowers = 0;

    results.forEach(({ dimension_values, value }) => {
      const gender = dimension_values?.[0];
      if (gender === "M") demographics.male = value;
      else if (gender === "F") demographics.female = value;
      else demographics.unknown = value;
      totalFollowers += value;
    });

    const percentages = {
      male: totalFollowers ? ((demographics.male / totalFollowers) * 100).toFixed(2) : 0,
      female: totalFollowers ? ((demographics.female / totalFollowers) * 100).toFixed(2) : 0,
      unknown: totalFollowers ? ((demographics.unknown / totalFollowers) * 100).toFixed(2) : 0,
    };

    return NextResponse.json({ demographics: percentages }, { status: 200 });

  } catch (error) {
    console.error("Gender API error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

