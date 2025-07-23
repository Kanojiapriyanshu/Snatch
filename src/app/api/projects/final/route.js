import { NextResponse } from "next/server";
import connectDb from "@/db/mongoose";
import ProjectDraft from "@/models/project.model";
import { getAuth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await connectDb();
    const { mediaIds } = await req.json();
    const { userId } = getAuth(req);

    if (!userId || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      return NextResponse.json({ success: false, error: "Missing userId or mediaIds" }, { status: 400 });
    }

    // Find the user's draft
    const draft = await ProjectDraft.findOne({ userId });
    if (!draft) {
      return NextResponse.json({ success: false, error: "No draft found for user" }, { status: 404 });
    }

    // Update isDraft for matching projects in instagramSelected
    draft.instagramSelected = (draft.instagramSelected || []).map(item =>
      mediaIds.includes(item.mediaId) ? { ...item, isDraft: false } : item
    );

    // Update isDraft for matching projects in uploadedFiles
    draft.uploadedFiles = (draft.uploadedFiles || []).map(item =>
      mediaIds.includes(item.mediaId) ? { ...item, isDraft: false } : item
    );

    // Also update isDraft for matching formData (if needed)
    draft.formData = (draft.formData || []).map(item =>
      mediaIds.includes(item.key) ? { ...item, isDraft: false } : item
    );

    await draft.save();

    return NextResponse.json({ success: true, message: "Projects finalized", instagram: draft.instagramSelected, uploaded: draft.uploadedFiles });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

