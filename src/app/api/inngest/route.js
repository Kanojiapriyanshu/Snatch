//src/app/api/inngest/route.js
import { serve } from "inngest/next";
import { inngest } from "../../../../inngest/client.mjs";
import { refreshInstagramMedia } from "../../../../inngest/functions/refreshInstagramMedia.mjs";
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [refreshInstagramMedia],
});
