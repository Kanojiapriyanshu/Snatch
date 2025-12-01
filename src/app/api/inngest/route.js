//src/app/api/inngest/route.js
export const dynamic = 'force-dynamic'

import { serve } from "inngest/next";
import { inngest } from "../../../../inngest/client.js";
import { scheduleInstagramRefresh } from "../../../../inngest/functions/scheduleRefresh.js";
import { refreshBatch } from "../../../../inngest/functions/refreshBatch.js";
import { refreshSingle } from "../../../../inngest/functions/refreshSingle.js";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [scheduleInstagramRefresh, refreshBatch, refreshSingle],
});


