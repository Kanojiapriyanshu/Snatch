// import { NextResponse } from "next/server";
// import connectDb from "@/db/mongoose";
// import User from "@/models/user.model";
// import { getAuth } from "@clerk/nextjs/server";

// export const dynamic = "force-dynamic";

// export async function GET(req) {
//   try {
//     await connectDb(); 

//     const { userId } = getAuth(req);
//     if (!userId) {
//       return NextResponse.json({ error: "User ID is required" }, { status: 400 });
//     }

//     // Fetch user from the database
//     const user = await User.findOne({ userId });

//     if (!user || !user.instagramAccessToken || !user.instagramAccountId) {
//       return NextResponse.json({ error: "Instagram details not found" }, { status: 404 });
//     }

//     const { instagramAccessToken, instagramAccountId } = user;

//     // Corrected API URL
//     const url = `https://graph.facebook.com/v18.0/${instagramAccountId}/insights?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=gender&access_token=${instagramAccessToken}`;

//     const response = await fetch(url);
//     if (!response.ok) throw new Error("Failed to fetch data");

//     const data = await response.json();

//     // Ensure response has valid structure
//     const results = data?.data?.[0]?.total_value?.breakdowns?.[0]?.results;
//     console.log("Raw demographics data: genderDemographics", JSON.stringify(data, null, 2));
//     if (!results) {
//       return NextResponse.json({ error: "Invalid API response" }, { status: 500 });
//     }

//     // Extract gender-based values
//     let demographics = { male: 0, female: 0, unknown: 0 };
//     let totalFollowers = 0;

//     results.forEach(({ dimension_values, value }) => {
//       const gender = dimension_values[0]; // "M", "F", or "U"
//       if (gender === "M") demographics.male = value;
//       else if (gender === "F") demographics.female = value;
//       else demographics.unknown = value;
//       totalFollowers += value;
//     });

//     // Convert to percentages
//     const percentages = {
//       male: totalFollowers ? ((demographics.male / totalFollowers) * 100).toFixed(2) : 0,
//       female: totalFollowers ? ((demographics.female / totalFollowers) * 100).toFixed(2) : 0,
//       unknown: totalFollowers ? ((demographics.unknown / totalFollowers) * 100).toFixed(2) : 0,
//     };

//     return NextResponse.json({ demographics: percentages }, { status: 200 });

//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }


import { NextResponse } from "next/server";
import connectDb from "@/db/mongoose";
import User from "@/models/user.model";
import { getAuth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

// export async function GET(req) {
//   try {
//     console.log("📡 API Call: /api/get-gender-demographics started");

//     // 1. Connect to MongoDB
//     await connectDb();

//     // 2. Get current user
//     const { userId } = getAuth(req);
//     if (!userId) {
//       console.error("❌ Missing userId from Clerk session");
//       return NextResponse.json({ error: "User ID is required" }, { status: 400 });
//     }

//     const user = await User.findOne({ userId });
//     if (!user || !user.instagramAccessToken || !user.instagramAccountId) {
//       console.error("❌ Missing Instagram data for user");
//       return NextResponse.json({ error: "Instagram details not found" }, { status: 404 });
//     }

//     const { instagramAccessToken, instagramAccountId } = user;

//     // 3. Build API URL
//     const url = `https://graph.facebook.com/v18.0/${instagramAccountId}/insights?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=gender&access_token=${instagramAccessToken}`;

//     console.log("🔗 Fetching Instagram gender data from:", url);

//     // 4. Fetch from Instagram Graph API
//     const response = await fetch(url);
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("❌ Failed to fetch data from Instagram:", errorText);
//       throw new Error("Instagram API request failed");
//     }

//     const data = await response.json();
//     console.log("✅ Raw response from Instagram API:", JSON.stringify(data, null, 2));

//     // 5. Parse and Validate Data
//     const results = data?.data?.[0]?.total_value?.breakdowns?.[0]?.results;
//     if (!Array.isArray(results)) {
//       console.error("❌ Invalid API response structure: 'results' missing or not an array");
//       return NextResponse.json({ error: "Invalid API response" }, { status: 500 });
//     }

//     // 6. Transform Data
//     let demographics = { male: 0, female: 0, unknown: 0 };
//     let totalFollowers = 0;

//     results.forEach(({ dimension_values, value }) => {
//       const gender = dimension_values[0]; // 'M', 'F', or 'U'
//       if (gender === "M") demographics.male = value;
//       else if (gender === "F") demographics.female = value;
//       else demographics.unknown = value;

//       totalFollowers += value;
//     });

//     const percentages = {
//       male: totalFollowers ? ((demographics.male / totalFollowers) * 100).toFixed(2) : "0.00",
//       female: totalFollowers ? ((demographics.female / totalFollowers) * 100).toFixed(2) : "0.00",
//       unknown: totalFollowers ? ((demographics.unknown / totalFollowers) * 100).toFixed(2) : "0.00",
//     };

//     console.log("📊 Processed Gender Demographics:", percentages);

//     // 7. Return
//     return NextResponse.json({ demographics: percentages }, { status: 200 });

//   } catch (error) {
//     console.error("🚨 Internal Server Error:", error.message);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }


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

