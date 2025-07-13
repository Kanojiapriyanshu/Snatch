"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue, useSpring } from "framer-motion"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { FormProvider } from "@/app/onboarding/context";
import { useFetchPortfolio, useInstagramData, useCheckScreenSize } from "@/utils/public-portfolio/portfolio";
import Header from "./Header";
import Image from "next/image" 
import PortfolioPublic from "./PortfolioPublic";
import Questionnaire from "./QuestionCard";
import AudienceCard from "./AudienceCard";
import SocialLinks from "./SocialLinks";


const useAnimatedNumber = (target) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 1.2 });
  const rounded = useTransform(springValue, (latest) => Math.floor(latest));

  useEffect(() => {
    if (target !== undefined && target !== null) {
      motionValue.set(target);
    }
  }, [target]);

  return rounded;
};

// Add isAdminView prop
const ProfileOverview = ({ ownerId, isAdminView }) => {
  const [isMounted, setIsMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const scrollY = useTransform(scrollYProgress, [0, 1], [0, 1000]);
  const containerRef = useRef(null);
  const pressKitRef = useRef(null);
  //const formData = useFetchPortfolio(ownerId);
  const { data: formData } = useFetchPortfolio(ownerId);
  const { data } = useInstagramData();

  const router = useRouter()
  const pathname = usePathname(); // e.g., "/public-portfolio/snatchsocial"
  const searchParams = useSearchParams();
  
  const isMobile = useCheckScreenSize();


  const reach = useAnimatedNumber(data?.reach);
  const followers = useAnimatedNumber(data?.followers);
  const posts = useAnimatedNumber(data?.posts);


// Always define motion values, but assign static values for mobile
const defaultBg = "rgb(75, 75, 75)";
const defaultHeight = "560px";

const headerBg = useTransform(scrollY, [0, 200], ["rgb( 30,30,30)", "rgb(80, 80, 80)"]);
const headerHeight = useTransform(scrollY, [0, 200], ["560px", "80px"]);

// If on mobile, override motion values with static values
const finalBg = isMobile ? defaultBg : headerBg;
const finalHeight = isMobile ? defaultHeight : headerHeight;

  const nameSize = useTransform(
    scrollY,
    [0, 200],
    isMobile ? [28, 28] : [88, 28] // Fixed size for mobile, animated for desktop
  );
  const contentOpacity = useTransform(scrollY, [0, 150], [1, 0])
  const headerOpacity = useTransform(scrollY, [0, 150], [0, 1])
  const profileImageScale = useTransform(scrollY, [0, 150], [1, 0.8])
  const profileImageOpacity = useTransform(scrollY, [0, 150], [1, 0])
  const myOpacity = useTransform(scrollY, [0, 150], [0, 1])
  // For the press kit section to stay below the header
  const pressKitMargin = useTransform(scrollY, [0, 200], ["40px", "270px"])
  const fontSizeStyle = useMotionTemplate`${nameSize}px`;
  
  // Always define useTransform, but use static values for mobile
  const visibility = useTransform(scrollY, [150, 151], isMobile ? ["visible", "visible"] : ["visible", "hidden"]);
  const opacity = useTransform(scrollY, [0, 150], isMobile ? [1, 1] : [1, 0]);
  const story = Number(formData?.story) || 0;
  const reel = Number(formData?.reels) || 0;
  const post = Number(formData?.post) || 0;
 
   // Find the lowest and highest values among story, reel, and post
  const values = [story, reel, post].filter((v) => v > 0);
  const lowest = values.length ? Math.min(...values) : 0;
  const highest = values.length ? Math.max(...values) : 0;

  function formatNumber(value) {
    const num = Number(value); // parse string/number safely
  
    if (isNaN(num)) return '0'; // if not a number, fallback to '0'
  
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  }
  
const priceRange = lowest === highest ? (
  <><span className="font-md">₹</span> {formatNumber(lowest)}</>) : (
  <><span className="font-md">₹</span> {formatNumber(lowest)}{' '}
  - <span className="font-thin">₹</span> {formatNumber(highest)}
  </>
);

  
  // Update the handleRequest function to handle both admin and public cases
  const handleRequest = () => {
  if (isAdminView) {
  // For admin view - copy portfolio link
  const parts = pathname.split("/");
  const username = parts[1];
  const portfolioUrl = `${window.location.origin}/${username}/media-kit`;
  
  try {
  navigator.clipboard.writeText(portfolioUrl);
  alert("Portfolio link copied to clipboard!");
  } catch (err) {
  console.error("Failed to copy link:", err);
  alert("Failed to copy link");
  }
  } else {
  // For public view - redirect to request popup
  const parts = pathname.split("/");
  const influencerUsername = parts[1];
  router.push(`/request-popup?username=${influencerUsername}`);
  }
  };

  // Tooltip text logic for compensation types
  const getCompensationTooltip = (item) => {
    switch (item) {
      case "Sponsorships":
        return "Influencers are paid a fixed amount for each piece of content they create.";
      case "Gifting":
        return "This involves compensating influencers with products or services instead of money.";
      case "Affiliate":
        return "Influencers promote a product or service and receive a commission for every sale made through a unique affiliate link they share.";
      case "Hosted":
        return "Influencers are invited to events or trips, often in exchange for creating and sharing content related to the experience.";
      case "Collaboration":
        return "Influencers sometimes collaborate with brands to create a product.";
      default:
        return "More info coming soon.";
    }
  };

  const [activeMobileTooltip, setActiveMobileTooltip] = useState(null);

  useLayoutEffect(() => {
    // Scroll to presskit if query param is present
    if (typeof window !== 'undefined' && pressKitRef.current) {
      const scrollTo = searchParams.get('scrollTo');
      if (scrollTo === 'presskit') {
        pressKitRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col w-full p-0 rounded-xl " ref={containerRef}>
    {/* Sticky Header (appears on scroll) */}
    <Header formData={formData} data={data} headerOpacity={headerOpacity} isAdminView={isAdminView} />

    {/* Main Content */}
    <motion.div
      className={`w-full text-white relative rounded-3xl overflow-visible z-10 ${
        isMobile ? "h-[560px] bg-neutral-800" : ""
      }`}
      style={
        isMobile
          ? {} // No inline styles for mobile (use CSS classes)
          : {
              backgroundColor: finalBg,
              height: finalHeight,
              position: "sticky",
              top: 0,
              zIndex: 10,
              // overflow: "hidden",
              visibility: isMobile ? "visible" : visibility,
              opacity: isMobile ? 0.2 : opacity,
            }
      }
    >
      <div className="container mx-auto mt- px-4 py-8 flex flex-col items-center">
        {/* Name and Location */}
        <motion.h1
          className="flex items-center gap-2 font-qimano text-6xl lg:text-[74.12px]"
          style={{ fontSize: fontSizeStyle  }}
        >
           {formData?.firstName
          ? formData.firstName.charAt(0).toUpperCase() + formData.firstName.slice(1)
            : ""}
          {" "}
          {formData?.lastName
            ? formData.lastName.charAt(0).toUpperCase() + formData.lastName.slice(1)
            : ""}
        </motion.h1>

        <motion.p className="text-gray-300 text-lg font-apfel-grotezk-regular mt-" style={{ opacity: contentOpacity }}>
          @{formData?.username} • {formData?.location}
        </motion.p>

        {/* Category Tags */}
        <motion.div className="flex flex-wrap justify-center gap-2 mt-2" style={{ opacity: contentOpacity }}>
        {formData?.industry?.length > 0 ? (
          formData.industry.map((item, index) => (
            <div key={index} className="flex items-center justify-start gap-1">
              <span className="bg-brown text-gray-200 px-3 py-1.5 rounded-md text-xs">
                {item}
              </span>
            </div>
          ))
        ) : (
          // Fallback industry tag
          <span className="bg-brown text-gray-200 px-3 py-1 rounded-md text-xs">
            Industry
          </span>
        )}
        </motion.div>
      </div>

      <div className="container mx-auto px-6 relative lg:mt-10 flex justify-center overflow-visible">
        <motion.div className="flex flex-col-reverse lg:flex-row justify-between w-80 lg:w-[1600px] lg:relative z-10 overflow-visible" style={{ opacity: isMobile? "1": contentOpacity }}>

          {/*1 Left Side - Pricing and Services */}
          <div className="w-[370px] pt-20 ml-2 hidden lg:block">
            <div className="flex gap-3  items-center mb-3">
              <h2 className="font-qimano text-3xl font-medium">
              {priceRange}
              </h2>

              <p className=" text-gray-500 font-apfel-grotezk-regular text-lg  ">Value per content piece</p>
            </div>

            <div className="border-b-[0.3px] border-r-2 border-[#F7EA5F] ">

            </div>

           
          {/* Services */}
{/* Services */}
<div className="flex flex-wrap text-sm mt-4 gap-3">
  {formData?.compensation?.length > 0 ? (
    formData.compensation.map((item, index) => (
      <div
        key={index}
        className="inline-flex items-center font-qimano text-xl relative"
      >
        {/* Text (not triggering tooltip) */}
        <span className="transition-colors duration-300">
          {item}
        </span>

        {/* Info icon and tooltip trigger zone */}
        <div className="relative group ml-1 mb-2">
          <img
            src="/assets/icons/i.svg"
            alt="info"
            className="w-4 h-4 cursor-pointer transition-colors duration-300 group-hover:brightness-0 group-hover:invert"
          />

          {/* Tooltip */}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-lime-yellow text-black text-sm px-3 py-2 rounded-md shadow-md max-w-[200px] w-max whitespace-normal text-left opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
            {item === "Sponsorships"
              ? "Influencers are paid a fixed amount for each piece of content they create."
              : item === "Gifting"
              ? "This involves compensating influencers with products or services instead of money."
              : item === "Affiliate"
              ? "Influencers promote a product or service and receive a commission for every sale made through a unique affiliate link they share."
              : item === "Hosted"
              ? "Influencers are invited to events or trips, often in exchange for creating and sharing content related to the experience."
              : item === "Collaboration"
              ? "Influencers sometimes collaborate with brands to create a product."
              : "More info coming soon."}
          </span>
        </div>

        {/* Separator */}
        {index !== formData.compensation.length - 1 && (
          <span className="text-gray-600 ml-[0.8rem] px-[0.5px] mr-[0.1rem] rounded-sm">|</span>
        )}
      </div>
    ))
  ) : (
    <div className="flex items-center justify-center">
      <span>Compensation</span>
    </div>
  )}
</div>

            {/* CTA Button */}
            <button className="bg-lime-yellow text-graphite font-outline text-semibold py-2 px-4 rounded mt-6 w-[370px] max-w-[370px] font-apfel-grotezk-regular" onClick={handleRequest}>
              {isAdminView ? "Copy Portfolio Link" : "Send request"}
            </button>
          </div>

          {/*2 Center - Profile Image desktop */}
<motion.div
  className="block relative left-[24%] mt-5 lg:mt-0 lg:left-1/3 transform -translate-x-1/3 -translate-y-3/4 top-[100%] lg:-top-5 lg:right-10 rounded-xl overflow-visible z-20"
  style={{
    scale: isMobile ? "0" : profileImageScale,
    opacity: isMobile ? "1" : profileImageOpacity,
    zIndex: 100,
    position: "absolute",
    bottom: "-20px",
  }}
>
  <div className="lg:absolute overflow-visible z-[9999]">
    

    <div className="absolute lg:translate-x-1/2 lg:translate-y-10 rounded-xl w-64 h-2/3 overflow-visible">
      <Image
        src={formData?.profilePicture || "/assets/images/profile_defaultOnborad.svg"}
        alt={`${formData?.firstName} ${formData?.lastName}`}
        width={320} // ← increased from 276
        height={360} // ← increased from 320
        className="object-cover lg:w-[320px] lg:h-[355px] w-66 h-80 relative z-[9999] rounded-xl right-6"
      />
    </div>
  </div>
</motion.div>
         {/* 3 Right Side - Stats */}
         <div className="w-full lg:w-1/2 flex flex-row lg:flex-col items-center lg:items-end justify-center lg:justify-normal mr-0 lg:mr-4 gap-6 pt-4 z-20">
  <div className="text-center lg:text-end">
    <h2 className="text-5xl font-medium font-qimano">
      <motion.span>{reach}</motion.span>
    </h2>
    <p className="text-sm text-white font-apfel-grotezk-regular">avg reach</p>
  </div>
  <div className="text-center lg:text-end">
    <h2 className="text-5xl font-medium font-qimano">
      <motion.span>{followers}</motion.span>
    </h2>
    <p className="text-sm text-white font-apfel-grotezk-regular">followers</p>
  </div>
  <div className="text-center lg:text-end">
    <h2 className="text-5xl font-medium font-qimano">
      <motion.span>{posts}</motion.span>
    </h2>
    <p className="text-sm text-white font-apfel-grotezk-regular">posts</p>
  </div>
</div>



        </motion.div>
      </div>
    </motion.div>


<div className="w-full pt-14 block lg:hidden overflow-x-hidden ">
  {/* Pricing */}
  <div className="flex flex-col items-center w-full mb-2">
    <div className="flex items-baseline gap-2">
      <span className="font-qimano text-[28px] font-normal text-black leading-tight">Rs 5k - 25k</span>
      <span className="text-gray-500 text-[16px] font-apfel-grotezk-regular font-normal ml-1">Value per content piece</span>
    </div>
  </div>
  {/* Divider */}
  <div className="border-b-[1.5px] border-[#C7D2FE] w-full my-2" />
  {/* Services: dynamic rendering for mobile */}
  <div className="flex flex-wrap items-center justify-center w-full text-black font-qimano text-[20px] gap-x-2 gap-y-1 mb-2">
    {formData?.compensation?.length > 0 ? (
      formData.compensation.map((item, index) => (
        <div key={index} className="inline-flex items-center relative">
          <span className="inline-flex items-center">{item}
            <img
              src='/assets/icons/i.svg'
              alt='info'
              className='w-4 h-4 ml-1 invert'
              style={{ filter: 'invert(1)' }}
              onClick={() => setActiveMobileTooltip(activeMobileTooltip === index ? null : index)}
            />
          </span>
          {/* Tooltip for mobile: show only if active */}
          {activeMobileTooltip === index && (
            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-lime-yellow text-black text-sm px-3 py-2 rounded-md shadow-md max-w-[90vw] w-max whitespace-normal break-words text-left z-50">
              {getCompensationTooltip(item)}
            </span>
          )}
          {/* Separator */}
          {index !== formData.compensation.length - 1 && (
            <span className="mx-1">|</span>
          )}
        </div>
      ))
    ) : (
      <span>Compensation</span>
    )}
  </div>
  {/* CTA Button */}
  <button
    className="w-full bg-[#F7EA5F] text-black font-apfel-grotezk-regular text-[22px] font-normal py-3 rounded mt-4 mb-2 text-center"
    onClick={handleRequest}
  >
    {isAdminView ? "Copy Portfolio Link" : "Send request"}
  </button>
</div>


    {/* Press Kit Section */}
    <motion.div
      className="w-full bg-white"
      style={{
        marginTop: isMobile ? 20 : pressKitMargin,
        position: "relative",
        zIndex: 5,
      }}
      ref={pressKitRef}
    >
      <div className="container mx-auto">
      <h2 className="text-5xl lg:text-7xl font-qimano text-[#0044FF] text-center mt-4 lg:mt-8 ml-0 mr-0 lg:ml-64 lg:mr-58 text-electric-blue">
  Press Kit
</h2>




        {/* Content Grid */}
        <PortfolioPublic />

        {/* social links */}
        <SocialLinks formData={formData} />



       
        <div className=" w-full mt-4 mx-auto lg:max-w-[1600px] max-w-[500px]">
        <Questionnaire name={formData?.firstName
          ? formData.firstName.charAt(0).toUpperCase() + formData.firstName.slice(1)
            : ""}/>
        </div>

      

        <div className="w-full mx-auto lg:max-w-[1300px] max-w-[500px] ">
        <AudienceCard />
        </div>

      </div>
    </motion.div>
  </div>
  )
}

export default ProfileOverview;