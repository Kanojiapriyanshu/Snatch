import { ImageResponse } from "next/og";
import connectDb from "@/db/mongoose";
import OnboardingData from "@/models/onboarding.model";

export const runtime = "edge"; // faster response for image generation

export async function GET(req, { params }) {
  const { username } = params;

  await connectDb();
  const user = await OnboardingData.findOne({ username });

  if (!user) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 50,
            color: "white",
            background: "black",
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

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(180deg, #111 0%, #000 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "sans-serif",
          padding: "60px 80px",
        }}
      >
        {/* Left side info */}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 64, fontWeight: "bold" }}>
            {user.firstName} {user.lastName || ""}
          </h1>
          <p style={{ fontSize: 28, color: "#aaa" }}>
            @{user.username} • {user.location}
          </p>

          <p style={{ fontSize: 30, marginTop: 30 }}>
            Rs {user.post || "—"} • {user.compensation?.join(", ") || "Compensation N/A"}
          </p>

          <p style={{ marginTop: 20, color: "#ccc" }}>
            {user.industry?.join(", ") || ""}
          </p>
        </div>

        {/* Right side image */}
        <div
          style={{
            width: 300,
            height: 400,
            borderRadius: 20,
            overflow: "hidden",
            background: "#222",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              width="300"
              height="400"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <span>No image</span>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
