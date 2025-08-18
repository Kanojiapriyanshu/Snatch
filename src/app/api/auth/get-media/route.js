import { NextResponse } from "next/server";
import User from "@/models/user.model";
import { getAuth } from "@clerk/nextjs/server";
import connectDb from "@/db/mongoose";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDb();
    const { searchParams } = req.nextUrl;
    const after = searchParams.get("after") || "";
    const limit = parseInt(searchParams.get("limit") || "20");

    // Clerk auth
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { connected: false, error: "User not present! Please sign up first." },
        { status: 401 }
      );
    }

    // Fetch user from DB
    const user = await User.findOne({ userId });
    if (!user) {
      return NextResponse.json(
        { connected: false, error: "User not found in the database." },
        { status: 404 }
      );
    }

    const { instagramAccessToken, instagramAccountId } = user;
    if (!instagramAccessToken || !instagramAccountId) {
      return NextResponse.json(
        { error: "Instagram access token or account ID is missing." },
        { status: 400 }
      );
    }

    // Fetch IG Media with pagination
    const mediaUrl =
      `https://graph.facebook.com/v21.0/${instagramAccountId}/media?` +
      `fields=id,media_type,media_url,permalink,caption,timestamp,like_count,comments_count,thumbnail_url,username` +
      `&limit=${limit}` +
      (after ? `&after=${after}` : ``) +
      `&access_token=${instagramAccessToken}`;

    const mediaResponse = await fetch(mediaUrl);
    const mediaData = await mediaResponse.json();

    if (!mediaResponse.ok || mediaData.error) {
      return NextResponse.json(
        { error: mediaData.error?.message || "Failed to fetch Instagram user media." },
        { status: 500 }
      );
    }

    // Handle carousels
    const enrichedMediaData = await Promise.all(
      mediaData.data.map(async (mediaItem) => {
        if (mediaItem.media_type === "CAROUSEL_ALBUM") {
          const carouselResponse = await fetch(
            `https://graph.facebook.com/v21.0/${mediaItem.id}/children?fields=id,media_type,media_url&access_token=${instagramAccessToken}`
          );
          const carouselData = await carouselResponse.json();
          return { ...mediaItem, children: carouselData.data || [] };
        }
        return mediaItem;
      })
    );

    // Get media_count
    const countResponse = await fetch(
      `https://graph.facebook.com/v21.0/${instagramAccountId}?fields=media_count&access_token=${instagramAccessToken}`
    );
    const countData = await countResponse.json();

    return NextResponse.json({
      mediaData: enrichedMediaData,
      paging: mediaData.paging || {},
      mediaCount: countData.media_count
    });
  } catch (error) {
    console.error("Error fetching media data:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
