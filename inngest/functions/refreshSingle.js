import { inngest } from "../client.js";
import axios from "axios";

export const refreshSingle = inngest.createFunction(
  {
    id: "refresh-single-instagram-user",
    name: "Refresh One User Instagram Media",
  },
  { event: "app/refresh.single" },

  async ({ event }) => {
    const { userId, accessToken } = event.data;

    const { default: connectDb } = await import("../../src/db/mongoose.js");
    const { default: ProjectDraft } = await import("../../src/models/project.model.js");

    await connectDb();

    const draft = await ProjectDraft.findOne({ userId });
    if (!draft) {
      console.log(`⚠️ No draft for user ${userId}`);
      return;
    }

    const now = Date.now();
    const lastRefresh = draft.lastRefreshedAt?.getTime() || 0;

    // Skip refresh if within last 12 hours
    if (now - lastRefresh < 1000 * 60 * 60 * 12) {
      return;
    }

    const items = draft.instagramSelected;
    if (!items.length) return;

    // Parallelize IG API calls (limit concurrency)
    const LIMIT = 10;
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));

    const chunks = [];
    for (let i = 0; i < items.length; i += LIMIT) {
      chunks.push(items.slice(i, i + LIMIT));
    }

    let updated = [];

    for (const chunk of chunks) {
      const promises = chunk.map(async (instaItem) => {
        if (!instaItem.mediaId) return instaItem;

        const url =
          `https://graph.facebook.com/v21.0/${instaItem.mediaId}?fields=` +
          `id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,` +
          `like_count,comments_count,username,children{media_type,media_url,id}` +
          `&access_token=${accessToken}`;

        try {
          const res = await axios.get(url);
          const data = res.data;

          return {
            ...instaItem.toObject(),
            mediaLink: data.media_url || instaItem.mediaLink,
            name: data.media_type || instaItem.name,
            children: data.children?.data || [],
            lastRefreshedAt: new Date(),
          };
        } catch (err) {
          console.log("IG error", err.message);
          return instaItem;
        }
      });

      const result = await Promise.all(promises);
      updated.push(...result);

      await delay(400); // safety pause to avoid IG API throttling
    }

    draft.instagramSelected = updated;
    draft.lastRefreshedAt = new Date();
    await draft.save();

    return { userId, updatedCount: updated.length };
  }
);
