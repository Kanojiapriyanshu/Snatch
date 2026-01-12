import { NextResponse } from "next/server";
import ProjectDraft from "@/models/project.model";
import User from "@/models/user.model";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const username = url.searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { success: false, error: "Username is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ instagramUsername: username });
    if (!user?.instagramAccessToken) {
      return NextResponse.json(
        { error: "Instagram not connected" },
        { status: 401 }
      );
    }

    const project = await ProjectDraft.findOne({ userId: user.userId });
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const stats = await Promise.all(
      project.instagramSelected.map(async ({ mediaId }) => {
        try {
          const insightsUrl = `https://graph.facebook.com/v17.0/${mediaId}/insights?metric=views,likes,comments,shares&access_token=${user.instagramAccessToken}`;

          const res = await fetch(insightsUrl);
          const json = await res.json();

          const metricMap = {
            views: 0,
            likes: 0,
            comments: 0,
            shares: 0,
          };

          for (const item of json?.data || []) {
            metricMap[item.name] = item.values?.[0]?.value ?? 0;
          }

          return {
            mediaId,
            ...metricMap,
          };
        } catch (err) {
          console.error("Insights failed:", mediaId);
          return {
            mediaId,
            views: 0,
            likes: 0,
            comments: 0,
            shares: 0,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
