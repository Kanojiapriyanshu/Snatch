import { NextResponse } from "next/server";
import connectDb from "@/db/mongoose";
import User from "@/models/user.model";
import { getAuth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  await connectDb();
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: "User ID required" }, { status: 401 });
  }
  await User.findOneAndUpdate(
    { userId },
    { hasViewedPortfolio: true },
    { new: true }
  );
  return NextResponse.json({ success: true });
}