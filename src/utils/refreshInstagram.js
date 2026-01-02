// // utils/refreshInstagram.js
import axios from "axios";
import connectDb from "@/db/mongoose";
import ProjectDraft from "@/models/project.model";
import User from "@/models/user.model";

export async function refreshInstagramMedia(userId) {
  try {
    console.log("🚀 Starting refreshInstagramMedia...");
    await connectDb();

    const user = await User.findOne({ userId });
    if (!user || !user.instagramAccessToken) {
      console.log(`⚠️ No Instagram token found for userId ${userId}`);
      return;
    }
    const accessToken = user.instagramAccessToken;

    // ✅ only one draft per user
    const draft = await ProjectDraft.findOne({ userId });
    if (!draft) {
      console.log(`⚠️ No draft found for userId ${userId}`);
      return;
    }

    const now = new Date();
    const lastRefresh = draft.lastRefreshedAt  || now;
    const hoursSince = (now - lastRefresh) / (1000 * 60 * 60);

    console.log("last refresh", lastRefresh)

    if (hoursSince < 24) {
      console.log(`⏭️ Draft ${draft._id} skipped (refreshed ${hoursSince.toFixed(1)}h ago)`);
      return;
    }

    console.log(`🔄 Refreshing draft ${draft._id} (last refresh ${hoursSince.toFixed(1)}h ago)`);

    // Refresh all Instagram items in this draft
    for (const instaItem of draft.instagramSelected) {
      if (!instaItem.mediaId) continue;

      const apiUrl =
        `https://graph.facebook.com/v21.0/${instaItem.mediaId}?` +
        `fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count,thumbnail_url,username,children{media_type,media_url,id}` +
        `&access_token=${accessToken}`;

      try {
        console.log(`🌐 Fetching fresh media for ${instaItem.mediaId}`);
        const response = await axios.get(apiUrl);
        const data = response.data;

        instaItem.mediaLink = data.media_url || instaItem.mediaLink;
        instaItem.name = data.media_type || "UNKNOWN";

        if (data.media_type === "CAROUSEL_ALBUM" && data.children?.data) {
          instaItem.children = data.children.data.map((child) => ({
            id: child.id,
            media_type: child.media_type,
            media_url: child.media_url,
          }));
        } else {
          instaItem.children = [];
        }

        instaItem.lastRefreshedAt = new Date();
        console.log(`✅ Refreshed mediaId ${instaItem.mediaId}`);
      } catch (err) {
        console.error(`❌ Error refreshing ${instaItem.mediaId}:`, err.response?.data || err.message);
      }
    }

    // Update draft-level refresh timestamp
    draft.lastRefreshedAt = now;
    draft.markModified("instagramSelected");

    try {
      await draft.save();
      console.log(`💾 Saved draft ${draft._id} after refresh`);
    } catch (saveErr) {
      console.error(`❌ Failed to save draft ${draft._id}:`, saveErr.message);
    }

    console.log("🎉 Refresh check completed.");
  } catch (error) {
    console.error("❌ Error in refreshInstagramMedia:", error);
  }
}
