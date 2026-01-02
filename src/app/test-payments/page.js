//src/app/test-payments/page.js

"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function TestPayments() {
  const [userId, setUserId] = useState("user_test_123");
  const [planType, setPlanType] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [rzpLoaded, setRzpLoaded] = useState(false);

  const startSubscription = async () => {
    if (!rzpLoaded) {
      alert("Razorpay SDK not loaded yet");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/payments/subscriptions/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, planType }),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.subscriptionId) {
      alert("Failed to create subscription");
      return;
    }

    const options = {
      key: data.razorpayKey,
      subscription_id: data.subscriptionId,
      name: "SnatchSocial",
      description:
        planType === "monthly"
          ? "₹5 / month – 2 day free trial"
          : "₹9000 / year – 2 day free trial",
      handler: () => {
        alert("✅ Card verified! Trial started.");
      },
      prefill: {
        email: "user@example.com",
      },
      theme: { color: "#000000" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <>
      {/* Razorpay SDK */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRzpLoaded(true)}
      />

      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <h2 className="text-2xl font-bold text-center">
            Razorpay Subscription Test
          </h2>

          <div>
            <label className="block text-sm font-medium mb-1">User ID</label>
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Select Plan
            </label>
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            >
              {/* <option value="monthly">₹900 / month</option> */}
              <option value="annual">₹9000 / year</option>
               <option value="monthly">₹5 / month</option>
            </select>
          </div>

          <button
            onClick={startSubscription}
            disabled={loading || !rzpLoaded}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Starting..." : "Upgrade to Pro – Start Free Trial"}
          </button>

          <button
            onClick={async () => {
              await fetch("/api/payments/subscriptions/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
              });
              alert("Subscription cancelled");
            }}
            className="text-red-600 underline text-sm"
          >
            Cancel Subscription
          </button>

          <p className="text-xs text-gray-500 text-center">
            Card required · ₹0 charged today · Cancel anytime
          </p>
        </div>
      </div>
    </>
  );
}



// "use client";

// import { useState } from "react";

// export default function TestPayments() {
//   const [userId, setUserId] = useState("user_30g1SWscvkL8I1SHVS8TprDc3rD");

//   const createSubscription = async () => {
//     const res = await fetch("/api/payments/subscriptions/create", {
//       method: "POST",
//       body: JSON.stringify({
//         userId,
//         planType: "monthly",
//       }),
//     });

//     const data = await res.json();
//     console.log("Subscription:", data);

//     if (!data.subscriptionId) {
//       alert("Subscription creation failed");
//       return;
//     }

//     openRazorpayCheckout(data.subscriptionId, data.razorpayKey);
//   };

//   const openRazorpayCheckout = (subscriptionId, key) => {
//     const options = {
//       key,
//       subscription_id: subscriptionId,
//       name: "SnatchSocial",
//       description: "Subscribe to Pro Plan",
//       handler: function (response) {
//         console.log("PAYMENT SUCCESS:", response);
//         alert("Payment attempted — now you can test webhooks too!");
//       },
//       prefill: {
//         email: "test@example.com",
//         name: "Test User",
//       },
//       theme: { color: "#000000" },
//     };

//     const rzp = new window.Razorpay(options);
//     rzp.open();
//   };

//   return (
//     <div style={{ padding: 40 }}>
//       <h1>🔥 Razorpay LIVE Checkout Tester</h1>

//       <div style={{ marginTop: 20 }}>
//         <label>User ID: </label>
//         <input
//           style={{ border: "1px solid #ccc", padding: 8, width: 400 }}
//           value={userId}
//           onChange={(e) => setUserId(e.target.value)}
//         />
//       </div>

//       <div style={{ marginTop: 20 }}>
//         <button
//           onClick={createSubscription}
//           style={{
//             padding: "12px 20px",
//             background: "black",
//             color: "white",
//             borderRadius: 6,
//           }}
//         >
//           🚀 Start Test Subscription (Open Checkout)
//         </button>
//       </div>

//       <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
//     </div>
//   );
// }
