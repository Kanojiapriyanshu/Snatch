import { NextResponse } from "next/server";
import connectDb from "@/db/mongoose";
import OnboardingData from "@/models/onboarding.model";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDb();

    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { success: false, error: "username is required" },
        { status: 400 }
      );
    }

    const result = await OnboardingData.aggregate([
      // 1️⃣ Match user
      { $match: { username } },

      // 2️⃣ Lookup project drafts
      {
        $lookup: {
          from: "projectdrafts",
          localField: "userId",
          foreignField: "userId",
          as: "project",
        },
      },

      { $unwind: "$project" },

      // 3️⃣ Filter NON-DRAFT media
      {
        $project: {
          userId: 1,
          formData: "$project.formData",

          instagramSelected: {
            $filter: {
              input: "$project.instagramSelected",
              as: "ig",
              cond: { $eq: ["$$ig.isDraft", false] },
            },
          },

          uploadedFiles: {
            $filter: {
              input: "$project.uploadedFiles",
              as: "up",
              cond: { $eq: ["$$up.isDraft", false] },
            },
          },
        },
      },

      // 4️⃣ Unwind formData (one post at a time)
      { $unwind: "$formData" },

      // 5️⃣ Match formData with media
      {
        $addFields: {
          instagramMatch: {
            $first: {
              $filter: {
                input: "$instagramSelected",
                as: "ig",
                cond: { $eq: ["$$ig.mediaId", "$formData.key"] },
              },
            },
          },

          uploadMatch: {
            $first: {
              $filter: {
                input: "$uploadedFiles",
                as: "up",
                cond: {
                  $eq: [
                    { $toString: "$$up.mediaId" },
                    "$formData.key",
                  ],
                },
              },
            },
          },
        },
      },

      // 6️⃣ Keep only posts that actually have media
      {
        $match: {
          $or: [
            { instagramMatch: { $ne: null } },
            { uploadMatch: { $ne: null } },
          ],
        },
      },

      // 7️⃣ Normalize response
      {
        $project: {
          postId: "$formData.key",
          formData: 1,

          media: {
            $cond: {
              if: { $ne: ["$instagramMatch", null] },
              then: {
                source: "instagram",
                type: {
                  $cond: [
                    { $eq: ["$instagramMatch.name", "CAROUSEL_ALBUM"] },
                    "CAROUSEL",
                    {
                      $cond: [
                        { $eq: ["$instagramMatch.name", "VIDEO"] },
                        "VIDEO",
                        "IMAGE",
                      ],
                    },
                  ],
                },
                files: {
                  $cond: [
                    { $eq: ["$instagramMatch.name", "CAROUSEL_ALBUM"] },
                    {
                      $map: {
                        input: "$instagramMatch.children",
                        as: "child",
                        in: {
                          type: "$$child.media_type",
                          url: "$$child.media_url",
                        },
                      },
                    },
                    [
                      {
                        type: {
                          $cond: [
                            { $eq: ["$instagramMatch.name", "VIDEO"] },
                            "VIDEO",
                            "IMAGE",
                          ],
                        },
                        url: "$instagramMatch.mediaLink",
                      },
                    ],
                  ],
                },
              },
              else: {
                source: "uploaded",
                type: {
                  $cond: [
                    {
                      $regexMatch: {
                        input: "$uploadMatch.fileName",
                        regex: /\.mp4$/i,
                      },
                    },
                    "VIDEO",
                    "IMAGE",
                  ],
                },
                files: [
                  {
                    type: {
                      $cond: [
                        {
                          $regexMatch: {
                            input: "$uploadMatch.fileName",
                            regex: /\.mp4$/i,
                          },
                        },
                        "VIDEO",
                        "IMAGE",
                      ],
                    },
                    url: "$uploadMatch.fileUrl",
                  },
                ],
              },
            },
          },
        },
      },
    ]);

    const response = NextResponse.json({
      success: true,
      posts: result,
    });

    // ✅ CDN-friendly caching
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return response;
  } catch (err) {
    console.error("Preview fetch error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
