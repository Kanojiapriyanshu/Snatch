import { NextResponse } from "next/server";
import connectDb from "@/db/mongoose";
import ProjectDraft from "@/models/project.model";
import OnboardingData from "@/models/onboarding.model";

export async function GET(req) {
  try {
    await connectDb();

    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const userIdParam = searchParams.get("userId");

    if (!username && !userIdParam) {
      return NextResponse.json(
        { success: false, error: "Either username or userId is required." },
        { status: 400 }
      );
    }

    const matchStage = userIdParam
      ? { userId: userIdParam }
      : { username };

    const result = await OnboardingData.aggregate([
      /** 1️⃣ Find user using INDEX */
      { $match: matchStage },

      /** 2️⃣ Join ProjectDraft using indexed userId */
      {
        $lookup: {
          from: "projectdrafts",
          localField: "userId",
          foreignField: "userId",
          as: "project",
        },
      },

      /** 3️⃣ Flatten project array */
      { $unwind: "$project" },

      /** 4️⃣ Filter drafts inside Mongo */
      {
        $project: {
          _id: 0,
          instagram: {
            $filter: {
              input: "$project.instagramSelected",
              as: "item",
              cond: { $eq: ["$$item.isDraft", false] },
            },
          },
          uploaded: {
            $filter: {
              input: "$project.uploadedFiles",
              as: "item",
              cond: { $eq: ["$$item.isDraft", false] },
            },
          },
        },
      },
    ]);

    if (!result.length) {
      return NextResponse.json(
        { success: false, error: "No project data found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      instagram: result[0].instagram,
      uploaded: result[0].uploaded,
    });
  } catch (error) {
    console.error("Media kit API error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

