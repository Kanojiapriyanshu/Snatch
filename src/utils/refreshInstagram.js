// import axios from "axios";
// import connectDb from "@/db/mongoose";
// import ProjectDraft from "@/models/project.model";
// import User from "@/models/user.model";

// /**
//  * Refresh Instagram media for a given userId
//  * @param {string} userId - Clerk's userId
//  */
// export async function refreshInstagramMedia(userId) {
//   try {
//     console.log("🚀 Starting refreshInstagramMedia...");
//     await connectDb();

//     // 🔑 Get user + their token
//     const user = await User.findOne({ userId });
//     if (!user || !user.instagramAccessToken) {
//       console.log(`⚠️ No Instagram token found for userId ${userId}`);
//       return;
//     }

//     const accessToken = user.instagramAccessToken;

//     // 🎯 Find ALL project drafts for this user
//     const drafts = await ProjectDraft.find({ userId });
//     console.log(`📦 Found ${drafts.length} drafts for user ${userId}`);

//     if (drafts.length === 0) {
//       console.log("⚠️ No drafts found for this user.");
//       return;
//     }

//     for (const draft of drafts) {
//       console.log(
//         `👤 Processing draft ${draft._id} with ${draft.instagramSelected.length} IG items`
//       );

//       // ✅ Loop all IG media items
//       for (let i = 0; i < draft.instagramSelected.length; i++) {
//         const instaItem = draft.instagramSelected[i];
//         const mediaId = instaItem.mediaId;

//         if (!mediaId) continue;

//        const apiUrl = 
//   `https://graph.facebook.com/v21.0/${mediaId}?` +
//   `fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count,thumbnail_url,username&` +
//   `access_token=${accessToken}`;


//         try {
//           console.log(`🌐 Fetching fresh media for ${mediaId}`);
//           const response = await axios.get(apiUrl);

//           // Update fresh values
//           instaItem.mediaLink = response.data.media_url;
//           instaItem.children =
//             response.data.children?.data?.map((child) => ({
//               id: child.id,
//               media_type: child.media_type,
//               media_url: child.media_url,
//             })) || [];

//           console.log(`✅ Refreshed mediaId ${mediaId}`);
//         } catch (err) {
//           if (err.response) {
//             console.error(
//               `❌ Instagram API error for ${mediaId}:`,
//               err.response.data
//             );
//           } else {
//             console.error(`❌ Failed to update media ${mediaId}:`, err.message);
//           }
//         }
//       }

//       // Save updated draft
//       try {
//         await draft.save();
//         console.log(`💾 Saved updates for draft ${draft._id}`);
//       } catch (saveErr) {
//         console.error(
//           `❌ Failed to save draft ${draft._id}:`,
//           saveErr.message
//         );
//       }
//     }

//     console.log("🎉 All Instagram media URLs refreshed successfully.");
//   } catch (error) {
//     console.error("❌ Error in refreshInstagramMedia:", error);
//   }
// }

// utils/refreshInstagram.js
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

    const drafts = await ProjectDraft.find({ userId });
    console.log(`📦 Found ${drafts.length} drafts for user ${userId}`);
    if (drafts.length === 0) return;

    for (const draft of drafts) {
      console.log(
        `\n👤 Processing draft ${draft._id} with ${draft.instagramSelected.length} IG items`
      );

      let needsRefresh = false;

      // Check which items need refresh
      for (const instaItem of draft.instagramSelected) {
        const now = new Date();
        const lastRefreshedAt = instaItem.lastRefreshedAt
          ? new Date(instaItem.lastRefreshedAt)
          : instaItem.createdAt || now;

        const hoursSince = (now - lastRefreshedAt) / (1000 * 60 * 60);

        if (hoursSince >= 24) {
          console.log(`⏰ Item ${instaItem.mediaId} needs refresh (last refreshed ${hoursSince.toFixed(1)}h ago)`);
          needsRefresh = true;
        } else {
          console.log(`✅ Item ${instaItem.mediaId} is fresh (last refreshed ${hoursSince.toFixed(1)}h ago)`);
        }
      }

      if (!needsRefresh) {
        console.log(`⏭️ Skipping draft ${draft._id}, all items refreshed < 24h ago`);
        continue; // skip entire draft
      }

      // Refresh all items
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

          // Update basic info
          instaItem.mediaLink = data.media_url || instaItem.mediaLink;
         
          // Set media type as name for easier display
            if (data.media_type === "IMAGE") {
              instaItem.name = "IMAGE";
            } else if (data.media_type === "VIDEO") {
              instaItem.name = "VIDEO";
            } else if (data.media_type === "CAROUSEL_ALBUM") {
              instaItem.name = "CAROUSEL_ALBUM";
            } else {
              instaItem.name = data.media_type || "UNKNOWN";
            }

          // Update children if CAROUSEL_ALBUM
          if (data.media_type === "CAROUSEL_ALBUM" && data.children?.data) {
            instaItem.children = data.children.data.map((child) => ({
              id: child.id,
              media_type: child.media_type,
              media_url: child.media_url,
            }));
            console.log(`🔹 Updated ${instaItem.children.length} children for CAROUSEL_ALBUM ${instaItem.mediaId}:`);
            instaItem.children.forEach((child, idx) => {
              console.log(`   ${idx + 1}. id=${child.id}, media_type=${child.media_type}, media_url=${child.media_url}`);
            });
          } else {
            instaItem.children = [];
          }

          // Update lastRefreshedAt
          instaItem.lastRefreshedAt = new Date();

          console.log(`✅ Refreshed mediaId ${instaItem.mediaId}`);
        } catch (err) {
          if (err.response) {
            console.error(`❌ Instagram API error for ${instaItem.mediaId}:`, err.response.data);
          } else {
            console.error(`❌ Failed to update media ${instaItem.mediaId}:`, err.message);
          }
        }
      }

      // Save draft
      draft.markModified("instagramSelected");
      try {
        await draft.save();
        console.log(`💾 Saved updates for draft ${draft._id}`);
      } catch (saveErr) {
        console.error(`❌ Failed to save draft ${draft._id}:`, saveErr.message);
      }
    }

    console.log("🎉 Refresh check completed.");
  } catch (error) {
    console.error("❌ Error in refreshInstagramMedia:", error);
  }
}
