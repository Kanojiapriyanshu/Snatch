"use client";

import Image from "next/image";
import useFontSize from "@/hooks/useFontSize";

export default function DashboardClient({ onboarding, priceRange }) {
  const headingFont = useFontSize(20, 32);
  const subHeadingFont = useFontSize(12, 17);
  const sectionHeadingFont = useFontSize(14, 18);
  const bodyFont = useFontSize(11, 18);
  const pillFont = useFontSize(10, 16);

  if (!onboarding) {
    return <div className="text-center py-10">No onboarding data</div>;
  }

  const profileImageSrc =
    onboarding.profilePicture || "/assets/images/profile_defaultOnborad.svg";

  return (
    <div className="px-4 py-4 5xl:px-6 bg-white rounded-lg">
      {/* Industry Tags */}
      <div className="flex gap-0 justify-center items-center flex-wrap max-w-[380px] mx-auto">
        {(onboarding.industry?.length > 0
          ? onboarding.industry
          : ["Industry"]
        ).map((industry, idx) => (
          <span
            key={idx}
            className="bg-[#0037EB]/10 m-[3px] inline-block rounded border border-transparent py-1 px-2.5 text-graphite font-medium"
            style={{ fontSize: pillFont }}
          >
            {industry}
          </span>
        ))}
      </div>

      {/* Profile Picture */}
      <div className="w-20 h-20 mx-auto mt-5 object-contain rounded-full overflow-hidden">
        <Image
          className="object-cover w-full h-full"
          width={80}
          height={80}
          alt="profile_pic"
          src={profileImageSrc}
        />
      </div>

      {/* Name */}
      <h2
        className="text-graphite text-center mt-4 font-qimano"
        style={{ fontSize: headingFont }}
      >
        {(onboarding.firstName + " " + onboarding.lastName).trim() ||
          "Your Name"}
      </h2>

      {/* Username, Gender, Location */}
      <div
        className="flex justify-center items-center text-dark-grey tracking-tighter -mt-1"
        style={{ fontSize: subHeadingFont }}
      >
        <span>
          {`@${(onboarding.username || "").toLowerCase()}` || "@username"}
        </span>
        <Image
          width={10}
          height={10}
          src="/assets/icons/onboarding/Fullstop.svg"
          className="mx-1.5 w-1.5 h-1.5"
          alt="separator"
        />
        <span>{onboarding.gender || "Gender"}</span>
        <Image
          width={10}
          height={10}
          src="/assets/icons/onboarding/Fullstop.svg"
          className="mx-1.5 w-1.5 h-1.5"
          alt="separator"
        />
        <span>{onboarding.location || "Location"}</span>
      </div>

      {/* Languages */}
      <div
        className="flex flex-col sm:flex-row sm:items-start sm:gap-10 mt-6 font-apfel-grotezk-regular text-dark-grey max-w-[360px] 5xl:max-w-[420px] mx-auto"
        style={{ fontSize: bodyFont }}
      >
        
        <h5
          className="text-electric-blue font-apfel-grotezk-mittel whitespace-nowrap flex gap-2"
          style={{ fontSize: sectionHeadingFont }}
        >
          <Image
            width={24}
            height={20}
            src="/assets/icons/onboarding/Language.svg"
            alt="languages"
          />
          Languages
        </h5>

        <div style={{ fontSize: bodyFont }} className="flex flex-wrap items-center justify-center sm:justify-start text-graphite ">
          {onboarding.languages && onboarding.languages.length > 0 ? (
            onboarding.languages.map((lang, idx) => (
              <div key={idx} className="flex items-center">
                <span>{lang}</span>
                {idx < onboarding.languages.length - 1 && (
                  <Image
                    width={10}
                    height={10}
                    src="/assets/icons/onboarding/Fullstop.svg"
                    className="mx-1.5 w-1.5 h-1.5"
                    alt="separator"
                  />
                )}
              </div>
            ))
          ) : (
            <span>What languages do you know?</span>
          )}
        </div>
        
      </div>

      {/* Open To */}
      <div
        className="flex flex-col sm:flex-row sm:items-start sm:gap-16 mt-4 font-apfel-grotezk-regular text-dark-grey max-w-[360px] 5xl:max-w-[420px] mx-auto"
      >
        <h5
          className="text-electric-blue font-apfel-grotezk-mittel whitespace-nowrap flex gap-2"
          style={{ fontSize: sectionHeadingFont }}
        >
          <Image
            width={24}
            height={20}
            src="/assets/images/openTo.svg"
            alt="languages"
          />
          Open to
        </h5>
        <div style={{ fontSize: bodyFont }} className="flex flex-wrap items-center justify-center sm:justify-start text-graphite ">
          {onboarding.compensation && onboarding.compensation.length > 0 ? (
            onboarding.compensation.map((item, idx) => (
              <div key={idx} className="flex items-center">
                <span>{item}</span>
                {idx < onboarding.compensation.length - 1 && (
                  <Image
                    width={10}
                    height={10}
                    src="/assets/icons/onboarding/Fullstop.svg"
                    className="mx-1.5 w-1.5 h-1.5"
                    alt="separator"
                  />
                )}
              </div>
            ))
          ) : (
            <span>What comp methods are you open to?</span>
          )}
        </div>
      </div>

      {/* Price Range */}
      <div className="text-dark-grey px-10 flex flex-col justify-center items-center mt-2 3xl:mt-8">
        <h3 className="font-qimano text-graphite" style={{ fontSize: headingFont }}>
          {priceRange}
        </h3>
        <div style={{ fontSize: bodyFont }}>Value per content piece</div>
      </div>
    </div>
  );
}
