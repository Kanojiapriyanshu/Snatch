"use client";

import Image from "next/image";
import { useFormContext } from "@/app/onboarding/context";

const socialIcons = {
  instagram: "/assets/images/Insta.svg",
  facebook: "/assets/icons/facebook.svg",
  twitter: "/assets/images/X.svg",
  youtube: "/assets/icons/social/youtube.svg",
  tiktok: "/assets/icons/social/tiktok.svg",
  linkedin: "/assets/icons/linkedin.svg",
};

export default function SocialLinks() {
  const { formData } = useFormContext();

  const renderSocialLinks = () => {
    const links = [];

    // Add Instagram if present
    if (formData.instagram) {
      links.push({
        platform: "instagram",
        url: `{formData.instagram}`
      });
    }

    // Add other social links from the links array
    if (formData.links && formData.links.length > 0) {
      formData.links.forEach(link => {
        // Determine platform from URL or icon path
        let platform = '';
        if (link.url?.includes('facebook')) {
          platform = 'facebook';
        } else if (link.url?.includes('twitter') || link.icon?.includes('X.svg')) {
          platform = 'twitter';
        } else if (link.url?.includes('linkedin')) {
          platform = 'linkedin';
        }

        if (platform && link.url) {
          links.push({
            platform,
            url: link.url
          });
        }
      });
    }

    return (
      <div className="flex gap-4 justify-center items-center">
        {links.map((link, index) => (
          socialIcons[link.platform] && (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 rounded flex items-center justify-center w-10 h-10 hover:opacity-80 transition-opacity"
            >
              <Image
                src={socialIcons[link.platform]}
                alt={link.platform}
                width={30}
                height={25}
                className="object-contain"
              />
            </a>
          )
        ))}
      </div>
    );
  };

  return renderSocialLinks();
}