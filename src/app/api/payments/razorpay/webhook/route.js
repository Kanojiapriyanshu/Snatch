// //src/app/api/payments/razorpay/webhook/route.js

import crypto from "crypto";
import connectDb from "@/db/mongoose";
import User from "@/models/user.model";

export async function POST(req) {
  await connectDb();

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_PROD_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(rawBody);

  console.log("🔔 Razorpay Event:", event.event);

  /* -------------------------------
     1️⃣ Card authenticated (trial starts)   //went from free to trial but does not update limits in jaini case
  -------------------------------- */
  if (event.event === "subscription.authenticated") {
    const sub = event.payload.subscription.entity;

    await User.findOneAndUpdate(
      { "subscription.subscriptionId": sub.id },
      {
        "subscription.plan": "trial",
        "subscription.isActive": true,
        "subscription.trialStartedAt": new Date(),
        "subscription.trialEndsAt": new Date(sub.current_end * 1000),
        "subscription.nextBillingDate": new Date(sub.current_end * 1000),
        // ✅ ADD PRO LIMITS FOR TRIAL USERS!
        limits: {
          generationLimit: 16,
          projectLimit: 12,
        },
      }
    );
  }

  /* -------------------------------
     2️⃣ Subscription charged (TRIAL OVER → PRO)
  -------------------------------- */
  if (
    event.event === "subscription.charged" ||
    event.event === "invoice.paid"
  ) {
    const sub =
      event.event === "subscription.charged"
        ? event.payload.subscription.entity
        : { id: event.payload.invoice.entity.subscription_id };

    await User.findOneAndUpdate(
      { "subscription.subscriptionId": sub.id },
      {
        "subscription.plan": "pro",
        "subscription.isActive": true,
        limits: {
          generationLimit: 16,
          projectLimit: 12,
        },
      }
    );
  }

  /* -------------------------------
     3️⃣ Subscription cancelled
     (during trial OR later)
  -------------------------------- */
  if (event.event === "subscription.cancelled") {
    const sub = event.payload.subscription.entity;

    await User.findOneAndUpdate(
      { "subscription.subscriptionId": sub.id },
      {
        "subscription.plan": "free",
        "subscription.isActive": false,
        "subscription.subscriptionId": null,
        "subscription.trialStartedAt": null,
        "subscription.trialEndsAt": null,
        "subscription.nextBillingDate": null,
        limits: {
          generationLimit: 10,
          projectLimit: 8,
        },
      }
    );
  }

  /* -------------------------------
     4️⃣ Payment failed (optional)
  -------------------------------- */
  if (event.event === "payment.failed") {
    console.log("❌ Payment failed:", event.payload.payment.entity.id);
  }

  return new Response("OK", { status: 200 });
}