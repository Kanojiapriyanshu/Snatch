"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue, useSpring, AnimatePresence } from "framer-motion"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useFetchPortfolio, useInstagramData, useCheckScreenSize, useCheckScreenSizeForTab } from "@/utils/public-portfolio/portfolio";
import Header from "./Header";
import Image from "next/image"
import PortfolioPublic from "./PortfolioPublic";
import Questionnaire from "./QuestionCard";
import AudienceCard from "./AudienceCard";
import SocialLinks from "./SocialLinks";
import SharePopup from "./Sharepopup";
import HeaderForMobile from "./HeaderForMobile";

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
  <div className="object-cover lg:w-[320px] lg:h-[355px] w-66 h-80 relative z-[99999] rounded-xl right-6 bg-gray-300 animate-pulse" />
);

// Add isAdminView prop
const ProfileOverview = ({ ownerId, isAdminView, portfolio }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isContainerVisible, setIsContainerVisible] = useState(true);

  const { scrollYProgress } = useScroll();
  const scrollY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const containerRef = useRef(null);
  const pressKitRef = useRef(null);
  const mainContainerRef = useRef(null);
  const [igData, setIgData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [portfolioUrl, setPortfolioUrl] = useState("");

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
  const isTablet = useCheckScreenSizeForTab();

  const reach = useAnimatedNumber(Number(igData?.reach) || 0);
  const followers = useAnimatedNumber(Number(igData?.followers_count) || 0);
  const posts = useAnimatedNumber(Number(igData?.media_count) || 0);



  function formatNumber(num) {
    if (!num) return "0"; // handle undefined/null
    num = Number(num);    // convert to number
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  }

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

  const headerBg = useTransform(scrollY, [0, 200], ["rgb( 30,30,30)", "rgb(0, 0, 0)"]);
  const headerHeight = useTransform(scrollY, [0, 200], ["530px", "80px"]);

  // If on mobile, override motion values with static values
  const finalBg = isTablet ? defaultBg : headerBg;
  const finalHeight = isTablet ? defaultHeight : headerHeight;

  const nameSize = useTransform(
    scrollY,
    [0, 9],
    isTablet ? [32, 32] : [86, 37] // Fixed size for mobile, animated for desktop
  );

  // const userNameLocation = useTransform(scrollY, [0, 20], isTablet ? [14, 14] : [18, 12]);
  const userNameLocation = useTransform(scrollY, [0, 20], isTablet ? [14, 12] : [18, 12]);

  // const contentOpacity = useTransform(scrollY, [0, 1], [1, 50]);

  const contentOpacity = useTransform(scrollY, [0, 1], [1, 0]);

  // FIXED: Use same scroll trigger for all header elements to prevent glitching
  const headerOpacity = useTransform(scrollY, [0, 40], [0, 1]);
  const headerOpacityPrimary = useTransform(scrollY, [0, 1], [0, 1]);
  const headerOpacitySecondary = useTransform(scrollY, [0, 1], [0, 1]);

  const profileImageScale = useTransform(scrollY, [0, 150], [1, 0.8])
  const profileImageOpacity = useTransform(scrollY, [0, 1], [1, 0])
  const myOpacity = useTransform(scrollY, [0, 150], [0, 1])

  const fontSizeStyle = useMotionTemplate`${nameSize}px`;
  const sizeReducerThroughScroll = useMotionTemplate`${userNameLocation}px`;
  // Always define useTransform, but use static values for mobile
  const visibility = useTransform(scrollY, [150, 151], isTablet ? ["visible", "visible"] : ["visible", "hidden"]);
  const opacity = useTransform(scrollY, [0, 20], isTablet ? [1, 1] : [1, 0]);
  const story = Number(formData?.story) || 0;
  const reel = Number(formData?.reels) || 0;
  const post = Number(formData?.post) || 0;
  const symbol = formData?.currencySymbol || "";

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
    <>
      <span className="font-thin">{symbol}</span> {formatNumber(lowest)}
    </>
  ) : (
    <>
      <span className="font-extralight">{symbol}</span> {formatNumber(lowest)}{' '}
      - <span className="font-extralight">{symbol}</span> {formatNumber(highest)}
    </>
  );

  // Update the handleRequest function to handle both admin and public cases
  // const handleRequest = () => {
  // if (isAdminView) {
  // // For admin view - copy portfolio link
  // const parts = pathname.split("/");
  // const username = parts[1];
  // setPortfolioUrl(`${window.location.origin}/${username}/media-kit`);

  // try {
  // navigator.clipboard.writeText(portfolioUrl);
  // setIsOpen(true);
  // } catch (err) {
  // console.error("Failed to copy link:", err);
  // alert("Failed to copy link");
  // }
  // } else {
  // // For public view - redirect to request popup
  // const parts = pathname.split("/");
  // const influencerUsername = parts[1];
  // router.push(`/request-popup?username=${influencerUsername}`);
  // }
  // };



  // Update the handleRequest function to handle both admin and public cases
  const handleRequest = () => {
    if (isAdminView) {
      // For admin view - copy portfolio link
      const parts = pathname.split("/");
      const username = parts[1];
      const url = `${window.location.origin}/${username}/media-kit`;

      // Set the state for the popup
      setPortfolioUrl(url);
      setIsOpen(true);

      // Copy to clipboard using the local variable
      try {
        navigator.clipboard.writeText(url);
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

  // Tooltips responsiveness for Small screen----------------------------

  const tooltipRef = useRef(null);
  const [position, setPosition] = useState({});

  useEffect(() => {

    const timeoutId = setTimeout(() => {
      if (tooltipRef.current) {
        const tooltip = tooltipRef.current;
        const rect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        let adjustments = {};

        // Calculate how much the tooltip overflows
        const overflowRight = rect.right - (viewportWidth - 16);
        const overflowLeft = 16 - rect.left;

        if (overflowRight > 0) {
          // Tooltip overflows on the right
          adjustments.transform = `translateX(calc(-50% - ${overflowRight}px))`;
        } else if (overflowLeft > 0) {
          // Tooltip overflows on the left
          adjustments.transform = `translateX(calc(-50% + ${overflowLeft}px))`;
        }

        setPosition(adjustments);
      }
    }, 0);

    return () => clearTimeout(timeoutId);

  }, []);

  const [activeMobileTooltip, setActiveMobileTooltip] = useState(null);

  //Hide tooltip by clicking anywhere in the screen-------------------------------------------

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target)
      ) {
        setActiveMobileTooltip(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [setActiveMobileTooltip])


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
    <div className="" ref={containerRef}>
      {/*  border-purple-dark */}
      {/* Sticky Header (appears on scroll) */}


      {/* Main Content Container - Now using normal flow */}
      <div className="container mx-auto  max-w-[1620px] rounded-xl  border-purple-dark">
        {isTablet ? <HeaderForMobile
          formData={formData}
          headerOpacityPrimary={headerOpacityPrimary}
          headerOpacitySecondary={headerOpacitySecondary}
          isAdminView={isAdminView}
          showGoBackButton={!isScrolled && isAdminView} // Only show when not scrolled and is admin view
          showHeaderButton={!isContainerVisible} // Only show when container is not visible
        />
          :
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
            formatNumber={formatNumber}
          />}
        {/* Main Hero Section */}
        <motion.div
          ref={mainContainerRef}
          className={`container mx-auto w-[100%] lg:w-[97.4%] right-0  max-w-[1620px] relative top-3 sm:left-0  text-white  rounded-2xl shadow-xl overflow-visible  border-green z-10  ${isTablet ? "h-[560px] bg-neutral-800" : " "
            }`}
          // className={`md:w-[99%]  text-white relative md:right-1 lg:left-2 rounded-3xl overflow-visible z-10 ${isTablet ? "h-[560px] bg-neutral-800" : ""
          //   }`}
          style={
            isTablet
              ? {} // No inline styles for mobile (use CSS classes)
              : {
                backgroundColor: finalBg,
                height: finalHeight,
                position: "fixed",
                top: 18,
                zIndex: 10,
                visibility: isTablet ? "visible" : visibility,
                opacity: isTablet ? 1 : opacity,
              }
          }
        >

          {isAdminView && !isScrolled && (
            <motion.button
              onClick={() => router.push('/profile')}
              className="absolute top-9 left-3 sm:left-6 flex items-center gap-1 text-xs md:text-sm font-extralight text-gray-200 hover:text-white transition "
              style={{ opacity: contentOpacity }}
            >
              {/* Left Arrow Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-3 h-3"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>

              {/* Text */}
              <span>Go Back</span>
            </motion.button>
          )}

          <motion.div
            className="container mx-auto max-w-[1400px] flex flex-col items-center  pt-6 rounded-3xl "
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Name and Location */}
            <motion.h1
              className="flex font-qimano leading-none "
              style={{ fontSize: fontSizeStyle }}
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
              className="text-gray-300  font-apfel-grotezk-regular "
              style={{ fontSize: sizeReducerThroughScroll, opacity: contentOpacity }}
              variants={itemVariants}
            >
              @{formData?.username} • {formData?.location}
            </motion.p>

            {/* Category Tags */}
            <motion.div
              className="flex flex-wrap gap-2 pt-4"
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
                    <span className="bg-brown text-gray-200 px-3 py-1.5 rounded-md text-sm font-apfel-grotezk-regular">
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

          <div className="container mx-auto lg:px-16 overflow-visible lg:mt-20  max-w-[1620px]  border-yellow-300 ">
            <motion.div className=" w-full flex flex-col-reverse lg:flex-row justify-between lg:relative z-10 overflow-visible" style={{ opacity: isTablet ? "1" : contentOpacity }}>
              {/* max-[1024px]:max-w-[1024px] max-[1280px]:max-w-[1200px] max-w-[1300px] */}
              {/*1 Left Side - Pricing and Services */}
              <motion.div
                className="w-1/2 hidden lg:flex justify-end flex-col  border-cyan-300"
                // className="min-[960px]:max-[1280px]:w-[270px] min-[1280px]:w-[370px] min-[960px]:max-[1280px]:pt-24 pt-20 hidden lg:block"
                variants={leftSectionVariants}
                initial="hidden"
                animate="visible"
              >
                {/* <motion.div
                className="lg:w-[370px] pt-20 hidden lg:block"
                variants={leftSectionVariants}
                initial="hidden"
                animate="visible"
              > */}
                <motion.div
                  className="flex items-center w-full whitespace-nowrap  border-orange-300"
                  variants={itemVariants}
                >
                  {/* <h2 className="font-qimano lg:text-3xl text-2xl font-medium whitespace-nowrap" >
                    {priceRange}
                  </h2> */}
                  <h2 className="font-qimano  min-[960px]:max-[1299px]:text-xl min-[1300px]:text-3xl font-light whitespace-nowrap  border-red-300" >
                    {priceRange}
                  </h2>
                  <p className="text-gray-500  font-apfel-grotezk-regular text-xs min-[1300px]:text-sm pt-1 pl-1 whitespace-nowrap  border-cyan-50">Value per content piece</p>
                  {/* <p className="text-gray-500 font-apfel-grotezk-regular text-lg whitespace-nowrap">Value per content piece</p> */}

                </motion.div>

                {/* <motion.div
                  className="border-b-[0.3px] border-r-2 border-[#F7EA5F]"
                  variants={itemVariants}
                >
                </motion.div> */}

                <motion.div
                  className="border-b-[0.3px] w-full top-1  lg:border-r-2 border-[#F7EA5F]"
                  // className="border-b-[0.3px] min-[960px]:max-[1280px]:border-r-[16px] min-[1280px]:border-r-2 border-[#F7EA5F]"
                  variants={itemVariants}
                >
                </motion.div>

                {/* Services */}
                <motion.div
                  className="flex flex-wrap h-1/4  mt-2 mb-3   border-red-700 "
                  variants={itemVariants}
                >
                  {/* <motion.div
                  className="flex flex-wrap text-sm mt-4 gap-1"
                  variants={itemVariants}
                > */}
                  {formData?.compensation?.length > 0 ? (
                    formData.compensation.map((item, index) => (
                      <motion.div
                        key={index}
                        className="inline-flex  tracking-tighter items-center font-qimano min-[960px]:max-[1299px]:text-base min-[1300px]:text-lg relative   border-sky-500"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + index * 0.1, duration: 0.4 }}
                      >
                        {/* <motion.div
                        key={index}
                        className="inline-flex items-center font-qimano text-xl relative"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + index * 0.1, duration: 0.4 }}
                      > */}
                        {/* Text (not triggering tooltip) */}
                        <span className="transition-colors  duration-300 leading-none" >
                          {item}
                        </span>

                        {/* Info icon and tooltip trigger zone */}
                        {/* <div className="relative group mx-1 mb-1"> */}
                        <div className="relative group ml-1 mb-1">
                          <Image
                            src="/assets/icons/i.svg"
                            alt="info"
                            width={10}
                            height={10}
                            className="w-4 h-4 cursor-pointer transition-colors duration-300 group-hover:brightness-0 group-hover:invert"
                          />
                          {/* <Image
                            src="/assets/icons/i.svg"
                            alt="info"
                            width={10}
                            height={10}
                            className="w-4 h-4 cursor-pointer transition-colors duration-300 group-hover:brightness-0 group-hover:invert"
                          /> */}

                          {/* Tooltip */}
                          <div className="absolute bottom-full w-[250px] lg:max-[1200px]:w-[200px] -left-5 h-auto -translate-x-10 bg-lime-yellow text-black text-lg px-4 py-4 rounded-md shadow-md  whitespace-normal text-left opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none "
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
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
                          </div>
                        </div>

                        {/* Separator */}
                        {index !== formData.compensation.length - 1 && (
                          <span className="text-gray-600 mx-1">|</span>
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
                  className="bg-yellow-shade-600 mb-0 rounded text-graphite font-outline text-semibold py-2 w-full font-apfel-grotezk-regular"
                  // className="bg-yellow-shade-600 text-graphite font-outline text-semibold py-2 min-[960px]:max-[1280px]:px-3 rounded mt-6 min-[960px]:max-[1280px]:w-[250px] w-[370px] max-w-[370px] font-apfel-grotezk-regular"
                  onClick={handleRequest}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* <motion.button
                  className="bg-yellow-shade-600 text-graphite font-outline text-semibold py-2 px-4 rounded mt-6 w-[370px] max-w-[370px] font-apfel-grotezk-regular"
                  onClick={handleRequest}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                > */}
                  {isAdminView ? "Copy Portfolio Link" : "Get in touch"}
                </motion.button>
              </motion.div>

              {/*2 Center - Profile Image desktop - FIXED VERSION */}

              <motion.div
                className="w-full flex justify-center rounded-xl overflow-visible z-20  border-red"
                // min-[960px]:max-[1050px]:mr-32 min-[1051px]:max-[1300px]:mr-14
                // max-[960px]:top-20 min-[340px]:max-[385px]:right-7 min-[390px]:max-[412px]:right-3 min-[430px]:left-1
                // max-[960px]:top-20 min-[340px]:max-[400px]:right-4 min-[431px]:max-[530px]:left-8 min-[531px]:max-[630px]:left-14  min-[960px]:max-[1024px]:right-24
                style={{
                  scale: isTablet ? "0" : profileImageScale,
                  opacity: isTablet ? "1" : profileImageOpacity,
                  zIndex: 100
                }}
              >
                {/* <div className="lg:absolute overflow-visible z-[9999]  border-yellow-500"> */}
                <div className="absolute rounded-xl -bottom-10 lg:-top-4 lg:mx-auto w-60 h-[320px] overflow-visible items-center   border-sky-40">
                  {/* <div className="absolute lg:translate-x-1/2 lg:translate-y-10 rounded-xl w-64 h-2/3 overflow-visible  border-sky-400"> */}
                  {/* Container for both skeleton and image - ensures same positioning */}
                  <div className="relative h-full">
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
                      className="relative h-full"
                    >
                      <Image
                        src={formData?.profilePicture || "/assets/images/profile_defaultOnborad.svg"}
                        alt={`${formData?.firstName} ${formData?.lastName}`}
                        width={300}
                        height={400}
                        className="object-cover w-full h-full relative z-[9999] shadow-2xl rounded-xl"
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageLoaded(true)}
                      />
                    </motion.div>
                  </div>
                </div>
                {/* </div> */}
              </motion.div>
              {/* 3 Right Side - Stats */}
              <motion.div
                className="w-full lg:w-1/2 lg:items-end justify-center flex flex-row lg:flex-col items-center gap-8 lg:gap-0 pt-4 lg:pt-0 z-20  border-cyan-300"
                variants={rightSectionVariants}
                initial="hidden"
                animate="visible"

              >
                <motion.div

                  className="flex flex-col justify-end   border-red"
                  variants={statsVariants}
                >

                  <motion.span className="h-1/2 text-[28px] lg:text-5xl font-qimano text-center">{reach ? formatNumber(reach.get()) : "0"}</motion.span>

                  <p className="text-sm pt-1 text-white font-apfel-grotezk-regular text-right " >avg reach</p>
                </motion.div>
                <motion.div
                  className="flex flex-col justify-end pt-1  border-red"
                  variants={statsVariants}
                >

                  <motion.span className="h-1/2 text-[28px] lg:text-5xl font-qimano text-center">{followers ? formatNumber(followers.get()) : "0"}</motion.span>

                  <p className="text-sm pt-1 text-white font-apfel-grotezk-regular text-right">followers</p>
                </motion.div>
                <motion.div
                  className="flex flex-col justify-end  pt-1  border-red"
                  variants={statsVariants}
                >

                  <motion.span className="h-1/2 text-[28px] lg:text-5xl font-qimano text-center">{posts ? formatNumber(posts.get()) : "0"}</motion.span>

                  <p className="text-sm pt-1 lg:pt-[6px] lg:leading-none text-white font-apfel-grotezk-regular text-right">posts</p>
                </motion.div>
              </motion.div>

            </motion.div>
          </div>
        </motion.div>

        {/* Mobile Pricing Section */}
        <motion.div
          className="w-full pt-24 block lg:hidden overflow-x-hidden overflow-y-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Pricing */}
          <motion.div
            className="flex flex-col items-center w-full mb-2"
            variants={itemVariants}
          >
            <div className="flex items-baseline">
              <span className="font-qimano text-[28px] max-sm:text-[26px] font-normal text-black leading-tight">
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
          {/* <motion.div
            className="flex flex-wrap items-center justify-center w-full text-black font-qimano text-[20px] gap-x-2 gap-y-1 mb-2"
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
               


                  {activeMobileTooltip === index && (
                    <span className="absolute left-1/2 -translate-x-1/2 pl-[1px] pr-[1px] bottom-full mb-2 bg-lime-yellow text-black text-sm py-2 rounded-md shadow-md max-w-[90vw] w-max whitespace-normal break-words text-left z-50">
                      {getCompensationTooltip(item)}

                    </span>
                  )}
           
                  {index !== formData.compensation.slice(0, 3).length - 1 && (
                    <span className="mx-1">|</span>
                  )}
                </motion.div>
              ))
            ) : (
              <span>Compensation</span>
            )}
          </motion.div> */}

          <motion.div
            className="flex flex-wrap items-center justify-center w-full text-black font-qimano text-[16px] sm:gap-x-2 gap-x-1 gap-y-1 mb-2  "
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {formData?.compensation?.length > 0 ? (

              formData.compensation.slice(0, 5).map((item, index) => (
                <motion.div
                  key={index}
                  className="inline-flex items-center relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                >
                  <span className="inline-flex items-center">
                    {item}
                    <Image
                      src='/assets/icons/i.svg'
                      alt='info'
                      width={10}
                      height={10}
                      className='w-4 h-4 mx-1 mb-1 invert cursor-pointer'
                      style={{ filter: 'invert(1)' }}
                      onClick={() => setActiveMobileTooltip(
                        activeMobileTooltip === index ? null : index
                      )}
                    />
                  </span>

                  {/* Responsive Tooltip */}
                  {activeMobileTooltip === index && (
                    <div
                      ref={tooltipRef}
                      className="absolute block lg:hidden max-[400px]:left-3 max-[375px]:text-[10px] max-[375px]:w-[100px] max-[400px]:-translate-x-5 max-sm:w-[120px] sm:w-[120px] md:w-[180px] h-auto left-1 -translate-x-4 bottom-full mb-2 bg-lime-yellow text-black text-[10px] md:text-sm md:py-3 md:px-3 py-2 px-2 items-center rounded-md shadow-xl whitespace-normal break-words text-left z-[99999] "
                      // absolute bottom-full w-[250px] lg:max-[1200px]:w-[200px] -left-5 h-auto -translate-x-10
                      // className="absolute block md:hidden w-[300px] h-auto translate-x-0 bottom-full mb-2 bg-lime-yellow text-black text-sm p-4 rounded-md shadow-md max-w-[calc(44vw-5px)] whitespace-normal break-words text-left z-[99999]"
                      style={position}
                    >
                      {getCompensationTooltip(item)}
                    </div>
                  )}

                  {/* Separator */}
                  {index !== formData.compensation.slice(0, 5).length - 1 && (
                    <span className="mx-1">|</span>
                  )}
                </motion.div>))


            ) : (
              <span>Compensation</span>
            )}
          </motion.div>

          {/* CTA Button */}
          {/* <motion.button
            className="w-full bg-yellow-shade-600 text-black font-apfel-grotezk-regular text-[22px] font-normal py-3 rounded mt-4 mb-2 text-center"
            onClick={handleRequest}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isAdminView ? "Copy Portfolio Link" : "Get in touch"}
          </motion.button> */}
        </motion.div>

        {/* Spacer for fixed content on desktop */}
        {!isTablet && <div className="  border-red" style={{ height: '580px' }} />}

        {isOpen && <SharePopup portfolioUrl={portfolioUrl} onClose={() => setIsOpen(false)} />}

        {/* Press Kit Section - Now in normal document flow */}
        <motion.div
          className="w-full bg-white relative mb-10"
          ref={pressKitRef}
        >
          <div className="w-full">
            <h2 className="text-4xl lg:text-6xl font-qimano text-[#0044FF] text-center max-lg:mt-5 max-lg:mb-4 mt-2 mb-6">
              Press Kit
            </h2>

            {/* Content Grid */}
            <PortfolioPublic />

            <div className="w-full max-lg:mt-5 max-lg:mb-4">
              <Questionnaire name={formData?.firstName
                ? formData.firstName.charAt(0).toUpperCase() + formData.firstName.slice(1)
                : ""} />
            </div>

            {/* social links */}
            <SocialLinks formData={formData} />

            <div className="w-full max-lg:mt-5 max-lg:mb-4">
              <AudienceCard />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ProfileOverview;