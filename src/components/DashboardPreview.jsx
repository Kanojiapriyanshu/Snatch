//ssr
import Image from "next/image";
import connectDb from "@/db/mongoose";
import OnboardingData from "@/models/onboarding.model";
import User from "@/models/user.model";

export const dynamic = "force-dynamic"; // always fetch fresh SSR data

export default async function DashboardPreview({ userId }) {
  await connectDb();

  if (!userId) return <div>User not found</div>;

  const user = await User.findOne({ userId });
  const onboarding = await OnboardingData.findOne({ userId });

  if (!onboarding) return <div>No onboarding data yet</div>;

  const story = Number(onboarding.story) || 0;
  const reels = Number(onboarding.reels) || 0;
  const post = Number(onboarding.post) || 0;

  const values = [story, reels, post].filter((v) => v > 0);
  const lowest = values.length ? Math.min(...values) : 0;
  const highest = values.length ? Math.max(...values) : 0;

  const formatNumber = (value) => {
    const num = Number(value);
    if (isNaN(num)) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  const priceRange =
    lowest === highest
      ? `₹ ${formatNumber(lowest)}`
      : `₹ ${formatNumber(lowest)} - ₹ ${formatNumber(highest)}`;

  const profileImageSrc = onboarding.profilePicture || "/assets/images/profile_defaultOnborad.svg";

  return (
    // <div className="h-[430px] 3xl:h-auto max-h-auto w-96 3xl:w-full">
    //   {/* Industry Tags */}
    //   <div className="flex gap-0 justify-center items-center flex-wrap max-w-[380px] mx-auto">
    //     {(onboarding.industry?.length > 0 ? onboarding.industry : ["Industry"]).map((industry, idx) => (
    //       <span
    //         key={idx}
    //         className="bg-dark/10 m-[3px] inline-block rounded border border-transparent py-1 px-2.5 text-sm text-graphite"
    //       >
    //         {industry}
    //       </span>
    //     ))}
    //   </div>

    //   {/* Profile Picture */}
    //   <div className="w-20 h-20 mx-auto mt-5 object-contain rounded-full overflow-hidden">
    //     <Image
    //       className="object-cover w-full h-full"
    //       width={80}
    //       height={80}
    //       alt="profile_pic"
    //       src={profileImageSrc}
    //     />
    //   </div>

    //   {/* Name */}
    //   <h2 className="text-graphite text-[28px] text-3xl text-center mt-4 font-qimano">
    //     {(onboarding.firstName + " " + onboarding.lastName).trim() || "Your Name"}
    //   </h2>

    //   {/* Username, Gender, Location */}
    //   <div className="flex justify-center items-center text-dark-grey">
    //     <h6>{`@${(onboarding.username || "").toLowerCase()}` || "@username"}</h6>
    //     <Image
    //       width={10}
    //       height={10}
    //       src="/assets/icons/onboarding/Fullstop.svg"
    //       className="mx-1.5 w-1.5 h-1.5"
    //       alt="separator"
    //     />
    //     <h6>{onboarding.gender || "Gender"}</h6>
    //     <Image
    //       width={10}
    //       height={10}
    //       src="/assets/icons/onboarding/Fullstop.svg"
    //       className="mx-1.5 w-1.5 h-1.5"
    //       alt="separator"
    //     />
    //     <h6>{onboarding.location || "Location"}</h6>
    //   </div>

    //   {/* Languages */}
    //   <div className="flex mx-auto gap-5 px-10 text-dark-grey mt-[20px] 3xl:mt-[40px] max-w-[500px] font-apfel-grotezk-regular">
    //     <Image width={24} height={20} src="/assets/icons/onboarding/Language.svg" alt="languages" />
    //     <h5 className="text-electric-blue -ml-1 font-apfel-grotezk-mittel text-md">Languages</h5>
    //     <div className="flex flex-wrap items-center gap-0 w-56 max-w-60">
    //       {onboarding.languages && onboarding.languages.length > 0 ? (
    //         onboarding.languages.map((lang, idx) => (
    //           <div key={idx} className="flex items-center gap-0 text-graphite text-sm">
    //             <span>{lang}</span>
    //             {idx < onboarding.languages.length - 1 && (
    //               <Image
    //                 width={10}
    //                 height={10}
    //                 src="/assets/icons/onboarding/Fullstop.svg"
    //                 className="mx-1.5 w-1.5 h-1.5"
    //                 alt="separator"
    //               />
    //             )}
    //           </div>
    //         ))
    //       ) : (
    //         <span>What Languages do you know?</span>
    //       )}
    //     </div>
    //   </div>

    //   {/* Compensation / Open To */}
    //   <div className="flex mx-auto gap-9 px-10 text-dark-grey mt-[20px] max-w-[500px] font-apfel-grotezk-regular text-md">
    //     <Image width={24} height={20} src="/assets/icons/onboarding/Language.svg" alt="compensation" />
    //     <h5 className="text-electric-blue -ml-5 font-apfel-grotezk-mittel">Open to</h5>
    //     <div className="flex flex-wrap items-center gap-0 text-sm">
    //       {onboarding.compensation && onboarding.compensation.length > 0 ? (
    //         onboarding.compensation.map((item, idx) => (
    //           <div key={idx} className="flex items-center gap-0 text-graphite">
    //             <span>{item}</span>
    //             {idx < onboarding.compensation.length - 1 && (
    //               <Image
    //                 width={10}
    //                 height={20}
    //                 src="/assets/icons/onboarding/Fullstop.svg"
    //                 className="mx-1.5 w-1.5 h-1.5"
    //                 alt="separator"
    //               />
    //             )}
    //           </div>
    //         ))
    //       ) : (
    //         <span>What comp methods are you open to?</span>
    //       )}
    //     </div>
    //   </div>

    //   {/* Price Range */}
    //   <div className="text-dark-grey px-10 flex flex-col justify-center items-center mt-2 3xl:mt-12">
    //     <h3 className="3xl:text-3xl text-xl font-qimano text-graphite">{priceRange}</h3>
    //     <div className="text-[12px] 3xl:text-lg">Value per content piece</div>
    //   </div>
    // </div>

<div className="px-4 py-4 bg-white rounded-lg">
  {/* Industry Tags */}
  <div className="flex gap-0 justify-center items-center flex-wrap max-w-[380px] mx-auto">
    {(onboarding.industry?.length > 0 ? onboarding.industry : ["Industry"]).map((industry, idx) => (
      <span
        key={idx}
        className="bg-dark/10 m-[3px] inline-block rounded border border-transparent py-1 px-2.5 text-sm text-graphite"
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
  <h2 className="text-graphite text-[28px] text-3xl text-center mt-4 font-qimano">
    {(onboarding.firstName + " " + onboarding.lastName).trim() || "Your Name"}
  </h2>

  {/* Username, Gender, Location */}
  <div className="flex justify-center items-center text-dark-grey mt-1 text-sm">
    <span>{`@${(onboarding.username || "").toLowerCase()}` || "@username"}</span>
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
<div className="flex flex-col sm:flex-row sm:items-center sm:gap-10 mt-6 font-apfel-grotezk-regular text-dark-grey max-w-[360px] mx-auto">
  <h5
    className={`text-electric-blue font-apfel-grotezk-mittel text-md whitespace-nowrap ${
      onboarding.languages && onboarding.languages.length > 3 ? "mb-5" : "mb-0"
    }`}
  >
    Languages
  </h5>
  <div className="flex flex-wrap items-center text-sm justify-center sm:justify-start text-graphite">
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
<div className="flex flex-col sm:flex-row sm:items-center sm:gap-[60px] mt-4 font-apfel-grotezk-regular text-dark-grey text-md max-w-[360px] mx-auto">
  <h5
    className={`text-electric-blue font-apfel-grotezk-mittel whitespace-nowrap ${
      onboarding.compensation && onboarding.compensation.length > 3
        ? "mb-5"
        : "mb-0"
    }`}
  >
    Open to
  </h5>
  <div className="flex flex-wrap items-center text-sm justify-center sm:justify-start text-graphite">
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
       <div className="text-dark-grey px-10 flex flex-col justify-center items-center mt-2 3xl:mt-12">
         <h3 className="3xl:text-3xl text-xl font-qimano text-graphite">{priceRange}</h3>
         <div className="text-[12px] 3xl:text-lg">Value per content piece</div>
       </div>
</div>

  );
}
