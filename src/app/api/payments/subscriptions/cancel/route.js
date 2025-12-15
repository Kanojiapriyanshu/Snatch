import Razorpay from "razorpay";
import connectDb from "@/db/mongoose";
import User from "@/models/user.model";

export async function POST(req) {
  await connectDb();
  const { userId } = await req.json();

  const user = await User.findOne({ userId });
  if (!user?.subscription?.subscriptionId) {
    return Response.json({ error: "No active subscription" }, { status: 400 });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_LIVE_KEY_ID,
    key_secret: process.env.RAZORPAY_LIVE_KEY_SECRET,
  });

  // Cancel immediately → stops all future debits
  await razorpay.subscriptions.cancel(
    user.subscription.subscriptionId,
    true
  );

  // Downgrade handled finally by webhook (source of truth)
  return Response.json({ success: true });
}
