//src/app/api/payments/subscriptions/verify/route.js
import crypto from "crypto";
import User from "@/models/user.model";
import connectDb from "@/db/mongoose";

export async function POST(req) {
  await connectDb();
  
  const { razorpay_subscription_id, razorpay_signature, razorpay_payment_id } =
    await req.json();

  // Verify signature
  const generated_signature = crypto
    .createHmac("sha256", process.env.Test_Key_Secret)
    .update(razorpay_payment_id + "|" + razorpay_subscription_id)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const user = await User.findOne({
    "subscription.subscriptionId": razorpay_subscription_id,
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // Payment successful → still in trial
  user.subscription.plan = "trial";
  await user.save();

  return Response.json({ success: true });
}
