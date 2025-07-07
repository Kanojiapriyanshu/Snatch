"use client";

import Image from "next/image";

const socialIcons = {
  instagram: "/assets/images/insta.svg",
  facebook: "/assets/icons/facebook.svg",
  twitter: "/assets/images/X.svg",
  linkedin: "/assets/icons/linkedin.svg",
};

export default function SocialLinks({ formData }) {
  // Build links array based on formData
  const links = [];

  if (formData?.instagram) {
    links.push({ platform: "instagram", url: formData.instagram });
  }
  if (formData?.links && formData.links.length > 0) {
    formData.links.forEach(link => {
      let platform = '';
      if (link.url?.includes('facebook')) {
        platform = 'facebook';
      } else if (link.url?.includes('twitter') || link.icon?.includes('X.svg')) {
        platform = 'twitter';
      } else if (link.url?.includes('linkedin')) {
        platform = 'linkedin';
      }
      if (platform && link.url) {
        links.push({ platform, url: link.url });
      }
    });
  }

  return (
    <div className="text-graphite mt-4 text-nowrap text-sm lg:text-xl flex justify-center items-center ">
      {/* Visible only on lg screens */}
      <span className="hidden lg:inline ml-6 font-apfel-grotezk-regular">My social media</span>
      <span className="hidden lg:flex justify-center items-center w-[500%] lg:w-[1200px]">
        <span className="border-b-[0.5px] border-gray-400 mx-2 w-full"></span>
      </span>
      {/* Icons (visible on all screen sizes, justified between for mobile) */}
      <span className="flex max-w-[300px] justify-between gap-14 lg:ml-2 lg:gap-2 lg:justify-center">
        {links.length > 0 ? (
          links.map((link, index) => (
            socialIcons[link.platform] && (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-150 rounded flex items-center justify-center w-10 h-10"
              >
                <Image
                  src={socialIcons[link.platform]}
                  alt={link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                  width={30}
                  height={link.platform === 'twitter' ? 20 : 25}
                />
              </a>
            )
          ))
        ) : (
          // fallback: show all icons but disabled
          <>
            {Object.entries(socialIcons).map(([platform, icon], idx) => (
              <span key={platform} className="bg-gray-150 rounded flex items-center justify-center w-10 h-10 opacity-50">
                <Image
                  src={icon}
                  alt={platform.charAt(0).toUpperCase() + platform.slice(1)}
                  width={30}
                  height={platform === 'twitter' ? 20 : 25}
                />
              </span>
            ))}
          </>
        )}
      </span>
    </div>
  );
}