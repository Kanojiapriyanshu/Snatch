"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMediaInsights } from "@/utils/public-portfolio/portfolio";
import { motion, AnimatePresence } from "framer-motion";

export default function PostCard({ post, postId, username, allPosts }) {
  const pathname = usePathname();
  const router = useRouter();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isPortrait, setIsPortrait] = useState(false);
  const cardRef = useRef(null);

  // Extract data from the new nested structure
  const formData = post?.formData || {};
  const media = post?.media || {};
  
  const isInstagram = media?.source === "instagram";
  const isAdminView = pathname?.includes("/adminview");

  const checkOrientation = (width, height) => {
    return height > width;
  };
      const {
      data: insights,
      isLoading: insightsLoading,
      isError: insightsError,
    } = useMediaInsights({
      username,
      postId,
      isInstagram,
    });

  const currentIndex = allPosts ? allPosts.findIndex((p) => p.postId === postId) : -1;
  const totalPosts = allPosts ? allPosts.length : 0;

  const baseUrl = isAdminView 
    ? `/${username}/media-kit/adminview/post`
    : `/${username}/media-kit/post`;

  const handleNavigation = (direction) => {
    if (!allPosts || allPosts.length === 0) return;

    const currentIndex = allPosts.findIndex((p) => p.postId === postId);
    let nextIndex;

    if (direction === "next") {
      nextIndex = currentIndex === allPosts.length - 1 ? 0 : currentIndex + 1;
    } else {
      nextIndex = currentIndex === 0 ? allPosts.length - 1 : currentIndex - 1;
    }

    const nextPost = allPosts[nextIndex];

    if (!nextPost || !nextPost.postId) {
      console.error("Next post is missing postId", nextPost);
      return;
    }

    router.push(`${baseUrl}/?postId=${nextPost.postId}`);
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "ArrowLeft") {
        handleNavigation("prev");
      } else if (event.key === "ArrowRight") {
        handleNavigation("next");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [postId, allPosts]);

  if (!post) return <div className="font-qimano h-[480px] flex items-center text-md lg:text-2xl animate-pulse text-electric-blue">Hold on while we fetch the post!</div>;

  // Extract values from formData
  const title = formData?.titleName || "Untitled";
  const description = formData?.description || "No description available.";
  const industries = formData?.industries || [];
  const companyName = formData?.companyName;
  const companyLocation = formData?.companyLocation;
  const companyLogo = formData?.companyLogo;
  const eventTypes = formData?.eventTypes || [];
  const eventYear = formData?.eventYear || "";
  const eventName = formData?.eventName || "";
  const isBrandCollaboration = formData?.isBrandCollaboration || false;

  const hasCompanyInfo = companyName && (companyLocation || eventTypes.length > 0 || companyLogo);

  return (
    <div className="w-full flex flex-col items-center justify-start mt-10">
      <div className="hidden md:flex fixed inset-0 w-full h-full bg-black/2 z-10 pointer-events-none" aria-hidden="true"></div>
      
      <div className="hidden lg:flex flex-col items-center justify-center w-full relative z-20">
        <div className="flex items-center justify-center w-full relative" style={{ minHeight: '430px', overflowY: 'visible' }}>
          <button
            onClick={() => handleNavigation('prev')}
            className="absolute left-1/8 -translate-x-[490px] top-1/2 -translate-y-1/2 z-30 transition-transform duration-200 hover:scale-105"
            aria-label="Previous"
            style={{ minWidth: 56, minHeight: 56 }}
          >
            <div className="w-17 h-17 flex flex-col -space-y-6 items-center justify-center">
              <Image src="/assets/images/Lefthand.svg" alt="Previous" width={56} height={56} className="w-full h-full object-contain" />
              <p className="text-electric-blue font-apfel-grotezk-regular">Prev</p>
            </div>
          </button>

          <div ref={cardRef} className="w-[864px] h-[450px] p-2 bg-[#FFFFFF] rounded-lg mx-auto">
            <div className="flex gap-5 items-start mt-2 h-[400px]">
              <div className="w-[300px] h-full pl-5 pt-5">
                <div className="w-[250px]">
                  <MediaDisplay media={media} isPortrait={isPortrait} setIsPortrait={setIsPortrait} carouselIndex={carouselIndex} setCarouselIndex={setCarouselIndex} />
                </div>
              </div>

              <div className="w-full h-full pl-5 pr-5 mt-5 flex flex-col">
                <div className="flex-shrink-0 min-h-[80px]">
                  <p className="text-2xl text-graphite font-qimano">{title}</p>
                  <div className="flex gap-1 flex-wrap max-w-xl mr-10">
                    {industries.length > 0 ? (
                      industries.map((industry, index) => (
                        <span key={index} className="bg-[#0037EB]/5 text-graphite my-2 font-apfel-grotezk-regular inline-block rounded border border-transparent py-1 px-2.5 text-xs font-medium">
                          {industry}
                        </span>
                      ))
                    ) : (
                      <span>Industry</span>
                    )}
                  </div>
                </div>

                <div className="w-full border-b-[0.5px] border-gray-300 mt-2 flex-shrink-0"></div>

                <div className="flex-grow flex flex-col justify-start mt-4">
                  {isBrandCollaboration && (
                    <div className="brand-collaboration-section flex gap-3 mb-4">
                      <Image
                        src={companyLogo || "/assets/images/logo.svg"}
                        width={50}
                        height={50}
                        alt={companyLogo ? "Company Logo" : "Default Logo"}
                        className="h-12 w-12 bg-cover rounded-full flex-shrink-0"
                      />
                      {(companyName || companyLocation || eventTypes?.length > 0) && (
                        <div className="h-12 border-l border-gray-400 flex-shrink-0"></div>
                      )}

                      {(companyName || companyLocation || eventTypes?.length > 0) && (
                        <div className="text-graphite font-apfel-grotezk-regular text-sm space-y-1">
                          {(companyName || companyLocation) && (
                            <p>
                              {companyName && <span className="text-blue-shade-600">{companyName}</span>}
                              {companyLocation && <><span className="text-[#BFBFBF] mx-[0.5]">•</span> {companyLocation}</>}
                              {eventYear && <><span className="text-[#BFBFBF] mx-1">•</span><span className="px-1 -ml-1 text-sm text-graphite">{eventYear}</span></>}
                            </p>
                          )}
                          <div className="flex gap-2">
                            {eventName && <p><span>{eventName}</span></p>}
                            {eventTypes?.length > 0 && <p className="text-sm"><span className="text-[#BFBFBF]">• </span>{eventTypes.join(", ")}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-graphite font-apfel-grotezk-regular mr-3">{description}</p>
                </div>

                 {/* Bottom section - Stats (fixed position at bottom) */}
                {post?.media?.source === "instagram" && (
                   <div className="flex-shrink-0 mt-auto w-full">
                     {/* Fixed separator line */}
                     <div className="w-full border-b-[0.5px] border-gray-300 mb-3"></div>

                     {/* Insights section */}
                     <div className="flex justify-between text-graphite w-full min-h-[60px]">
                       {insights ? (
                         [
                           { label: "Views", key: "views" },
                           { label: "Likes", key: "likes" },
                           { label: "Comments", key: "comments" },
                           { label: "Shares", key: "shares" }
                         ].map(({ label, key }) => (
                           <div
                             className="flex flex-col items-center min-w-[40px] text-center"
                             key={key}
                           >
                             <div className="text-[22px] leading-none font-qimano text-graphite">
                               {insights?.[key] ?? 0}
                             </div>
                             <div className="text-[12px] text-[#000000]/70 font-apfel-grotezk-regular mt-1">
                               {label}
                             </div>
                           </div>
                         ))
                       ) : (
                         
                         <div className="h-[40px] w-full"></div>
                       )}
                     </div>
                   </div>
                 )}
              </div>
            </div>
          </div>

          <button
            onClick={() => handleNavigation('next')}
            className="absolute right-1/8 translate-x-[490px] top-1/2 -translate-y-1/2 z-30 transition-transform duration-200 hover:scale-105"
            aria-label="Next"
            style={{ minWidth: 56, minHeight: 56 }}
          >
            <div className="w-17 h-17 flex flex-col -space-y-6 items-center justify-center">
              <Image src="/assets/images/Righthand.svg" alt="Next" width={56} height={56} className="w-full h-full object-contain" />
              <p className="text-electric-blue font-apfel-grotezk-regular">Next</p>
            </div>
          </button>

          <div className="absolute right-1/8 translate-x-[490px] top-0 z-30" style={{ minWidth: 56 }}>
            <button
              className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center z-40"
              onClick={() => {
                if (isAdminView) {
                  router.push(`/${username}/media-kit/adminview?scrollTo=presskit`);
                } else {
                  router.push(`/${username}/media-kit?scrollTo=presskit`);
                }
              }}
              aria-label="Go to Portfolio"
            >
              <Image src="/assets/icons/cross-mark.svg" alt="Go to Portfolio" width={28} height={28} className="w-10 h-10 object-contain" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile layout */}
      <MobileLayout 
        post={post}
        media={media}
        formData={formData}
        title={title}
        description={description}
        industries={industries}
        hasCompanyInfo={hasCompanyInfo}
        companyLogo={companyLogo}
        companyName={companyName}
        companyLocation={companyLocation}
        eventYear={eventYear}
        eventName={eventName}
        eventTypes={eventTypes}
        isPortrait={isPortrait}
        setIsPortrait={setIsPortrait}
        carouselIndex={carouselIndex}
        setCarouselIndex={setCarouselIndex}
        currentIndex={currentIndex}
        totalPosts={totalPosts}
        allPosts={allPosts}
        handleNavigation={handleNavigation}
        username={username}
        router={router}
        insights={insights}
      />
    </div>
  );
}

function MediaDisplay({ media, isPortrait, setIsPortrait, carouselIndex, setCarouselIndex }) {
  const Wrapper = ({ children }) => (
    <div className="relative w-full h-[385px] overflow-hidden rounded-lg bg-white">
      {children}
    </div>
  );

  if (!media || !media.files || media.files.length === 0) {
    return <Wrapper><p className="text-graphite flex justify-center items-center h-full">No media</p></Wrapper>;
  }

  if (media.type === "IMAGE") {
    return (
      <Wrapper>
        <ImagePlayer
              src={media.files[0].url}
              isPortrait={isPortrait}
            />
      </Wrapper>
    );
  }

  if (media.type === "VIDEO") {
    return (
      <Wrapper>
        <VideoPlayer src={media.files[0].url} thumbnailUrl={media.thumbnailUrl} isPortrait={isPortrait} />
      </Wrapper>
    );
  }

  if (media.type === "CAROUSEL") {
    const activeFile = media.files[carouselIndex];
    return (
      <Wrapper>
        {media.files.map((file, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 rounded-lg ${carouselIndex === index ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          >
            {file.type === "IMAGE" ? (
              <ImagePlayer
              src={file.url}
              isPortrait={isPortrait}
            />

            ) : file.type === "VIDEO" ? (
               <VideoPlayer src={file.url} isPortrait={isPortrait} isActive={carouselIndex === index} />
            ) : null}
          </div>
        ))}
        <div className="absolute inset-0 flex items-center mb-28 justify-between px-2 pointer-events-none">
          <button
            className="pointer-events-auto z-10 bg-black/50 text-white rounded-full w-6 h-6"
            onClick={(e) => {
              e.stopPropagation();
              setCarouselIndex(prev =>
                prev === 0 ? media.files.length - 1 : prev - 1
              );
            }}
          >
            ❮
          </button>

          <button
            className="pointer-events-auto z-10 bg-black/50 text-white rounded-full w-6 h-6"
            onClick={(e) => {
              e.stopPropagation();
              setCarouselIndex(prev =>
                prev === media.files.length - 1 ? 0 : prev + 1
              );
            }}
          >
            ❯
          </button>
        </div>
      </Wrapper>
    );
  }

  return null;
}

function VideoPlayer({ src, isPortrait, isActive }) {
  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(null);

  /* 🛑 Pause when slide becomes inactive */
  useEffect(() => {
    if (!isActive && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    setAspectRatio(video.videoWidth / video.videoHeight);
    setIsLoading(false);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    setProgress((video.currentTime / video.duration) * 100);
  };

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      console.warn("Autoplay blocked", err);
    }
  };

  /* Aspect ratio handling */
  const defaultAspectRatio = isPortrait ? 9 / 16 : 16 / 9;

  const containerStyle = isPortrait
    ? { height: "600px", width: "100%" }
    : { aspectRatio: (aspectRatio || defaultAspectRatio).toFixed(2) };

  return (
    <div
      onClick={togglePlay}
      className="relative w-full overflow-hidden rounded-lg cursor-pointer"
      style={containerStyle}
    >
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 h-full">
          <div className="h-8 w-8 rounded-full border-2 border-electric-blue/30 border-t-electric-blue animate-spin" />
        </div>
      )}


      {/* Video */}
      <video
        ref={videoRef}
        preload="metadata"
        playsInline
        controls={false}
        disablePictureInPicture
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        className={`absolute w-full h-full ${
          isPortrait ? "object-cover" : "object-contain object-top"
        } ${isLoading ? "opacity-0" : "opacity-100"}`}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Custom Play Button */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 bg-black/70 rounded-full flex items-center justify-center text-white text-xl">
            ▶
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {!isLoading && (
        <div className={`${isPortrait ? "absolute bottom-20" : "absolute bottom-3"} left-3 right-3 h-[3px] bg-white/30 rounded-full overflow-hidden`}>
          <div
            className="h-full bg-white transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function ImagePlayer({ src, isPortrait }) {
  const [aspectRatio, setAspectRatio] = useState(null);

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg bg-white"
      style={
        isPortrait
          ? { aspectRatio: "4 / 6" } // reels-style portrait
          : aspectRatio
          ? { aspectRatio } // landscape → exact image height
          : undefined
      }
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        className="object-contain object-top"
        onLoadingComplete={(img) => {
          if (!isPortrait && img.naturalWidth && img.naturalHeight) {
            setAspectRatio(img.naturalWidth / img.naturalHeight);
          }
        }}
      />
    </div>
  );
}


function MobileLayout(props) {
  const { media, title, description, industries, hasCompanyInfo, companyLogo, companyName, companyLocation, eventYear, eventName, eventTypes, isPortrait, setIsPortrait, carouselIndex, setCarouselIndex, currentIndex, totalPosts, allPosts, handleNavigation, username, router, insights } = props;

  const checkOrientation = (width, height) => height > width;
  const SWIPE_CONFIDENCE_THRESHOLD = 80;

  return (
    <div className="flex lg:hidden flex-col w-full">
    <div className="fixed top-0 left-0 right-0 z-50 bg-white p-4 shadow-sm">
    <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center">
      
      {/* Left Arrow */}
      <button
        onClick={() => handleNavigation("prev")}
        className="justify-self-end mr-6 text-graphite "
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Center Count */}
      <div className="text-graphite font-apfel-grotezk-regular text-sm font-medium">
        {totalPosts > 0 ? `${currentIndex + 1} / ${totalPosts}` : ""}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => handleNavigation("next")}
        className="justify-self-start ml-6 text-graphite"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Close Button */}
      <button
        className="ml-auto bg-[#F2F2F2] rounded-full shadow-lg border border-gray-200 flex items-center justify-center w-7 h-7"
        onClick={() => router.push(`/${username}/media-kit?scrollTo=presskit`)}
      >
        <Image src="/assets/icons/cross-mark.svg" alt="Close" width={20} height={20} />
      </button>

    </div>
  </div>


      {/* <div className="flex-grow flex flex-col w-full px-4 pt-4 pb-24 mt-[16px] overflow-y-auto rounded-lg bg-white"> */}
      <motion.div
      className="flex-grow flex flex-col w-full px-4 pt-4 pb-24 mt-[16px] overflow-y-auto rounded-lg bg-white"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.10}
      onDragEnd={(event, info) => {
        const offsetX = info.offset.x;
        const offsetY = info.offset.y;

        // ✅ Ignore swipe if user is scrolling vertically
        if (Math.abs(offsetY) > Math.abs(offsetX)) return;

        if (offsetX < -SWIPE_CONFIDENCE_THRESHOLD) {
          handleNavigation("next");
        } else if (offsetX > SWIPE_CONFIDENCE_THRESHOLD) {
          handleNavigation("prev");
        }
      }}
    >
        <div className="relative w-full flex-shrink-0 flex items-center justify-center rounded-lg">
          <div className="relative w-full rounded-lg overflow-hidden flex items-center justify-center">
            {media?.type === "CAROUSEL" && media.files?.length > 0 ? (
              <div className="relative w-full">
                <div className="w-full overflow-hidden rounded-lg">
                  {media.files.map((file, index) => (
                    <div key={index} className={`transition-opacity duration-500 w-full ${carouselIndex === index ? "opacity-100 pointer-events-auto" : "opacity-0 absolute inset-0 pointer-events-none"}`}>
                      {file.type === "IMAGE" ? (
                         <ImagePlayer
                          src={file.url}
                          isPortrait={isPortrait}
                        />
                      ) : file.type === "VIDEO" ? (
                        <>
                           <VideoPlayer src={file.url} isPortrait={isPortrait} isActive={carouselIndex === index} />
                        </>
                      ) : null}
                    </div>
                  ))}
                </div>
                <button onClick={() => setCarouselIndex(carouselIndex === 0 ? media.files.length - 1 : carouselIndex - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full w-8 h-8">❮</button>
                <button onClick={() => setCarouselIndex(carouselIndex === media.files.length - 1 ? 0 : carouselIndex + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full w-8 h-8">❯</button>
              </div>
            ) : media?.type === "VIDEO" ? (
                <VideoPlayer src={media.files[0].url} thumbnailUrl={media.thumbnailUrl} isPortrait={isPortrait} />
            ) : media?.type === "IMAGE" ? (
               <ImagePlayer
              src={media.files[0].url}
              isPortrait={isPortrait}
            />
            ) : null}
          </div>
        </div>

           {/* Engagement Metrics Section (moved just below media for mobile) */}
           <div className="w-full">
             <div className="w-full mb-4"></div>
             <div className="mt-2 flex justify-between text-black w-full px-1">
               {[
                 { label: "Views", key: "views" },
                 { label: "Likes", key: "likes" },
                 { label: "Comments", key: "comments" },
                 { label: "Shares", key: "shares" }
               ].map(({ label, key }) => (
                 <div className="flex flex-col items-center min-w-[40px] text-center" key={key}>
                   <div className="text-[19px] leading-none font-qimano text-graphite">
                     {insights?.[key] ?? 0}
                   </div>
                   <div className="text-[12px] text-[#000000]/70 font-apfel-grotezk-regular mt-1">
                     {label}
                   </div>
                 </div>
               ))}
             </div>
           </div>

           <div className="w-full mt-4 mb-2 h-[0.5px] bg-[#212121]/20"></div>

        <div className="flex items-start justify-between mt-4 mb-1 px-1">
          <h2 className="text-xl font-qimano text-[#212121] leading-tight max-w-[85%]">{title}</h2>
        </div>

        <div className="flex flex-wrap gap-2 mb-2 mt-1 px-1">
          {industries.length > 0 ? industries.map((tag, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-[#0037EB]/5 text-graphite text-[0.85rem] font-apfel-grotezk-regular rounded-lg">{tag}</span>
          )) : <span className="text-gray-400 text-[0.85rem]">No industries</span>}
        </div>

        <div
        className={`w-full mt-4 ${hasCompanyInfo ? "mb-4" : "mb-2"} h-[0.5px] bg-[#212121]/20`}
      ></div>

        {hasCompanyInfo && (
          <div className="flex items-center gap-3 mb-2 px-1">
            <div className="w-8 h-8 rounded-full">
              <Image src={companyLogo || "/assets/images/logo.svg"} alt="Logo" width={32} height={32} className="rounded-full" />
            </div>
            <div className="border-l border-[#cbcbcb] pl-2">
              <p className="text-graphite text-sm">
              <span className="text-graphite font-normal">{companyName}</span>
              {companyLocation && (
                <>
                  <span className="mx-1 text-light-grey">•</span>
                  <span className="text-graphite font-normal">{companyLocation}</span>
                </>
              )}
            </p>
              <div className="flex gap-2 text-sm text-graphite font-normal">
              {eventYear && (
                <>
                  <span>{eventYear}</span>
                  <span className="text-light-grey">•</span>
                </>
              )}

              {eventName && <span>{eventName}</span>}

              {eventTypes?.length > 0 && (
                <>
                  <span className="text-light-grey">•</span>
                  <span>{eventTypes.join(", ")}</span>
                </>
              )}
            </div>
            </div>
          </div>
        )}
         {/* 📝 Description */}
        <p className="text-graphite font-apfel-grotezk-regular mt-3 mb-2 text-[0.95rem] px-1">
        {description}
        </p>

      </motion.div>
    </div>
  );
}

