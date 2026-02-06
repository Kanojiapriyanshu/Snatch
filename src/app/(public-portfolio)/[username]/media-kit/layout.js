// // src/app/(public-portfolio)/[username]/media-kit/layout.js
import connectDb from "@/db/mongoose";
import User from "@/models/user.model";
import Image from "next/image";
import Link from "next/link";
import BrandingGate from "@/components/public-portfolio/BrandingGate";

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

async function getUserPlan(username) {
  await connectDb();

  const user = await User.findOne(
    { instagramUsername: username },
    { "subscription.plan": 1 }
  ).lean();

  return user?.subscription?.plan ?? "free";
}

export default async function MediaKitLayout({ children, params }) {
  const plan = await getUserPlan(params.username);
  const showBranding = plan === "free";

  return (
    <>
      {children}
      {/* {showBranding && (
        <Link
          href="https://snatchsocial.com"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-9 right-6 z-50"
        >
          <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-md shadow-lg
                          flex gap-2 items-center justify-center
                          hover:scale-[1.03] transition-transform cursor-pointer">
            <div className="text-graphite font-apfel-grotezk-mittel font-medium text-[15px] flex gap-1 items-center">
              Built on
              <Image
                src="/assets/images/snatch-white.svg"
                alt="Built on SNATCH"
                width={56}
                height={56}
              />
            </div>
          </div>
        </Link>
      )} */}
      {showBranding && (
        <BrandingGate>
          <Link
            href="https://snatchsocial.com"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-2 lg:bottom-3 right-1 lg:right-3 z-50 shadow-lg"
          >
            <div className="bg-white/80 backdrop-blur-md px-2 py-2 rounded-md
                            flex gap-2 items-center justify-center
                            hover:scale-[1.03] transition-transform cursor-pointer  ">
              <div className="text-graphite font-apfel-grotezk-mittel font-medium max-md:text-[14px] lg:text-[16px] flex gap-1 items-center">
                Built on
                <Image
                  src="/assets/images/snatch-white.svg"
                  alt="Built on SNATCH"
                  width={56}
                  height={56}
                />
              </div>
            </div>
          </Link>
        </BrandingGate>
      )}
    </>
  );
}
