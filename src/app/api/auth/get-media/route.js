import { NextResponse } from "next/server";
import User from "@/models/user.model";
import { getAuth } from "@clerk/nextjs/server";
import connectDb from "@/db/mongoose";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDb();

    const { searchParams } = req.nextUrl;
    const sortBy = searchParams.get("sort") || "date"; // "date" | "engagement" | "likes" | "comments"
    const order = searchParams.get("order") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Clerk Auth
    const { userId } = getAuth(req);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findOne({ userId });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { instagramAccessToken, instagramAccountId } = user;
    if (!instagramAccessToken || !instagramAccountId)
      return NextResponse.json(
        { error: "Instagram not connected" },
        { status: 400 }
      );

    // ---------------------------------------------------------
    // 1) FETCH ALL MEDIA METADATA (FAST FETCH)
    // ---------------------------------------------------------
    let allMeta = [];
    let nextPage = null;

    do {
      const url =
        `https://graph.facebook.com/v21.0/${instagramAccountId}/media?` +
        `fields=id,media_type,timestamp,like_count,comments_count,video_views` +
        `&limit=100` +
        (nextPage ? `&after=${nextPage}` : ``) +
        `&access_token=${instagramAccessToken}`;

      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();

      allMeta = [...allMeta, ...(json.data || [])];
      nextPage = json.paging?.cursors?.after || null;
    } while (nextPage);

    // ---------------------------------------------------------
    // 2) FETCH followers + media_count
    // ---------------------------------------------------------
    const countRes = await fetch(
      `https://graph.facebook.com/v21.0/${instagramAccountId}?fields=followers_count,media_count&access_token=${instagramAccessToken}`
    );
    const countJson = await countRes.json();

    const followers = countJson.followers_count || 0;
    const mediaCount = countJson.media_count || allMeta.length;

    // ---------------------------------------------------------
    // 3) COMPUTE ENGAGEMENT RATE
    // ---------------------------------------------------------
    const computed = allMeta.map((p) => {
      const likes = p.like_count || 0;
      const comments = p.comments_count || 0;
      const engagement = followers ? ((likes + comments) / followers) * 100 : 0;

      return {
        ...p,
        engagementRate: parseFloat(engagement.toFixed(2)),
      };
    });

    // ---------------------------------------------------------
    // 4) SORT LOGIC
    // ---------------------------------------------------------
    const sortKey =
      sortBy === "likes"
        ? "like_count"
        : sortBy === "comments"
        ? "comments_count"
        : sortBy === "engagement"
        ? "engagementRate"
        : "timestamp";

    computed.sort((a, b) => {
      if (sortKey === "timestamp") {
        return order === "asc"
          ? new Date(a.timestamp) - new Date(b.timestamp)
          : new Date(b.timestamp) - new Date(a.timestamp);
      }
      return order === "asc" ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
    });

    // ---------------------------------------------------------
    // 5) PAGINATION (AFTER SORT)
    // ---------------------------------------------------------
    const start = (page - 1) * limit;
    const pagePosts = computed.slice(start, start + limit);

    const ids = pagePosts.map((p) => p.id);

    if (ids.length === 0) {
      return NextResponse.json({
        mediaData: [],
        totalPosts: computed.length,
        mediaCount,
        page,
        limit,
        totalPages: Math.ceil(computed.length / limit),
      });
    }

    // ---------------------------------------------------------
    // 6) FETCH URL + CHILDREN ONLY FOR PAGINATED POSTS
    // ---------------------------------------------------------
    const batchUrl =
      `https://graph.facebook.com/v21.0/?ids=${ids.join(",")}` +
      `&fields=id,media_url,thumbnail_url,caption,permalink,username,media_type,timestamp,children{ id, media_type, media_url, thumbnail_url }` +
      `&access_token=${instagramAccessToken}`;

    const batchRes = await fetch(batchUrl, { cache: "no-store" });
    const batchData = await batchRes.json();

    // ---------------------------------------------------------
    // 7) FINAL MERGE + SAFE CHILDREN NORMALIZATION
    // ---------------------------------------------------------
    const finalPosts = pagePosts.map((p) => {
      const full = batchData[p.id] || {};

      let children = [];

      // IG sometimes returns children in different ways
      if (full.children) {
        if (Array.isArray(full.children)) {
          children = full.children;
        } else if (Array.isArray(full.children?.data)) {
          children = full.children.data;
        } else if (typeof full.children === "object") {
          children = [full.children];
        }
      }

      return {
        ...p,
        ...full,
        children, // ALWAYS an array
      };
    });

    return NextResponse.json({
      mediaData: finalPosts,
      totalPosts: computed.length,
      mediaCount,
      page,
      limit,
      totalPages: Math.ceil(computed.length / limit),
      paging: {
    cursors: {
      before: page > 1 ? `page=${page - 1}` : null,
      after: page < Math.ceil(computed.length / limit) ? `page=${page + 1}` : null,
    },
    next:
      page < Math.ceil(computed.length / limit)
        ? `?page=${page + 1}&limit=${limit}`
        : null,
    previous:
      page > 1 ? `?page=${page - 1}&limit=${limit}` : null,
  },
   });

  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
