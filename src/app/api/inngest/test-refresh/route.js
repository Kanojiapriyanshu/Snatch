//src/app/api/inngest/test-refresh/route.js
import { inngest } from "../../../../../inngest/client.mjs";

export async function GET() {

  await inngest.send({
    name: "app/refresh.all.instagram",   // 👈 MUST match your function event
    data: {
      triggeredAt: new Date().toISOString()
    }
  });

  return Response.json({ 
    message: "Instagram refresh job triggered!",
    event: "app/refresh.all.instagram"
  });
}




// import { inngest } from "@/inngest/client.mjs";

// export async function GET() {
//   await inngest.send({
//     name: "cron/refresh.all.instagram",
//     data: {},
//   });

//   return Response.json({ ok: true, message: "Manual refresh triggered." });
// }

// //src/app/api/inngest/test-refresh/route.js
// import { inngest } from "@/inngest/client";

// export async function GET() {
//   // This triggers your helloWorld function
//   await inngest.send({
//     name: "test/hello.world",
//     data: {
//       email: "triggered-from-api@example.com"
//     }
//   });

//   return Response.json({ message: "Event sent to Inngest!" });
// }