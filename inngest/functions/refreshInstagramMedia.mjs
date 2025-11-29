// /inngest/functions/refreshInstagramMedia.mjs
import { inngest } from "../client.mjs";
import axios from "axios";

export const refreshInstagramMedia = inngest.createFunction(
  {
    id: "refresh-all-instagram-media",
    name: "Refresh All Instagram Media",
  },
  {
    event: "app/refresh.all.instagram",
     // ⭐ Adds cron job automatically
    cron: "*/7 * * * *", // every 7 minute (for testing)
  },

  async ({ step }) => {
    console.log("🚀 Starting global Instagram refresh job...");

    const { default: connectDb } = await import("../../src/db/mongoose.js");
    const { default: ProjectDraft } = await import("../../src/models/project.model.js");
    const { default: User } = await import("../../src/models/user.model.js");

    await step.run("connect-db", async () => connectDb());

    // 1) Fetch all users who have IG tokens
    const users = await step.run("fetch-users", async () =>
      User.find({
        instagramAccessToken: { $exists: true, $ne: null },
      })
    );

    console.log(`👥 Found ${users.length} users.`);

    // Loop through each user
    for (const user of users) {
      const userId = user.userId;
      const accessToken = user.instagramAccessToken;

      console.log(`\n---- Refreshing user ${userId} ----`);

      const draft = await ProjectDraft.findOne({ userId });
      if (!draft) {
        console.log(`⚠️ No project draft found for ${userId}`);
        continue;
      }

      const now = new Date();
      const lastRefresh = draft.lastRefreshedAt || now;

      const secondsSince = (now - lastRefresh) / 1000;

      if (secondsSince < 40) {
        console.log(`⏭️ Skipping ${userId}, refreshed ${secondsSince.toFixed(1)} sec ago`);
        continue;
      }


      // const hoursSince = (now - lastRefresh) / (1000 * 60 * 60);

      // // Skip if refreshed within last 24h
      // if (hoursSince < 24) {
      //   console.log(`⏭️ Skipping ${userId}, refreshed ${hoursSince.toFixed(1)}h ago`);
      //   continue;
      // }

      // ----------------------------------------------------
      // ⭐ FIXED SECTION: Replace entire `instagramSelected` array
      // ----------------------------------------------------
      const updatedArray = [];

      for (const instaItem of draft.instagramSelected) {
        if (!instaItem.mediaId) {
          updatedArray.push(instaItem); // keep same
          continue;
        }

        const apiUrl =
          `https://graph.facebook.com/v21.0/${instaItem.mediaId}?` +
          `fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,` +
          `like_count,comments_count,username,children{media_type,media_url,id}` +
          `&access_token=${accessToken}`;

        const updatedItem = await step.run(
          `refresh-${userId}-${instaItem.mediaId}`,
          async () => {
            try {
              const res = await axios.get(apiUrl);
              const data = res.data;

              return {
                ...instaItem.toObject(),
                mediaLink: data.media_url || instaItem.mediaLink,
                name: data.media_type || instaItem.name,
                children:
                  data.media_type === "CAROUSEL_ALBUM" && data.children?.data
                    ? data.children.data
                    : [],
                lastRefreshedAt: new Date(),
              };
            } catch (err) {
              console.error(
                `❌ Error refreshing ${instaItem.mediaId}:`,
                err.response?.data || err.message
              );

              // Return the original item if failed
              return instaItem.toObject();
            }
          }
        );

        updatedArray.push(updatedItem);
      }

      // Save the fully replaced array
      await step.run(`save-${userId}`, async () => {
        draft.instagramSelected = updatedArray; // replace whole array
        draft.lastRefreshedAt = now;
        await draft.save(); // guaranteed detection
      });

      console.log(`✅ Done refreshing ${userId}`);
    }

    return { success: true };
  }
);



// // // /inngest/functions/refreshInstagramMedia.mjs
// import { inngest } from "../client.mjs";
// import axios from "axios";

// export const refreshInstagramMedia = inngest.createFunction(
//   {
//     id: "refresh-all-instagram-media",
//     name: "Refresh All Instagram Media",
//   },
//   {
//       event: "app/refresh.all.instagram",   // 👈 This is the ONLY correct trigger format in v3+
//   },

//   async ({ event, step }) => {
//     console.log("🚀 Starting global Instagram refresh job...");

//     const { default: connectDb } = await import("../../src/db/mongoose.js");
//     const { default: ProjectDraft } = await import("../../src/models/project.model.js");
//     const { default: User } = await import("../../src/models/user.model.js");

//     await step.run("connect-db", async () => connectDb());

//     const users = await step.run("fetch-users", async () =>
//       User.find({
//         instagramAccessToken: { $exists: true, $ne: null },
//       })
//     );

//     console.log(`👥 Found ${users.length} users.`);

//     for (const user of users) {
//       const userId = user.userId;
//       const accessToken = user.instagramAccessToken;

//       console.log(`\n---- Refreshing user ${userId} ----`);

//       const draft = await ProjectDraft.findOne({ userId });
//       if (!draft) {
//         console.log(`⚠️ No draft for ${userId}`);
//         continue;
//       }

//       const now = new Date();
//       const lastRefresh = draft.lastRefreshedAt || now;
//       const hoursSince = (now - lastRefresh) / (1000 * 60 * 60);

//       if (hoursSince < 24) {
//         console.log(`⏭️ Skipping ${userId}: refreshed ${hoursSince.toFixed(1)}h ago`);
//         continue;
//       }

//       for (const instaItem of draft.instagramSelected) {
//         if (!instaItem.mediaId) continue;

//         const apiUrl =
//           `https://graph.facebook.com/v21.0/${instaItem.mediaId}?` +
//           `fields=id,caption,media_type,media_url,permalink,timestamp,` +
//           `like_count,comments_count,thumbnail_url,username,children{media_type,media_url,id}` +
//           `&access_token=${accessToken}`;

//         await step.run(`refresh-${userId}-${instaItem.mediaId}`, async () => {
//           try {
//             const res = await axios.get(apiUrl);
//             const data = res.data;

//             instaItem.mediaLink = data.media_url || instaItem.mediaLink;
//             instaItem.name = data.media_type || "UNKNOWN";

//             if (data.media_type === "CAROUSEL_ALBUM" && data.children?.data) {
//               instaItem.children = data.children.data;
//             } else {
//               instaItem.children = [];
//             }

//             instaItem.lastRefreshedAt = new Date();
//           } catch (err) {
//             console.error(`❌ Error refreshing ${instaItem.mediaId}:`, err.response?.data || err.message);
//           }
//         });
//       }
//        //are we putting refreshed media links in our db? in projectdraft instagramSelected media links
//       await step.run(`save-${userId}`, async () => {
//         draft.lastRefreshedAt = now;
//         draft.markModified("instagramSelected");
//         await draft.save();
//       });

//       console.log(`✅ Done refreshing ${userId}`);
//     }

//     return { success: true };
//   }
// );





// // /inngest/functions/refreshInstagramMedia.mjs
// import { inngest } from "../client.mjs";
// import axios from "axios";

// export const refreshInstagramMedia = inngest.createFunction(
//   { id: "refresh-all-instagram-media" },

//   //{ event: "cron/refresh.all.instagram" },
//   { event: "app/refresh.all.instagram" },


//   async ({ step }) => {
//     console.log("🚀 Starting global Instagram refresh job...");

//     // Lazy-load DB and models here to avoid import-time side effects
//     const { default: connectDb } = await import("../../src/db/mongoose.js");
//     const { default: ProjectDraft } = await import("../../src/models/project.model.js");
//     const { default: User } = await import("../../src/models/user.model.js");

//     // 1️⃣ Connect DB
//     await step.run("connect-db", async () => connectDb());

//     // 2️⃣ Fetch all IG users
//     const users = await step.run("fetch-users", async () => {
//       return User.find({
//         instagramAccessToken: { $exists: true, $ne: null }
//       });
//     });

//     console.log(`👥 Found ${users.length} users.`);

//     for (const user of users) {
//       const userId = user.userId;
//       const accessToken = user.instagramAccessToken;

//       console.log(`\n---- Refreshing user ${userId} ----`);

//       const draft = await ProjectDraft.findOne({ userId });
//       if (!draft) {
//         console.log(`⚠️ No draft for ${userId}`);
//         continue;
//       }

//       const now = new Date();
//       const lastRefresh = draft.lastRefreshedAt || now;
//       const hoursSince = (now - lastRefresh) / (1000 * 60 * 60);

//       if (hoursSince < 24) {
//         console.log(`⏭️ Skipping ${userId}: refreshed ${hoursSince.toFixed(1)}h ago`);
//         continue;
//       }

//       // Refresh all ig items
//       for (const instaItem of draft.instagramSelected) {
//         if (!instaItem.mediaId) continue;

//         const apiUrl =
//           `https://graph.facebook.com/v21.0/${instaItem.mediaId}?` +
//           `fields=id,caption,media_type,media_url,permalink,timestamp,` +
//           `like_count,comments_count,thumbnail_url,username,children{media_type,media_url,id}` +
//           `&access_token=${accessToken}`;

//         await step.run(`refresh-${userId}-${instaItem.mediaId}`, async () => {
//           try {
//             const res = await axios.get(apiUrl);
//             const data = res.data;

//             instaItem.mediaLink = data.media_url || instaItem.mediaLink;
//             instaItem.name = data.media_type || "UNKNOWN";

//             if (data.media_type === "CAROUSEL_ALBUM" && data.children?.data) {
//               instaItem.children = data.children.data;
//             } else {
//               instaItem.children = [];
//             }

//             instaItem.lastRefreshedAt = new Date();
//           } catch (err) {
//             console.error(`❌ Error refreshing ${instaItem.mediaId}:`, err.response?.data || err.message);
//           }
//         });
//       }

//       // Save draft
//       await step.run(`save-${userId}`, async () => {
//         draft.lastRefreshedAt = now;
//         draft.markModified("instagramSelected");
//         await draft.save();
//       });

//       console.log(`✅ Done refreshing ${userId}`);
//     }

//     return { success: true };
//   }
// );
