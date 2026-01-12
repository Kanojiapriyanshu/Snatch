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

/* ------------------------------------------------
     2️⃣ Trial started (card authenticated)
     NOTE: This event may NOT always fire
  ------------------------------------------------ */
  if (event.event === "subscription.authenticated") {
    const sub = event.payload.subscription.entity;

    const updated = await User.findOneAndUpdate(
      { "subscription.subscriptionId": sub.id },
      {
        $set: {
          "subscription.plan": "trial",
          "subscription.isActive": true,
          "subscription.trialStartedAt": new Date(),
          "subscription.trialEndsAt": new Date(sub.current_end * 1000),
          "subscription.nextBillingDate": new Date(sub.current_end * 1000),
          "limits.generationLimit": 16,
          "limits.projectLimit": 12,
        },
      },
      { new: true }
    );

    if (!updated) {
      console.log("⚠️ No user found for trial start:", sub.id);
    }
  }

  /* ------------------------------------------------
     3️⃣ Trial over → PRO (PAYMENT SUCCESS)
     This is the MOST IMPORTANT event
  ------------------------------------------------ */
  if (  event.event === "subscription.charged" ||
    event.event === "invoice.paid") {
    const invoice = event.payload.invoice.entity;
    const subscriptionId = invoice.subscription_id;

    const updated = await User.findOneAndUpdate(
      { "subscription.subscriptionId": subscriptionId },
      {
        $set: {
          "subscription.plan": "pro",
          "subscription.isActive": true,
          "subscription.nextBillingDate": new Date(invoice.current_period_end * 1000),
          "limits.generationLimit": 16,
          "limits.projectLimit": 12,
        },
      },
      { new: true }
    );

    if (!updated) {
      console.log("⚠️ No user found for payment success:", subscriptionId);
    }
  }

  /* ------------------------------------------------
     4️⃣ Subscription cancelled (trial OR paid)
  ------------------------------------------------ */
  if (event.event === "subscription.cancelled") {
    const sub = event.payload.subscription.entity;

    const updated = await User.findOneAndUpdate(
      { "subscription.subscriptionId": sub.id },
      {
        $set: {
          "subscription.plan": "free",
          "subscription.isActive": false,
          "subscription.subscriptionId": null,
          "subscription.trialStartedAt": null,
          "subscription.trialEndsAt": null,
          "subscription.nextBillingDate": null,
          "limits.generationLimit": 10,
          "limits.projectLimit": 8,
        },
      },
      { new: true }
    );

    if (!updated) {
      console.log("⚠️ No user found for cancellation:", sub.id);
    }
  }

  /* ------------------------------------------------
     5️⃣ Payment failed (logging only)
  ------------------------------------------------ */
  if (event.event === "payment.failed") {
    console.log(
      "❌ Payment failed:",
      event.payload.payment?.entity?.id
    );
  }

  return new Response("OK", { status: 200 });
}