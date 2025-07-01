import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import connectDb from "@/db/mongoose";
import ProjectDraft from "@/models/project.model";

export async function GET(req) {
  try {
    await connectDb();
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required." }, { status: 400 });
    }

    const draft = await ProjectDraft.findOne({ userId });
    if (!draft) {
      return NextResponse.json({ success: true, filledCount: 0 });
    }

    // Count all projects (Instagram + uploaded) where isDraft is false
    const filledInstagram = (draft.instagramSelected || []).filter(p => p.isDraft === false);
    const filledUploaded = (draft.uploadedFiles || []).filter(p => p.isDraft === false);

    const filledCount = filledInstagram.length + filledUploaded.length;

    return NextResponse.json({ success: true, filledCount });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}