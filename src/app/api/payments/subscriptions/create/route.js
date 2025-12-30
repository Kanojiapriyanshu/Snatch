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

 // const trialSeconds = 2 * 24 * 60 * 60;
 const trialSeconds = 5 * 60; // 300 seconds

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

// import Razorpay from "razorpay";
// import User from "@/models/user.model";
// import connectDb from "@/db/mongoose";

// export async function POST(req) {
//   await connectDb();

//   try {
//     const { userId, planType } = await req.json();

//     const user = await User.findOne({ userId });
//     if (!user) {
//       return Response.json({ error: "User not found" }, { status: 404 });
//     }

//     const planId =
//       planType === "monthly"
//         ? process.env.Monthly_Test_Plan_ID
//         : process.env.Annual_Test_Plan_ID;

//     const razorpay = new Razorpay({
//       key_id: process.env.Test_Key_ID,
//       key_secret: process.env.Test_Key_Secret,
//     });

//     const isMonthly = planType === "monthly";

//     const subscription = await razorpay.subscriptions.create({
//       plan_id: planId,
//       customer_notify: 1,
//       start_at: Math.floor(Date.now() / 1000) + (15 * 24 * 60 * 60), // trial = 15 days
//       total_count: isMonthly ? 12 : 100,
//       notes: { userId },
//     });


//     // Save subscription
//     user.subscription.plan = "trial";
//     user.subscription.subscriptionId = subscription.id;
//     user.subscription.trialEndsAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
//     user.subscription.isActive = true;

//     await user.save();

//     return Response.json({
//       success: true,
//       subscriptionId: subscription.id,
//       razorpayKey: process.env.Test_Key_ID,
//     });

//   } catch (err) {
//     console.error("Subscription error", err);
//     return Response.json({ error: err.error?.description || "Something went wrong" }, { status: 500 });
//   }
// }


    // const subscription = await razorpay.subscriptions.create({
    //   plan_id: planId,
    //   customer_notify: 1,
    //   start_at: Math.floor(Date.now() / 1000) + 300, // MUST be 5 mins in future
    //   total_count: isMonthly ? 1200 : 100, // Razorpay max rules
    //   notes: { userId },
    // });
// Enable:
// 1. Card Tokenization
// 2. Custom UI Checkout
// 3. Recurring payment tokenization
// 4. International Cards support
// For my merchant ID <XXXX>.
