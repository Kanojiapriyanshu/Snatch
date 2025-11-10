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
      console.warn("Missing userId from request.");
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await User.findOne({ userId });
    

    if (!user || !user.instagramAccessToken || !user.instagramAccountId) {
      console.warn("Instagram details not found for user:", userId);
      return NextResponse.json({ error: "Instagram details not found" }, { status: 404 });
    }

    const { instagramAccessToken, instagramAccountId } = user;

    const demographicsResponse = await fetch(
      `https://graph.facebook.com/v21.0/${instagramAccountId}/insights?` +
      `metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=age&access_token=${instagramAccessToken}`
    );

    const demographicsResult = await demographicsResponse.json();

    console.log("Raw Meta demographics response:", JSON.stringify(demographicsResult, null, 2));

    if (demographicsResult.error) {
      console.error("Meta API error:", demographicsResult.error);
      return NextResponse.json({ error: demographicsResult.error.message || "Meta API error" }, { status: 502 });
    }

    const breakdowns = demographicsResult?.data?.[0]?.total_value?.breakdowns;

    if (!Array.isArray(breakdowns) || breakdowns.length === 0) {
      console.warn("Breakdowns data is empty or missing for user:", userId);
      return NextResponse.json({
        success: true,
        message: "No demographic data available for this account.",
        totalFollowers: 0,
        ageDistribution: [],
      });
    }

    const ageGroups = {};
    let totalFollowers = 0;

    breakdowns.forEach((entry, index) => {
      const results = entry?.results;
      if (!Array.isArray(results)) {
        console.warn(`Skipping invalid breakdown at index ${index}`);
        return;
      }

      results.forEach((result) => {
        const age = result?.dimension_values?.[0];
        const value = result?.value;

        if (!age || typeof value !== "number") {
          console.warn("Invalid age or value in result:", result);
          return;
        }

        if (!ageGroups[age]) ageGroups[age] = 0;

        ageGroups[age] += value;
        totalFollowers += value;
      });
    });

    const formattedAgeData = Object.entries(ageGroups).map(([age, count]) => ({
      age,
      count,
      percentage: ((count / totalFollowers) * 100).toFixed(2),
    }));

    return NextResponse.json({
      success: true,
      totalFollowers,
      ageDistribution: formattedAgeData,
    });

  } catch (error) {
    console.error("Unhandled error fetching Instagram demographics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
