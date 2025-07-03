import { NextResponse } from "next/server";
import connectDb from "@/db/mongoose";
import User from "@/models/user.model";
import { getAuth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  await connectDb();
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ hasViewedPortfolio: false });
  }
  const user = await User.findOne({ userId });
  return NextResponse.json({ hasViewedPortfolio: user?.hasViewedPortfolio || false });
}