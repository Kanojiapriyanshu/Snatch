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

  // Fallback OG
  if (!user) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 50,
            color: "white",
            background:
              "linear-gradient(135deg, #004CFF 0%, #0057E7 50%, #002D8B 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span>Creator not found</span>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const profilePic = user.profilePicture?.startsWith("http")
    ? user.profilePicture
    : "https://app.snatchsocial.com/default-thumbnail.jpg";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          background: "#ffffff",
          color: "#000",
          fontFamily: "sans-serif",
        }}
      >
        {/* LEFT IMAGE SIDE */}
        <div
          style={{
            width: "42%",
            height: "100%",
            overflow: "hidden",
            display: "flex",
          }}
        >
          <img
            src={profilePic}
            width="100%"
            height="100%"
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* RIGHT CONTENT SIDE */}
        <div
          style={{
            width: "58%",
            padding: "60px 50px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "35px",
          }}
        >
          {/* NAME */}
          <div
            style={{
              fontSize: 70,
              fontWeight: 600,
              marginBottom: -20,
              display: "flex",
            }}
          >
            <span>{`${user.firstName} ${user.lastName}`}</span>
          </div>

          {/* INDUSTRY TAGS */}
          {user?.industry?.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 15,
              }}
            >
              {user.industry.map((tag, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 20px",
                    background: "rgba(0, 55, 235, 0.10)",
                    borderRadius: 8,
                    fontSize: 30,
                    display: "flex",
                  }}
                >
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          )}

          {/* USERNAME + LOCATION */}
          <div
            style={{
              fontSize: 32,
              paddingTop: 10,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 15,
            }}
          >
            <span>@{user.username}</span>

            {user.location && <span>• {user.location}</span>}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
