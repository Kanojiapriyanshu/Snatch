// /inngest/client.js
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "snatchsocial",       // name your app
  eventKey: process.env.INNGEST_EVENT_KEY || "huAQiRUE-kfDu2h-CyScUft5BfKKuMGOc10p0Qg10kVy6r89yaAovzPHJMUqraKa1ZHzNfWi6LxF9H5vKE3_cw",
  signingKey: process.env.INNGEST_SIGNING_KEY || "signkey-prod-f1f9254bb826c8fd3896017723dc99873c2649742b6f719a4ce66dc72cedd061",
});
