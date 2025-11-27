export async function generateMetadata({ params }) {
  const { username } = params;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
    "https://app.snatchsocial.com";

  return {
    title: `${username}'s Press Kit`,
    description: `${username}'s work, story, and reach, all in one place.`,
    openGraph: {
      title: `${username}'s Press Kit`,
      description: `${username}'s work, story, and reach, all in one place.`,
      url: `${baseUrl}/${username}/media-kit`,
      siteName: "SnatchSocial",
      images: [
        {
          url: `${baseUrl}/api/og/${username}`,
          width: 1200,
          height: 630,
          alt: `${username}'s Press Kit`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      images: [`${baseUrl}/api/og/${username}`],
    },
  };
}

export default function MediaKitLayout({ children }) {
  return <>{children}</>;
}
