// //(public-portfolio)/[username]/media-kit/layout.js
// import { Metadata } from "next";
// import OnboardingData from "@/models/onboarding.model";
// import connectDb from "@/db/mongoose";

// export async function generateMetadata({ params }) {
//   const { username } = params;
//   await connectDb();

//   // Fetch user data
//   const user = await OnboardingData.findOne({ username }).lean();

//   // Default fallback in case user not found
//   if (!user) {
//     return {
//       title: "Media Kit | SnatchSocial",
//       description: "Discover creator media kits on SnatchSocial.",
//       openGraph: {
//         title: "Media Kit | SnatchSocial",
//         description: "Discover creator media kits on SnatchSocial.",
//         url: `https://app.snatchsocial.com/${username}/media-kit`,
//         images: [
//           {
//             url: "https://app.snatchsocial.com/default-thumbnail.jpg",
//             width: 1200,
//             height: 630,
//             alt: "SnatchSocial Media Kit",
//           },
//         ],
//       },
//     };
//   }

//   // Construct dynamic Open Graph metadata
//   return {
//     title: `${user.name || username} | Media Kit`,
//     description: user.bio || "Explore this creator’s media kit on SnatchSocial.",
//     openGraph: {
//       title: `${user.name || username} | Media Kit`,
//       description: user.bio || "Explore this creator’s media kit on SnatchSocial.",
//       url: `https://app.snatchsocial.com/${username}/media-kit`,
//       siteName: "SnatchSocial",
//       images: [
//         {
//           url:
//             user.profilePicture ||
//             "https://app.snatchsocial.com/default-thumbnail.jpg",
//           width: 1200,
//           height: 630,
//           alt: `${user.name || username}'s Media Kit`,
//         },
//       ],
//       type: "website",
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: `${user.name || username} | Media Kit`,
//       description: user.bio || "Explore this creator’s media kit on SnatchSocial.",
//       images: [
//         user.profilePicture ||
//           "https://app.snatchsocial.com/default-thumbnail.jpg",
//       ],
//     },
//   };
// }

// export default function MediaKitLayout({ children }) {
//   return <>{children}</>;
// }


//(public-portfolio)/[username]/media-kit/layout.js
import { Metadata } from "next";
export async function generateMetadata({ params }) {
  const { username } = params;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
    "https://app.snatchsocial.com";

  try {
    const res = await fetch(`${baseUrl}/api/public-portfolio/userinfo?username=${username}`, {
      cache: "no-store",
    });
    const data = await res.json();
    const user = data?.data;

    if (!user) throw new Error("No user found");

    return {
      title: `${user.firstName || username} | Media Kit`,
      description: user.bio || "Explore this creator’s media kit on SnatchSocial.",
      openGraph: {
        title: `${user.firstName || username} | Media Kit`,
        description: user.bio || "Explore this creator’s media kit on SnatchSocial.",
        url: `${baseUrl}/${username}/media-kit`,
        siteName: "SnatchSocial",
        images: [
          {
            url: user.profilePicture || `${baseUrl}/default-thumbnail.jpg`,
            width: 1200,
            height: 630,
            alt: `${user.firstName || username}'s Media Kit`,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${user.firstName || username} | Media Kit`,
        description: user.bio || "Explore this creator’s media kit on SnatchSocial.",
        images: [user.profilePicture || `${baseUrl}/default-thumbnail.jpg`],
      },
    };
  } catch (err) {
    return {
      title: "Media Kit | SnatchSocial",
      description: "Discover creator media kits on SnatchSocial.",
      openGraph: {
        title: "Media Kit | SnatchSocial",
        description: "Discover creator media kits on SnatchSocial.",
        url: `${baseUrl}/${username}/media-kit`,
        images: [
          {
            url: `${baseUrl}/default-thumbnail.jpg`,
            width: 1200,
            height: 630,
            alt: "SnatchSocial Media Kit",
          },
        ],
      },
    };
  }
}


export default function MediaKitLayout({ children }) {
  return <>{children}</>;
}
