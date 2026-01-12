// src/app/api/payments/subscriptions/create/route.js
import Razorpay from "razorpay";
import connectDb from "@/db/mongoose";
import User from "@/models/user.model";

export async function POST(req) {
  await connectDb();

  const { userId, planType } = await req.json();

  const user = await User.findOne({ userId });
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_LIVE_KEY_ID,
    key_secret: process.env.RAZORPAY_LIVE_KEY_SECRET,
  });

  const planId =
    planType === "monthly"
      ? process.env.Monthly_Live_Plan_ID
      : process.env.Annual_Live_Plan_ID;

 const trialSeconds = 2 * 24 * 60 * 60;  //2 days
//  const trialSeconds = 5 * 60; // 300 seconds

  const subscription = await razorpay.subscriptions.create({
    plan_id: planId,
    customer_notify: 1,
    start_at: Math.floor(Date.now() / 1000) + trialSeconds,
    total_count: planType === "monthly" ? 12 : 1,
    notes: {
      userId,
      planType,
    },
  });

  user.subscription = {
    plan: "trial",
    subscriptionId: subscription.id,
    trialStartedAt: new Date(),
    trialEndsAt: new Date(Date.now() + trialSeconds * 1000),
    isActive: true,
  };

  await user.save();

  return Response.json({
    subscriptionId: subscription.id,
    razorpayKey: process.env.RAZORPAY_LIVE_KEY_ID,
  });
}
