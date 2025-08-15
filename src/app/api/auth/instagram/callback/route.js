//api/auth/instagram/callback/route.js  

import { NextResponse } from "next/server";
import User from "@/models/user.model";
import { getAuth } from "@clerk/nextjs/server";
import connectDb from "@/db/mongoose";

const CLIENT_ID = '1068594868074995';
const CLIENT_SECRET = '7aa94560586507e6c840da8105090984';
//const REDIRECT_URI = 'https://l6r9j4st-3000.inc1.devtunnels.ms/manage-projects/pick-projects'
//const REDIRECT_URI = 'https://wf7s4f88-3000.inc1.devtunnels.ms/manage-projects/pick-projects';
// const REDIRECT_URI = 'https://snatch-pi.vercel.app/manage-projects/pick-projects';
// Base redirect URI without query parameters
const BASE_REDIRECT_URI = 'https://app.snatchsocial.com/manage-projects/pick-projects';
//const REDIRECT_URI = BASE_REDIRECT_URI;

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const after = searchParams.get("after") || "";
  const limit = parseInt(searchParams.get("limit") || "20"); //20
  const { userId } = getAuth(req);

  if (!code) {
    return NextResponse.json({ error: "Authorization code not found" }, { status: 400 });
  }

  try {
    await connectDb();

    // Step 1: Exchange short-lived token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_secret=${CLIENT_SECRET}&code=${code}`
    );
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || tokenData.error) {
      return NextResponse.json({ error: tokenData.error?.message || "Failed to fetch access token" }, { status: 500 });
    }
    const { access_token: shortLivedAccessToken } = tokenData;

    // Step 2: Exchange for long-lived token
    const longLivedTokenResponse = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&fb_exchange_token=${shortLivedAccessToken}`
    );
    const { access_token: longLivedAccessToken } = await longLivedTokenResponse.json();

    // Step 3: Fetch FB Pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${longLivedAccessToken}`
    );
    const pagesData = await pagesResponse.json();
    if (!pagesResponse.ok || !pagesData.data?.length) {
      return NextResponse.json({ error: "No Facebook Pages found with Instagram Business account" }, { status: 404 });
    }

    // Step 4: Find IG Business Account
    let selectedPage = null;
    for (const page of pagesData.data) {
      const igAccountResponse = await fetch(
        `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${longLivedAccessToken}`
      );
      const igAccountData = await igAccountResponse.json();
      if (igAccountData.instagram_business_account) {
        selectedPage = {
          pageId: page.id,
          pageName: page.name,
          pageToken: page.access_token,
          instagramAccountId: igAccountData.instagram_business_account.id
        };
        break;
      }
    }
    if (!selectedPage) {
      return NextResponse.json({ error: "No Instagram account found" }, { status: 404 });
    }

    // Step 5: Save to DB
    await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          instagramAccessToken: selectedPage.pageToken,
          instagramAccountId: selectedPage.instagramAccountId,
          facebookPageName: selectedPage.pageName
        }
      },
      { new: true }
    );

    // Step 6: Fetch IG Media
    const mediaUrl =
      `https://graph.facebook.com/v21.0/${selectedPage.instagramAccountId}/media?` +
      `fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count,thumbnail_url,username` +
      `&limit=${limit}` +
      (after ? `&after=${after}` : ``) +
      `&access_token=${selectedPage.pageToken}`;

    const mediaResponse = await fetch(mediaUrl);
    const mediaData = await mediaResponse.json();

    // Step 7: Enrich carousel items
    const enrichedMediaData = await Promise.all(
      mediaData.data.map(async (mediaItem) => {
        if (mediaItem.media_type === "CAROUSEL_ALBUM") {
          const carouselResponse = await fetch(
            `https://graph.facebook.com/v21.0/${mediaItem.id}/children?fields=id,media_type,media_url&access_token=${selectedPage.pageToken}`
          );
          const carouselData = await carouselResponse.json();
          return { ...mediaItem, children: carouselData.data || [] };
        }
        return mediaItem;
      })
    );

    // Step 8: Get media_count
    const countResponse = await fetch(
      `https://graph.facebook.com/v21.0/${selectedPage.instagramAccountId}?fields=media_count&access_token=${selectedPage.pageToken}`
    );
    const countData = await countResponse.json();
    const mediaCount = countData.media_count;

    // Step 9: Return JSON (NO redirect)
    return NextResponse.json({
      connected: !after, // true only on first connection
      mediaData: enrichedMediaData,
      paging: mediaData.paging || {},
      mediaCount: countData.media_count
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
