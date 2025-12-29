// src/app/api/user/limits/route.js
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDb from "@/db/mongoose";
import User from "@/models/user.model";

export async function GET() {
  try {
    const authUser = await currentUser();
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDb();

    const user = await User.findOne({ userId: authUser.id });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      plan: user.subscription.plan,

      generationsUsed: user.usage.generationsUsed,
      generationLimit: user.limits.generationLimit,

      projectsUsed: user.usage.projectsUsed,
      projectLimit: user.limits.projectLimit,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
