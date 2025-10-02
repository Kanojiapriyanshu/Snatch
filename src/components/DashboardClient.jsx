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
        className="flex justify-center items-center text-dark-grey -mt-1 text-sm 5xl:text-[100%]"
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
        <div style={{ fontSize: bodyFont }} className="flex sm:flex-row gap-5 5xl:gap-8 mt-6 font-apfel-grotezk-regular text-dark-grey max-w-[360px] mx-auto">
          {/* Label column */}
          <h5  style={{ fontSize: sectionHeadingFont }} className={`w-24 shrink-0 text-electric-blue font-apfel-grotezk-mittel text-[clamp(1rem,1vw+1rem,1rem)] flex gap-2 whitespace-nowrap ${
              onboarding.languages && onboarding.languages.length > 3 ? "mb-5" : "mb-0"
            }`}>
            <Image
              width={24}
              height={20}
              src="/assets/icons/onboarding/Language.svg"
              alt="languages"
            />
            Languages
          </h5>

          {/* Values column */}
          <div  className="flex flex-wrap items-center text-[clamp(1rem,1vw+1rem,1rem)] text-graphite ">
            {onboarding.languages?.length > 0 ? (
              onboarding.languages.map((lang, idx) => (
                <div key={idx} className="flex items-center ">
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
        <div className="flex sm:flex-row gap-4 mt-4 font-apfel-grotezk-regular text-dark-grey max-w-[360px] mx-auto">
          {/* Label column */}
          <h5 style={{ fontSize: sectionHeadingFont }}  className={`w-24 shrink-0 text-electric-blue font-apfel-grotezk-mittel text-[clamp(1rem,1vw+1rem,1rem)] flex gap-2 whitespace-nowrap ${
              onboarding.compensation && onboarding.compensation.length > 3 ? "mb-5" : "mb-0"
            }`}>
            <Image
              width={24}
              height={20}
              src="/assets/images/openTo.svg"
              alt="open to"
              className="w-4"
            />
            Open to
          </h5>

          {/* Values column */}
          <div className="flex flex-wrap items-center text-[clamp(1rem,1vw+1rem,1rem)] text-graphite">
            {onboarding.compensation?.length > 0 ? (
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
