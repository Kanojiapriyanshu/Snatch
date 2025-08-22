//expires_at needs to add to let checking then fetch
import { NextResponse } from "next/server";
import { refreshInstagramMedia } from "@/utils/refreshInstagram";
import connectDb from "@/db/mongoose";
import User from "@/models/user.model";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const username = searchParams.get("username");

    if (!userId && !username) {
      return NextResponse.json(
        { success: false, message: "Missing userId or username" },
        { status: 400 }
      );
    }

    await connectDb();

    // 🟢 Find user by userId or instagramUsername
    let user;
    if (userId) {
      user = await User.findOne({ userId });
    } else if (username) {
      user = await User.findOne({ instagramUsername: username });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    await refreshInstagramMedia(user.userId);

    return NextResponse.json({ success: true, message: "Refreshed media" });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
