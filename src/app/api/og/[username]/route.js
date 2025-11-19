// src/app/api/og/[username]/route.js
import { ImageResponse } from "next/og";
import connectDb from "@/db/mongoose";
import OnboardingData from "@/models/onboarding.model";

export const runtime = "nodejs";
export const preferredRegion = "bom1";

export async function GET(req, { params }) {
  const { username } = params;
  let user = null;

  try {
    await connectDb();
    user = await OnboardingData.findOne({ username }).lean();
  } catch (err) {
    console.error("❌ DB Error:", err);
  }

  if (!user) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 50,
            color: "white",
            background: "linear-gradient(135deg, #004CFF 0%, #0057E7 50%, #002D8B 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Creator not found
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const profilePic =
    user.profilePicture?.startsWith("http")
      ? user.profilePicture
      : "https://app.snatchsocial.com/default-thumbnail.jpg";

    function formatNumber(num) {
    if (!num) return "—";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return num;
    }


  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex", // ✅ Important!
          background: "#0057E7",
          color: "white",
          fontFamily: "sans-serif",
          padding: "60px 80px",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left Section */}
        <div
          style={{
            flex: 1,
            display: "flex", // ✅ Important
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h1 style={{ fontSize: 64, fontWeight: "bold", margin: 0 }}>
            {user.firstName} {user.lastName || ""}
          </h1>

          <p style={{ fontSize: 28, color: "white", margin: "10px 0" }}>
            @{user.username} {user.location ? `• ${user.location}` : ""}
          </p>

          <p style={{ fontSize: 30, margin: "30px 0 0 0" }}>
             {/* {user.story || "—"} - {user.reels} •{" "}
            {user.compensation?.join(", ") || "Compensation N/A"} */}
           {formatNumber(user.story)} - {formatNumber(user.reels)} •{" "}
          {user.compensation?.join(", ") || "Compensation N/A"}
          </p>

          <p style={{ marginTop: 20, color: "#ccc" }}>
            {user.industry?.join(", ") || ""}
          </p>
        </div>

        {/* Right Section */}
        <div
          style={{
            width: 300,
            height: 400,
            borderRadius: 20,
            overflow: "hidden",
            background: "#222",
            display: "flex", // ✅ Important
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={profilePic}
            width="300"
            height="400"
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>
    ),
    { width: 1200, height: 630,  }
  );
}
