// src/app/api/user/usage/update/route.js
// cutsomize it for all the user updates as per plan and features like credits used etc
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDb from "@/db/mongoose";
import User from "@/models/user.model";

export async function POST(req) {
  try {
    const authUser = await currentUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, action } = await req.json();

    if (!["projects", "generations"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (!["increment", "decrement"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await connectDb();
    const user = await User.findOne({ userId: authUser.id });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const usageField = type === "projects" ? "projectsUsed" : "generationsUsed";
    const limitField = type === "projects" ? "projectLimit" : "generationLimit";

    // === INCREMENT ===
    if (action === "increment") {
      if (user.usage[usageField] >= user.limits[limitField]) {
        return NextResponse.json(
          { error: `${type} limit reached` },
          { status: 403 }
        );
      }

      user.usage[usageField] += 1;
    }

    // === DECREMENT ===
    if (action === "decrement") {
      if (user.usage[usageField] > 0) {
        user.usage[usageField] -= 1;
      }
    }

    await user.save();

    return NextResponse.json({
      status: "success",
      type,
      action,
      newValue: user.usage[usageField],
      limit: user.limits[limitField],
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
