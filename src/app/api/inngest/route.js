//src/app/api/inngest/route.js
export const runtime = "nodejs";

import { serve } from "inngest/next";
import { inngest } from "../../../../inngest/client.js";
import { refreshInstagramMedia } from "../../../../inngest/functions/refreshInstagramMedia.js";
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [refreshInstagramMedia],
});
