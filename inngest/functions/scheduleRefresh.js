import { inngest } from "../client.js";

export const scheduleInstagramRefresh = inngest.createFunction(
  {
    id: "schedule-instagram-refresh",
    name: "Schedule Instagram Refresh (Daily)",
  },
  // { cron: "0 0 * * *" }, // Runs every 24 hours at midnight
  { cron: "*/30 * * * *" }, // Every 30 minutes for testing
  async ({ step }) => {
    const { default: connectDb } = await import("../../src/db/mongoose.js");
    const { default: User } = await import("../../src/models/user.model.js");

    await connectDb();

    const users = await User.find({
      instagramAccessToken: { $exists: true, $ne: null }
    }).lean();

    const BATCH_SIZE = 100;

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);

      // Fan-out event
      await step.sendEvent("run-refresh-batch", {
        name: "app/refresh.batch",
        data: { users: batch },
      });
    }

    return { batches: Math.ceil(users.length / BATCH_SIZE) };
  }
);
