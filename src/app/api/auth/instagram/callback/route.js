import { NextResponse } from "next/server";
import User from "@/models/user.model";
import { getAuth } from "@clerk/nextjs/server";
import connectDb from "@/db/mongoose";

const CLIENT_ID = "1068594868074995";
const CLIENT_SECRET = "7aa94560586507e6c840da8105090984";
//const REDIRECT_URI =
  //"https://wf7s4f88-3000.inc1.devtunnels.ms/manage-projects/pick-projects";
const REDIRECT_URI = 'https://app.snatchsocial.com/manage-projects/pick-projects';

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");

  // new pagination params
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const { userId } = getAuth(req);

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code missing" },
      { status: 400 }
    );
  }

  try {
    await connectDb();

    // ---------------------------------------------------------
    // STEP 1 — Short lived token
    // ---------------------------------------------------------
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&client_secret=${CLIENT_SECRET}&code=${code}`
    );
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      return NextResponse.json(
        { error: tokenData.error?.message || "Token exchange failed" },
        { status: 500 }
      );
    }

    const shortToken = tokenData.access_token;

    // ---------------------------------------------------------
    // STEP 2 — Long lived token
    // ---------------------------------------------------------
    const longResp = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&fb_exchange_token=${shortToken}`
    );
    const longData = await longResp.json();
    const longToken = longData.access_token;

    // ---------------------------------------------------------
    // STEP 3 — Fetch FB pages
    // ---------------------------------------------------------
    const pagesResp = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${longToken}`
    );
    const pagesData = await pagesResp.json();

    if (!pagesData.data?.length) {
      return NextResponse.json(
        { error: "No pages found for this user" },
        { status: 404 }
      );
    }

    // ---------------------------------------------------------
    // STEP 4 — Pick IG business account
    // ---------------------------------------------------------
    let selectedPage = null;

    for (const pageInfo of pagesData.data) {
      const igResp = await fetch(
        `https://graph.facebook.com/v21.0/${pageInfo.id}?fields=instagram_business_account&access_token=${longToken}`
      );
      const igData = await igResp.json();

      if (igData.instagram_business_account) {
        selectedPage = {
          pageName: pageInfo.name,
          pageToken: pageInfo.access_token,
          instagramAccountId: igData.instagram_business_account.id,
        };
        break;
      }
    }

    if (!selectedPage) {
      return NextResponse.json(
        { error: "No Instagram Business account linked" },
        { status: 404 }
      );
    }

    // ---------------------------------------------------------
    // STEP 5 — Save to DB
    // ---------------------------------------------------------
    await User.findOneAndUpdate(
      { userId },
      {
        instagramAccessToken: selectedPage.pageToken,
        instagramAccountId: selectedPage.instagramAccountId,
        facebookPageName: selectedPage.pageName,
      },
      { new: true }
    );

    // ---------------------------------------------------------
    // STEP 6 — Fetch ALL MEDIA METADATA (for pagination)
    // ---------------------------------------------------------
    let allMeta = [];
    let nextPage = null;

    do {
      const metaUrl =
        `https://graph.facebook.com/v21.0/${selectedPage.instagramAccountId}/media?` +
        `fields=id,media_type,timestamp,like_count,comments_count,video_views` +
        `&limit=100` +
        (nextPage ? `&after=${nextPage}` : ``) +
        `&access_token=${selectedPage.pageToken}`;

      const res = await fetch(metaUrl);
      const json = await res.json();

      allMeta = [...allMeta, ...(json.data || [])];
      nextPage = json.paging?.cursors?.after || null;
    } while (nextPage);

    // ---------------------------------------------------------
    // STEP 7 — follower count
    // ---------------------------------------------------------
    const countResp = await fetch(
      `https://graph.facebook.com/v21.0/${selectedPage.instagramAccountId}?fields=followers_count,media_count&access_token=${selectedPage.pageToken}`
    );
    const countData = await countResp.json();

    const followers = countData.followers_count || 0;
    const mediaCount = countData.media_count || allMeta.length;

    // ---------------------------------------------------------
    // STEP 8 — compute engagement rate
    // ---------------------------------------------------------

    const computed = allMeta.map((p) => {
      const likes = p.like_count || 0;
      const comments = p.comments_count || 0;
      const eng = followers ? ((likes + comments) / followers) * 100 : 0;

      return {
        ...p,
        engagementRate: parseFloat(eng.toFixed(2)),
      };
    });

    // ---------------------------------------------------------
    // NEW STEP — SORT LOGIC
    // ---------------------------------------------------------
    const sortBy = searchParams.get("sort") || "date"; 
    const order = searchParams.get("order") || "desc";

    let sortKey = "timestamp"; 
    switch (sortBy) {
      case "likes":
        sortKey = "like_count";
        break;
      case "comments":
        sortKey = "comments_count";
        break;
      case "engagement":
        sortKey = "engagementRate";
        break;
      case "date":
      default:
        sortKey = "timestamp";
        break;
    }

    computed.sort((a, b) => {
      if (sortKey === "timestamp") {
        return order === "asc"
          ? new Date(a.timestamp) - new Date(b.timestamp)
          : new Date(b.timestamp) - new Date(a.timestamp);
      }
      return order === "asc"
        ? a[sortKey] - b[sortKey]
        : b[sortKey] - a[sortKey];
    });

    // ---------------------------------------------------------
    // STEP 9 — PAGINATION
    // ---------------------------------------------------------
    const totalPosts = computed.length;
    const totalPages = Math.ceil(totalPosts / limit);

    const start = (page - 1) * limit;
    const pageSlice = computed.slice(start, start + limit);

    const ids = pageSlice.map((p) => p.id);

    // ---------------------------------------------------------
    // STEP 10 — Fetch full post data (carousel etc)
    // ---------------------------------------------------------
    let batchData = {};
    if (ids.length > 0) {
      const batchUrl =
        `https://graph.facebook.com/v21.0/?ids=${ids.join(",")}` +
        `&fields=id,media_url,thumbnail_url,caption,permalink,username,media_type,timestamp,children{ id,media_type,media_url,thumbnail_url }` +
        `&access_token=${selectedPage.pageToken}`;

      const batchRes = await fetch(batchUrl);
      batchData = await batchRes.json();
    }

    const finalPosts = pageSlice.map((p) => {
      const full = batchData[p.id] || {};

      let children = [];
      if (full.children?.data) children = full.children.data;
      else if (Array.isArray(full.children)) children = full.children;
      else if (full.children) children = [full.children];

      return {
        ...p,
        ...full,
        children,
      };
    });

    // ---------------------------------------------------------
    // STEP 11 — RETURN SAME PAGINATION FORMAT AS OTHER ROUTE
    // ---------------------------------------------------------
    return NextResponse.json({
      connected: true,
      mediaData: finalPosts,
      totalPosts,
      mediaCount,
      page,
      limit,
      totalPages,
      paging: {
        cursors: {
          before: page > 1 ? `page=${page - 1}` : null,
          after: page < totalPages ? `page=${page + 1}` : null,
        },
        next: page < totalPages ? `?page=${page + 1}&limit=${limit}` : null,
        previous: page > 1 ? `?page=${page - 1}&limit=${limit}` : null,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
