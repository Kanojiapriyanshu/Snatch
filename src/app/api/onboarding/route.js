import { NextResponse } from "next/server";
import connectDb from "@/db/mongoose";
import OnboardingData from "@/models/onboarding.model";
import User from "@/models/user.model";
import { clerkClient } from "@clerk/clerk-sdk-node";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, formData } = body;

    await connectDb();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    const { isDraft, _id, __v, createdAt, updatedAt, ...cleanFormData } = formData;

    let onboardingData = await OnboardingData.findOne({ userId });
    if (onboardingData) {
      onboardingData = await OnboardingData.findOneAndUpdate(
        { userId },
        { ...cleanFormData, isDraft: false, hasCompletedOnboarding: true },
        { new: true, runValidators: true }
      );
    } else {
      onboardingData = await OnboardingData.create({
        ...cleanFormData,
        userId,
        isDraft: false,
      });
    }

    onboardingData = onboardingData.toObject();
    onboardingData._id = onboardingData._id.toString();

    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({
        userId,
        instagramUsername: onboardingData.username,
        onboardingData: onboardingData._id,
      });
    } else {
      user.onboardingData = onboardingData._id;
      user.instagramUsername = onboardingData.username;
      await user.save();
    }

    user = user.toObject();
    user._id = user._id.toString();
    user.onboardingData = user.onboardingData.toString();

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        hasCompletedOnboarding: true,
        username: onboardingData.username,
      },
    });

    return NextResponse.json(
      { success: true, message: "Success", data: { onboardingData, user } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in onboarding route:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
