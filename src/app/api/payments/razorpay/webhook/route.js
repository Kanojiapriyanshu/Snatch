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
     1️⃣ Card authenticated (trial starts)
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


// import User from "@/models/user.model";
// import connectDb from "@/db/mongoose";
// import crypto from "crypto";

// export async function POST(req) {
//   await connectDb();

//   const body = await req.text();
//   const signature = req.headers.get("x-razorpay-signature");
//   const devBypass = req.headers.get("x-dev-bypass");

//   if (devBypass !== "true") {
//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.Razorpay_Test_Webhook_Secret)
//     .update(body)
//     .digest("hex");

//   if (signature !== expectedSignature) {
//     return new Response("Invalid signature", { status: 400 });
//      }
//   } else {
//     console.log("⚠️ DEV MODE — Bypassing signature verification");
//   }


//   const event = JSON.parse(body);

//   console.log("🔔 Razorpay Webhook Event:", event.event);

//   /** -----------------------------------------
//    * 1️⃣ subscription.authenticated 
//    * User completed card verification → trial started
//    * ----------------------------------------- */
//   if (event.event === "subscription.authenticated") {
//     const sub = event.payload.subscription.entity;

//     await User.findOneAndUpdate(
//       { "subscription.subscriptionId": sub.id },
//       {
//         "subscription.plan": "trial",
//         "subscription.isActive": true,
//         "subscription.trialEndsAt": new Date(sub.current_end * 1000),
//         "subscription.nextBillingDate": new Date(sub.current_end * 1000),
//       }
//     );
//   }

//   /** -----------------------------------------
//    * 2️⃣ subscription.activated
//    * Razorpay marks subscription as active → still trial
//    * ----------------------------------------- */
//   if (event.event === "subscription.activated") {
//     const sub = event.payload.subscription.entity;

//     await User.findOneAndUpdate(
//       { "subscription.subscriptionId": sub.id },
//       {
//         "subscription.plan": "trial",
//         "subscription.isActive": true,
//         "subscription.nextBillingDate": new Date(sub.current_end * 1000),
//       }
//     );
//   }

//   /** -----------------------------------------
//    * 3️⃣ subscription.charged 
//    * Trial ended → user is charged → becomes PRO
//    * ----------------------------------------- */
//   if (event.event === "subscription.charged") {
//     const sub = event.payload.subscription.entity;

//     await User.findOneAndUpdate(
//       { "subscription.subscriptionId": sub.id },
//       {
//         "subscription.plan": "pro",
//         "subscription.isActive": true,
//         "subscription.nextBillingDate": new Date(sub.current_end * 1000),
//         limits: { generationLimit: 16, projectLimit: 12 }, // pro limits
//       }
//     );
//   }

//   /** -----------------------------------------
//    * 4️⃣ invoice.paid (backup for subscription.charged)
//    * Some Razorpay accounts send this instead!
//    * ----------------------------------------- */
//   if (event.event === "invoice.paid") {
//     const invoice = event.payload.invoice.entity;
//     const subId = invoice.subscription_id;

//     await User.findOneAndUpdate(
//       { "subscription.subscriptionId": subId },
//       {
//         "subscription.plan": "pro",
//         "subscription.isActive": true,
//       }
//     );
//   }

//   /** -----------------------------------------
//    * 5️⃣ subscription.cancelled
//    * User canceled / payment retries failed
//    * ----------------------------------------- */
//   if (event.event === "subscription.cancelled") {
//     const sub = event.payload.subscription.entity;

//     await User.findOneAndUpdate(
//       { "subscription.subscriptionId": sub.id },
//       {
//         "subscription.plan": "free",
//         "subscription.isActive": false,
//         "subscription.subscriptionId": null,
//         "subscription.nextBillingDate": null,
//         limits: { generationLimit: 10, projectLimit: 8 }, // free limits
//       }
//     );
//   }

//   /** -----------------------------------------
//    * 6️⃣ payment.failed (OPTIONAL)
//    * Notify user about failed charge
//    * ----------------------------------------- */
//   if (event.event === "payment.failed") {
//     const pay = event.payload.payment.entity;

//     console.log("❌ Payment failed:", pay.error_description);
//     // optional: email user or send notification
//   }

//   return new Response("OK", { status: 200 });
// }



