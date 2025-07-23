// import { NextResponse } from "next/server";
// import connectDb from "@/db/mongoose";
// import User from "@/models/user.model";
// import { getAuth } from "@clerk/nextjs/server";

// export const dynamic = "force-dynamic";

// export async function GET(req) {
//     try {
//       await connectDb(); // Ensure database connection
  
//      const {userId} = getAuth(req)
  
//       if (!userId) {
//         return NextResponse.json({ error: "User ID is required" }, { status: 400 });
//       }
  
//       // Fetch user details from the database
//       const user = await User.findOne({ userId });
  
//       if (!user || !user.instagramAccessToken || !user.instagramAccountId) {
//         return NextResponse.json({ error: "Instagram details not found" }, { status: 404 });
//       }
  
//       const { instagramAccessToken, instagramAccountId } = user;
  
//       // Fetch Country Data from Facebook Graph API
//       const countryResponse = await fetch(
//         `https://graph.facebook.com/v21.0/${instagramAccountId}/insights?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=country&access_token=${instagramAccessToken}`
//       );
  
//       const countryResult = await countryResponse.json();
  
//       if (!countryResult?.data?.[0]?.total_value?.breakdowns?.[0]?.results) {
//         return NextResponse.json({ error: "Invalid API response" }, { status: 500 });
//       }
  
//       const insights = countryResult.data[0].total_value.breakdowns[0].results;
  
//       let countryBreakdown = {};
//       let totalFollowers = 0;
  
//       insights.forEach(({ dimension_values, value }) => {
//         const country = dimension_values[0];
  
//         if (!countryBreakdown[country]) {
//           countryBreakdown[country] = 0;
//         }
  
//         countryBreakdown[country] += value;
//         totalFollowers += value;
//       });
  
//       // Convert country breakdown to percentage
//       const formattedCountryData = Object.keys(countryBreakdown).map((country) => ({
//         country,
//         count: countryBreakdown[country],
//         percentage: ((countryBreakdown[country] / totalFollowers) * 100).toFixed(2),
//       }));
  
//       return NextResponse.json({
//         success: true,
//         totalFollowers,
//         countryDistribution: formattedCountryData,
//       });
  
//     } catch (error) {
//       console.error("Error fetching country demographics:", error);
//       return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//     }
//   }


import { NextResponse } from "next/server";
import connectDb from "@/db/mongoose";
import User from "@/models/user.model";
import { getAuth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    console.log("[Country Demographics API] Connecting to DB...");
    await connectDb();

    const { userId } = getAuth(req);
    console.log("[Country Demographics API] Fetched userId:", userId);

    if (!userId) {
      console.error("[Country Demographics API] Missing userId from auth");
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      console.error("[Country Demographics API] User not found in DB");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { instagramAccessToken, instagramAccountId } = user;

    if (!instagramAccessToken || !instagramAccountId) {
      console.error("[Country Demographics API] Missing Instagram access token or account ID");
      return NextResponse.json({ error: "Instagram details not found" }, { status: 404 });
    }

    console.log("[Country Demographics API] Fetching insights from Instagram API...");

    const url = `https://graph.facebook.com/v21.0/${instagramAccountId}/insights?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=country&access_token=${instagramAccessToken}`;

    const response = await fetch(url);
    const result = await response.json();

    console.log("[Country Demographics API] Raw response:", JSON.stringify(result, null, 2));

    if (!result?.data || !Array.isArray(result.data)) {
      console.error("[Country Demographics API] Invalid or empty 'data' in response");
      return NextResponse.json({ error: "Invalid response from Instagram API" }, { status: 500 });
    }

    const breakdowns = result?.data?.[0]?.total_value?.breakdowns;
    console.log("counrtyDemographics breakdowns:", breakdowns);

    if (!Array.isArray(breakdowns)) {
      console.error("[Country Demographics API] Missing or invalid 'breakdowns'");
      return NextResponse.json({ error: "No country breakdowns found" }, { status: 500 });
    }

    console.log(`[Country Demographics API] Found ${breakdowns.length} country breakdown blocks`);

    const countryData = {};
    let totalFollowers = 0;

    breakdowns.forEach((entry, i) => {
      const results = entry?.results;
      if (!Array.isArray(results)) {
        console.warn(`[Country Demographics API] Skipping invalid breakdown at index ${i}`);
        return;
      }

      results.forEach((result, j) => {
        const country = result?.dimension_values?.[0];
        const value = result?.value;

        if (!country || typeof value !== "number") {
          console.warn(`[Country Demographics API] Invalid data at breakdown[${i}].results[${j}]`);
          return;
        }

        if (!countryData[country]) {
          countryData[country] = 0;
        }

        countryData[country] += value;
        totalFollowers += value;
      });
    });

    if (totalFollowers === 0) {
      console.warn("[Country Demographics API] Total followers calculated as 0");
    }

    const formattedCountryData = Object.entries(countryData).map(([country, count]) => ({
      country,
      count,
      percentage: ((count / totalFollowers) * 100).toFixed(2),
    }));

    console.log("[Country Demographics API] Final formatted data:", formattedCountryData);

    return NextResponse.json({
      success: true,
      totalFollowers,
      countryDistribution: formattedCountryData,
    });
  } catch (error) {
    console.error("[Country Demographics API] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
