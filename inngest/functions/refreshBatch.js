import { inngest } from "../client";

export const refreshBatch = inngest.createFunction(
  {
    id: "refresh-batch-instagram",
    name: "Refresh Instagram Batch of Users",
  },
  { event: "app/refresh.batch" },

  async ({ event, step }) => {
    const users = event.data.users;

    for (const user of users) {
      await step.sendEvent("refresh-single-user", {
        name: "app/refresh.single",
        data: {
          userId: user.userId,
          accessToken: user.instagramAccessToken,
        }
      });
    }

    return { processed: users.length };
  }
);
