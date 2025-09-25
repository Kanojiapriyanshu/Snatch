"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue, useSpring, AnimatePresence } from "framer-motion"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
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

// Updated Skeleton component with exact same dimensions and positioning as image
const ProfileImageSkeleton = () => (
  <div className="object-cover lg:w-[320px] lg:h-[355px] w-66 h-80 relative z-[9999] rounded-xl right-6 bg-gray-300 animate-pulse" />
);

// Add isAdminView prop
const ProfileOverview = ({ ownerId, isAdminView, portfolio }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isContainerVisible, setIsContainerVisible] = useState(true);
  
  const { scrollYProgress } = useScroll();
  const scrollY = useTransform(scrollYProgress, [0, 1], [0, 1000]);
  const containerRef = useRef(null);
  const pressKitRef = useRef(null);
  const mainContainerRef = useRef(null);
  const [igData, setIgData] = useState(null);

   // Load from sessionStorage once
  useEffect(() => {
    const storedInstagram = sessionStorage.getItem("instagramData");
    if (storedInstagram) {
      setIgData(JSON.parse(storedInstagram));
    }
  }, []);

    // if portfolio is passed, use it; otherwise fallback to hook
  const { data: fetchedData } = useFetchPortfolio(ownerId, {
    enabled: !portfolio,
  });
  const formData = portfolio || fetchedData;
  
  // Only fetch if no prefetched data
  const { data: fetchedInstagramData } = useInstagramData(ownerId, {
    enabled: !igData,
  });

  // Update state if fetched data arrives later
  useEffect(() => {
    if (!igData && fetchedInstagramData) {
      setIgData(fetchedInstagramData);
    }
  }, [fetchedInstagramData, igData]);
   

  const [showGoBackButton, setShowGoBackButton] = useState(false);

  const router = useRouter()
  const pathname = usePathname(); // e.g., "/public-portfolio/snatchsocial"
  const searchParams = useSearchParams();
  
  const isMobile = useCheckScreenSize();

  const reach     = useAnimatedNumber(Number(igData?.reach) || 0);
  const followers = useAnimatedNumber(Number(igData?.followers_count) || 0);
  const posts     = useAnimatedNumber(Number(igData?.media_count) || 0);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
      
      // Check if main container is visible
      if (mainContainerRef.current) {
        const rect = mainContainerRef.current.getBoundingClientRect();
        const isVisible = rect.bottom > 200; // Container is considered visible if bottom is more than 200px from top
        setIsContainerVisible(isVisible);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation variants for sequential loading
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const leftSectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const rightSectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const statsVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

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
  
  // FIXED: Use same scroll trigger for all header elements to prevent glitching
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 1])
  
  const profileImageScale = useTransform(scrollY, [0, 150], [1, 0.8])
  const profileImageOpacity = useTransform(scrollY, [0, 150], [1, 0])
  const myOpacity = useTransform(scrollY, [0, 150], [0, 1])
  
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
    <div className="flex flex-col w-full p-0 rounded-xl" ref={containerRef}>
    {/* Sticky Header (appears on scroll) */}
    <Header 
      formData={formData} 
      data={igData} 
      headerOpacity={headerOpacity} 
      isAdminView={isAdminView}
      showGoBackButton={!isScrolled && isAdminView} // Only show when not scrolled and is admin view
      showHeaderButton={!isContainerVisible} // Only show when container is not visible
      reach={reach}
      followers={followers}
      posts={posts}
    />

    {/* Main Content Container - Now using normal flow */}
    <div className="w-full relative">
      {/* Main Hero Section */}
      <motion.div
        ref={mainContainerRef}
        className={`w-[97.9%] text-white relative rounded-3xl overflow-visible z-10 ${
          isMobile ? "h-[560px] bg-neutral-800" : ""
        }`}
        style={
          isMobile
            ? {} // No inline styles for mobile (use CSS classes)
            : {
                backgroundColor: finalBg,
                height: finalHeight,
                position: "fixed",
                top: 10,
                zIndex: 10,
                visibility: isMobile ? "visible" : visibility,
                opacity: isMobile ? 1 : opacity,
              }
        }
      >

      {isAdminView && !isScrolled && (
        <button
          onClick={() => router.push('/profile')}
          className="absolute top-7 left-4 flex items-center gap-2 text-sm font-medium text-gray-200 hover:text-white transition"
        >
          {/* Left Arrow Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>

          {/* Text */}
          <span>Go Back</span>
        </button>
      )}

        <motion.div 
          className="container mx-auto mt- px-4 py-8 flex flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Name and Location */}
          <motion.h1
            className="flex items-center gap-2 font-qimano text-6xl lg:text-[74.12px]"
            style={{ fontSize: fontSizeStyle  }}
            variants={itemVariants}
          >
             {formData?.firstName
            ? formData.firstName.charAt(0).toUpperCase() + formData.firstName.slice(1)
              : ""}
            {" "}
            {formData?.lastName
              ? formData.lastName.charAt(0).toUpperCase() + formData.lastName.slice(1)
              : ""}
          </motion.h1>

          <motion.p 
            className="text-gray-300 text-lg font-apfel-grotezk-regular mt-" 
            style={{ opacity: contentOpacity }}
            variants={itemVariants}
          >
            @{formData?.username} • {formData?.location}
          </motion.p>

          {/* Category Tags */}
          <motion.div 
            className="flex flex-wrap justify-center gap-2 mt-2" 
            style={{ opacity: contentOpacity }}
            variants={itemVariants}
          >
          {formData?.industry?.length > 0 ? (
            formData.industry.slice(0, 3).map((item, index) => (
              <motion.div 
                key={index} 
                className="flex items-center justify-start gap-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
              >
                <span className="bg-brown text-gray-200 px-3 py-1.5 rounded-md text-xs">
                  {item}
                </span>
              </motion.div>
            ))
          ) : (
            // Fallback industry tag
            <span className="bg-brown text-gray-200 px-3 py-1 rounded-md text-xs">
              Industry
            </span>
          )}
          </motion.div>
        </motion.div>

        <div className="container mx-auto px-6 relative lg:mt-10 flex justify-center overflow-visible">
          <motion.div className="flex flex-col-reverse lg:flex-row justify-between w-80 lg:w-[1600px] lg:relative z-10 overflow-visible" style={{ opacity: isMobile? "1": contentOpacity }}>

            {/*1 Left Side - Pricing and Services */}
            <motion.div 
              className="w-[370px] pt-20 ml-2 hidden lg:block"
              variants={leftSectionVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="flex gap-3 items-center mb-3 whitespace-nowrap"
                variants={itemVariants}
              >
                <h2 className="font-qimano text-3xl font-medium whitespace-nowrap">
                {priceRange}
                </h2>
                <p className="text-gray-500 font-apfel-grotezk-regular text-lg whitespace-nowrap">Value per content piece</p>
              </motion.div>

              <motion.div 
                className="border-b-[0.3px] border-r-2 border-[#F7EA5F]"
                variants={itemVariants}
              >
              </motion.div>

             
            {/* Services */}
  <motion.div 
    className="flex flex-wrap text-sm mt-4 gap-3"
    variants={itemVariants}
  >
    {formData?.compensation?.length > 0 ? (
      formData.compensation.map((item, index) => (
        <motion.div
          key={index}
          className="inline-flex items-center font-qimano text-xl relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 + index * 0.1, duration: 0.4 }}
        >
          {/* Text (not triggering tooltip) */}
          <span className="transition-colors duration-300">
            {item}
          </span>

          {/* Info icon and tooltip trigger zone */}
          <div className="relative group ml-1 mb-2">
            <Image
              src="/assets/icons/i.svg"
              alt="info"
              width={10}
              height={10}
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
        </motion.div>
      ))
    ) : (
      <div className="flex items-center justify-center">
        <span>Compensation</span>
      </div>
    )}
  </motion.div>

              {/* CTA Button */}
              <motion.button 
                className="bg-lime-yellow text-graphite font-outline text-semibold py-2 px-4 rounded mt-6 w-[370px] max-w-[370px] font-apfel-grotezk-regular" 
                onClick={handleRequest}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isAdminView ? "Copy Portfolio Link" : "Get in touch"}
              </motion.button>
            </motion.div>

            {/*2 Center - Profile Image desktop - FIXED VERSION */}
  <motion.div
    className="block relative left-[24%] mt-5 lg:mt-0 lg:left-1/3 transform -translate-x-1/3 -translate-y-3/4 top-[100%] ml-3 lg:-top-5 lg:right-10 rounded-xl overflow-visible z-20"
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
        {/* Container for both skeleton and image - ensures same positioning */}
        <div className="relative">
          {/* Skeleton - always in the same position */}
          <AnimatePresence mode="wait">
            {!imageLoaded && (
              <motion.div
                key="skeleton"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute top-0 left-0"
              >
                <ProfileImageSkeleton />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Image - fades in exactly in place of skeleton */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            <Image
              src={formData?.profilePicture || "/assets/images/profile_defaultOnborad.svg"}
              alt={`${formData?.firstName} ${formData?.lastName}`}
              width={320}
              height={360}
              className="object-cover lg:w-[320px] lg:h-[355px] w-66 h-80 relative z-[9999] rounded-xl right-6"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
          </motion.div>
        </div>
      </div>
    </div>
  </motion.div>

           {/* 3 Right Side - Stats */}
           <motion.div 
             className="w-full lg:w-1/2 flex flex-row lg:flex-col items-center lg:items-end justify-center lg:justify-normal mr-0 lg:mr-4 gap-6 pt-4 z-20"
             variants={rightSectionVariants}
             initial="hidden"
             animate="visible"
           >
    <motion.div 
      className="text-center lg:text-end"
      variants={statsVariants}
    >
      <h2 className="text-5xl font-medium font-qimano">
        <motion.span>{reach}</motion.span>
      </h2>
      <p className="text-sm text-white font-apfel-grotezk-regular">avg reach</p>
    </motion.div>
    <motion.div 
      className="text-center lg:text-end"
      variants={statsVariants}
    >
      <h2 className="text-5xl font-medium font-qimano">
        <motion.span>{followers}</motion.span>
      </h2>
      <p className="text-sm text-white font-apfel-grotezk-regular">followers</p>
    </motion.div>
    <motion.div 
      className="text-center lg:text-end"
      variants={statsVariants}
    >
      <h2 className="text-5xl font-medium font-qimano">
        <motion.span>{posts}</motion.span>
      </h2>
      <p className="text-sm text-white font-apfel-grotezk-regular">posts</p>
    </motion.div>
  </motion.div>

          </motion.div>
        </div>
      </motion.div>

      {/* Mobile Pricing Section */}
      <motion.div 
        className="w-full pt-14 block lg:hidden overflow-x-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Pricing */}
        <motion.div 
          className="flex flex-col items-center w-full mb-2"
          variants={itemVariants}
        >
          <div className="flex items-baseline gap-2">
            <span className="font-qimano text-[28px] font-normal text-black leading-tight">
              {priceRange}
            </span>
            <span className="text-gray-500 text-[16px] font-apfel-grotezk-regular font-normal ml-1">Value per content piece</span>
          </div>
        </motion.div>
        
        {/* Divider */}
        <motion.div 
          className="border-b-[1.5px] border-[#C7D2FE] w-full my-2"
          variants={itemVariants}
        />
        
        {/* Services: dynamic rendering for mobile */}
        <motion.div 
          className="flex flex-wrap items-center justify-center w-full text-black font-qimano text-[20px] gap-x-2 gap-y-1 mb-2"
          variants={itemVariants}
        >
          {formData?.compensation?.length > 0 ? (
            formData.compensation.slice(0, 3).map((item, index) => (
              <motion.div 
                key={index} 
                className="inline-flex items-center relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
              >
                <span className="inline-flex items-center">{item}
                  <Image
                    src='/assets/icons/i.svg'
                    alt='info'
                    width={10}
                    height={10}
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
                {index !== formData.compensation.slice(0, 3).length - 1 && (
                  <span className="mx-1">|</span>
                )}
              </motion.div>
            ))
          ) : (
            <span>Compensation</span>
          )}
        </motion.div>
        
        {/* CTA Button */}
        <motion.button
          className="w-full bg-[#F7EA5F] text-black font-apfel-grotezk-regular text-[22px] font-normal py-3 rounded mt-4 mb-2 text-center"
          onClick={handleRequest}
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isAdminView ? "Copy Portfolio Link" : "Get in touch"}
        </motion.button>
      </motion.div>

      {/* Spacer for fixed content on desktop */}
      {!isMobile && <div style={{ height: '560px' }} />}

      {/* Press Kit Section - Now in normal document flow */}
      <motion.div
        className="w-full bg-white relative z-5"
        ref={pressKitRef}
      >
        <div className="container mx-auto">
          <h2 className="text-5xl lg:text-7xl font-qimano text-[#0044FF] text-center mt-4 lg:mt-24">
            Press Kit
          </h2>

          {/* Content Grid */}
          <PortfolioPublic />

          {/* social links */}
          <SocialLinks formData={formData} />

          <div className="w-full mt-4 mx-auto lg:max-w-[1600px] max-w-[500px]">
            <Questionnaire name={formData?.firstName
              ? formData.firstName.charAt(0).toUpperCase() + formData.firstName.slice(1)
                : ""}/>
          </div>

          <div className="w-full mx-auto lg:max-w-[1300px] max-w-[500px]">
            <AudienceCard />
          </div>
        </div>
      </motion.div>
    </div>
  </div>
  )
}

export default ProfileOverview;