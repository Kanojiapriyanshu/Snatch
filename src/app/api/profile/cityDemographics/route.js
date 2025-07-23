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
    if (!user || !user.instagramAccessToken || !user.instagramAccountId) {
      return NextResponse.json({ error: "Instagram details not found" }, { status: 404 });
    }

    const { instagramAccessToken, instagramAccountId } = user;

    const cityResponse = await fetch(
      `https://graph.facebook.com/v21.0/${instagramAccountId}/insights?` +
      `metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=city&access_token=${instagramAccessToken}`
    );

    const cityResult = await cityResponse.json();
    console.log("Raw cityResult:", JSON.stringify(cityResult, null, 2));

    const breakdowns = cityResult?.data?.[0]?.total_value?.breakdowns;
    if (!Array.isArray(breakdowns)) {
      return NextResponse.json({ error: "Breakdowns data not found" }, { status: 500 });
    }

    let cityBreakdown = {};
    let totalFollowers = 0;

    breakdowns.forEach((entry, index) => {
      const results = entry?.results;
      if (!Array.isArray(results)) {
        console.warn(`Skipping invalid breakdown at index ${index}`);
        return;
      }

      results.forEach((result) => {
        const city = result?.dimension_values?.[0];
        const value = result?.value;

        if (!city || typeof value !== "number") {
          console.warn("Invalid result format:", result);
          return;
        }

        if (!cityBreakdown[city]) cityBreakdown[city] = 0;

        cityBreakdown[city] += value;
        totalFollowers += value;
      });
    });

    const formattedCityData = Object.keys(cityBreakdown).map((city) => ({
      city,
      count: cityBreakdown[city],
      percentage: ((cityBreakdown[city] / totalFollowers) * 100).toFixed(2),
    }));

    return NextResponse.json({
      success: true,
      totalFollowers,
      cityDistribution: formattedCityData,
    });
  } catch (error) {
    console.error("Error fetching city demographics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
