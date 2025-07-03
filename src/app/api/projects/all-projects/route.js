import { NextResponse } from "next/server";
import connectDb from "@/db/mongoose";
import ProjectDraft from "@/models/project.model";
import { getAuth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDb();

    // Get the userId from authentication
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required." },
        { status: 400 }
      );
    }

    // Find the user's project
    const project = await ProjectDraft.findOne({ userId });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found." },
        { status: 404 }
      );
    }

    // Fetch all Instagram-selected projects and uploaded file projects
    const instagramProjects = project.instagramSelected || [];
    const uploadedProjects = project.uploadedFiles || []; // Ensure uploaded files are included

    return NextResponse.json({
      success: true,
      instagram: instagramProjects,
      uploaded: uploadedProjects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
