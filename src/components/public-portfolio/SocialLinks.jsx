"use client";

import InstagramIcon from "@/components/svg/InstagramIcon";
import FacebookIcon from "@/components/svg/FacebookIcon";
import LinkedInIcon from "@/components/svg/LinkedInIcon";
import TwitterIcon from "../svg/TwitterIcon";
import YoutubeIcon from "../svg/YoutubeIcon";

const iconComponents = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  linkedin: LinkedInIcon,
  twitter: TwitterIcon,
  youtube: YoutubeIcon
};

export default function SocialLinks({ formData }) {
  // Build links array based on formData
  const links = [];

  if (formData?.instagram) {
    links.push({ platform: "instagram", url: formData.instagram });
  }

  if (formData?.links && formData.links.length > 0) {
    formData.links.forEach((link) => {
      let platform = "";
      if (link.url?.toLowerCase().includes("facebook")) {
        platform = "facebook";
      } else if (
        link.url?.toLowerCase().includes("twitter") ||
        link.url?.toLowerCase().includes("x.com") ||
        link.icon?.toLowerCase().includes("x_logo")
      ) {
        platform = "twitter";
      } else if (link.url?.toLowerCase().includes("linkedin")) {
        platform = "linkedin";
      }

      if (platform && link.url) {
        links.push({ platform, url: link.url });
      }
    });
  }

  return (
    <div className="text-graphite w-[91%] min-[1300px]:w-[98%] max-w-[1300px] mx-auto my-6 px-auto text-nowrap text-sm min-[1300px]:text-lg flex justify-center items-center ">
      {/* Visible only on lg screens */}
      <span className="hidden lg:inline font-apfel-grotezk-regular">
        My social media
      </span>
      <span className="hidden lg:flex items-center w-full  7xl:w-[1250px] lg:px-3  ">
        <span className="border-b-[0.5px] border-gray-400 w-full"></span>
      </span>

      {/* Icons */}
      <span className="flex justify-between lg:gap-4 gap-8 lg:justify-center">
        {links.length > 0 ? (
          links.map((link, index) => {
            const Icon = iconComponents[link.platform];
            return (
              Icon && (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="max-[1280px]:h-9 max-[1280px]:w-10 min-[1300px]:w-11 min-[1300px]:h-12 rounded-md flex items-center justify-center 
                             bg-[#f7f7f7] text-electric-blue 
                             hover:bg-electric-blue hover:text-white 
                             transition-colors duration-200 hover:scale-105"
                >
                  <Icon className="max-[1280px]:h-6 max-[1280px]:w-5 min-[1300px]:w-8 min-[1300px]:h-7" />
                </a>
              )
            );
          })
        ) : (
          // fallback: show all svg but disabled
          <>
            {Object.entries(iconComponents).map(([platform, Icon]) => (
              <span
                key={platform}
                className="w-12 h-12 rounded-md flex items-center justify-center 
                           bg-gray-150 text-black opacity-50"
              >
                <Icon className="max-[1280px]:h-6 max-[1280px]:w-5 min-[1300px]:w-8 min-[1300px]:h-7" />
              </span>
            ))}
          </>
        )}
      </span>
    </div>
  );
}
