"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import { fetchInstagramMedia } from "@/utils/fetchInstagramMedia";
import { getMediaFromDatabase } from "@/utils/getMediaFromDatabase";
import MediaDisplay from "@/components/MediaDisplay";
import { useSelectedProjects } from "../context";
import { useRouter } from "next/navigation";
import SvgComponent from "@/components/svg/Instagramsvg";
import Uploadsvg from "@/components/svg/Uploadsvg";
import InstagramPopup from "@/components/PopUp1"
import { useUser } from "@clerk/nextjs";
import Button from "@/components/ui/Button";
import { TfiAlignLeft } from "react-icons/tfi";
import { FiChevronDown } from "react-icons/fi"; // Arrow icon
import { motion, AnimatePresence } from "framer-motion";
import { PLAN_TOOLTIPS } from "@/data/planTooltips";
import Tooltip from "@/components/ui/Tooltip";

export default function PickProjects() {
const [isHydrated, setIsHydrated] = useState(false);
const [selectedTab, setSelectedTab] = useState("instagram");
const [carouselIndexes, setCarouselIndexes] = useState({});
const router = useRouter();
const [media, setMedia] = useState([]);
const [showInstagramPopup, setShowInstagramPopup] = useState(false);
const { 
  selectionState, 
  handleFileUpload, 
  removeInstagramSelection, 
  removeFile
} = useSelectedProjects();
const [isMenuVisible, setIsMenuVisible] = useState(false);
const [paging, setPaging] = useState(null);
const [currentPage, setCurrentPage] = useState(0);
const PAGE_SIZE = 20;
const [isLoadingMore, setIsLoadingMore] = useState(false);
const [loading, setLoading] = useState(true);
const [isInitialLoading, setIsInitialLoading] = useState(false);
const [isSorting, setIsSorting] = useState(false);
const [totalPages, setTotaPages] = useState(0);
const [code, setCode] = useState(null);
const containerRef = useRef(null);
const { user, isLoaded } = useUser();
const [hasInitialized, setHasInitialized] = useState(false);
const [sortOption, setSortOption] = useState("date");
const contentRef = useRef(null);
const [containerWidth, setContainerWidth] = useState(null);
const [limits, setLimits] = useState(null);
const [showUpgradeBar, setShowUpgradeBar] = useState(false);

  const plan = limits?.plan;
  const projectsUsed = limits?.projectsUsed ?? 0;
  const projectLimit = limits?.projectLimit ?? 8;

  const isProPlan =
    plan === "pro" || plan === "trial" || plan === "early_bird";

  const effectiveLimit = isProPlan ? 12 : projectLimit;
  const tooltip = PLAN_TOOLTIPS.number_of_projects[plan] ?? PLAN_TOOLTIPS.number_of_projects.free;

  const totalSelected = useMemo(() => {
    return (
      (selectionState?.instagramSelected?.length || 0) +
      (selectionState?.uploadedFiles?.length || 0)
    );
  }, [selectionState]);
  const remaining = effectiveLimit - projectsUsed;

useEffect(() => {
  if (!contentRef.current) return;

  const observer = new ResizeObserver(entries => {
    const width = entries[0].contentRect.width;
    setContainerWidth(width);
  });

  observer.observe(contentRef.current);
  return () => observer.disconnect();
}, []);


   useEffect(() => {
    setIsHydrated(true);
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
       if (code) {
      setShowInstagramPopup(true); // show popup instantly
    }
  }, []);

    useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user/limits");
        const data = await res.json();
        console.log("Fetched plan and limits:", data);

        setLimits(data);
      } catch (err) {
        console.error("Error fetching plan:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [])

  // Effect to handle sort option changes
  useEffect(() => {
    if (!hasInitialized) return; // Wait for initial load

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    const fetchSortedMedia = async () => {
      try {
        setIsSorting(true);
        setLoading(true);
        setCurrentPage(0); // Reset to first page
        setCarouselIndexes({}); // Reset carousel indexes

        if (code) {
          // First-time user: fetch from Instagram API with sort
          const { connected, media, paging, mediaCount } = await fetchInstagramMedia(code, null, sortOption, 1);

          if (connected) {
            setMedia(media);
            setPaging(paging);
            setTotaPages(Math.ceil(mediaCount / PAGE_SIZE));
          }
        } else {
          // Returning user: fetch from DB with sort
          const { media, paging, mediaCount } = await getMediaFromDatabase(
            "",
            PAGE_SIZE,
            sortOption,
            1
          );

          setMedia(media);
          setPaging(paging);
          setTotaPages(Math.ceil(mediaCount / PAGE_SIZE));
        }
      } catch (error) {
        console.error("Error fetching sorted media:", error);
      } finally {
        setIsSorting(false);
        setLoading(false);
      }
    };

    fetchSortedMedia();
  }, [sortOption, hasInitialized]);

    useEffect(() => {
    if (!isProPlan && totalSelected > 8) {
      setShowUpgradeBar(true);
    } else {
      setShowUpgradeBar(false);
    }
  }, [totalSelected, isProPlan]);
   
  useEffect(() => {
    if (!isLoaded || !user) return;
    if (hasInitialized) return; 
    setHasInitialized(true);          // Lock it so it won’t repeat

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    const initInstagram = async () => {
      try {
        setIsInitialLoading(true);
        setLoading(true);

        if (code) {
          // FIRST-TIME USER → Handle OAuth callback
          const { connected, media, paging, mediaCount } = await fetchInstagramMedia(code, null, sortOption, 1);

          if (connected) {
            setMedia(media);
            setPaging(paging);
            setTotaPages(Math.ceil(mediaCount / PAGE_SIZE));
          }
        } else {
          // const refreshRes = await fetch(`/api/auth/refreshInstagram?userId=${user.id}`);  // can no-cache here too, if needed

          // if (!refreshRes.ok) {
          //   console.error("Failed to refresh Instagram media");
          // }

          //2️⃣ Then fetch from DB (always after refresh completes)
          const { media, paging, mediaCount } = await getMediaFromDatabase(
            "",
            PAGE_SIZE,
            sortOption,
            1
          );

          setMedia(media);
          setPaging(paging);
          setTotaPages(Math.ceil(mediaCount / PAGE_SIZE))
        }
      } catch (error) {
        console.error(error);
        // alert("Error fetching Instagram media");
      } finally {
        setIsInitialLoading(false);
        setLoading(false);
      }
    };

    initInstagram();
  }, [isLoaded, user, hasInitialized]);

  if (loading) return <p>Loading...</p>;
  if (!limits || limits.error) return <p>Unable to load limits</p>;

  if (!isHydrated) {
    return null;
  }

  const scrollToTop = () => {
  if (containerRef.current) {
    containerRef.current.scrollTo({ top: 0 });
    }
  };

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
    setTimeout(() => {
    scrollToTop();
  }, 0);
  };

  const handleNext = async () => {
    // If next page is already loaded, just go to it
    if (mediaPages[currentPage + 1]) {
      setCurrentPage((prev) => prev + 1);
      scrollToTop();
      return;
    }

    // If not loaded but more data exists, fetch next page
    if (paging?.next && paging?.cursors?.after) {
      setIsLoadingMore(true);

      // detect if user came from Instagram Auth (first-time)
      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get("code");

      try {
        let moreMedia = [];
        let newPaging = {};

        if (code) {
          // 👉 First-time user: fetch next page from Instagram API
          const result = await fetchInstagramMedia(code, paging.cursors.after, sortOption, currentPage + 2);
          moreMedia = result.media;
          newPaging = result.paging;
        } else {
          // 👉 Returning user: fetch next page from DB
          const result = await getMediaFromDatabase(paging.cursors.after, 20, sortOption, currentPage + 2);
          moreMedia = result.media;
          newPaging = result.paging;
        }

        // update state
        setMedia((prev) => [...prev, ...moreMedia]);
        setPaging(newPaging);
        setCurrentPage((prev) => prev + 1);
        scrollToTop();
      } catch (error) {
        alert(error.message || "Failed to load more media");
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  const handleTabClick = (tab) => setSelectedTab(tab);
 
  const handleSlide = (mediaId, direction, totalSlides) => {
    setCarouselIndexes((prev) => {
      const currentIndex = prev[mediaId] || 0;
      const newIndex =
        direction === "next"
          ? (currentIndex + 1) % totalSlides
          : currentIndex === 0
          ? totalSlides - 1
          : currentIndex - 1;
      return { ...prev, [mediaId]: newIndex };
    });
  };

    // Handle file selection and upload (No SVG to base64 conversion here)
    // const handleFileChange = (e) => {
    //   const files = Array.from(e.target.files);
    //   files.forEach((file) => {
    //     if (file) {
    //       handleFileUpload(file); 
    //     }
    //   });
    // };

    const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const remainingSlots =
      effectiveLimit - (projectsUsed + totalSelected);

    // 🚫 no slots left
    if (remainingSlots <= 0) {
      if (!isProPlan) {
        setShowUpgradeBar(true);
      }
      e.target.value = "";
      return;
    }

    // ✅ upload only allowed number
    const filesToUpload = files.slice(0, remainingSlots);

    filesToUpload.forEach((file) => {
      handleFileUpload(file);
    });

    // 🚨 user selected more than allowed
    if (files.length > remainingSlots) {
      if (!isProPlan) {
      setShowUpgradeBar(true);
    }
    }
    e.target.value = "";
  };


    const handleProjectClick = () => {
    const canGoToAddDetails = totalSelected >= 4;
    
    if (totalSelected >= 4) {
      router.push("/manage-projects/add-details");
    } else {
      alert("Please select at least 4 projects before proceeding.");
    }
   };

    const isDisabled = selectionState.instagramSelected.length + selectionState.uploadedFiles.length < 4;
    
    // chunkArray stays the same
      function chunkArray(array, size) {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
          result.push(array.slice(i, i + size));
        }
        return result;
      }

      // const sortedMedia = getSortedMedia(media);
      const mediaPages = chunkArray(media, PAGE_SIZE);
      const currentMedia = mediaPages[currentPage] || [];

    const shouldShowPagination =
      !loading && (mediaPages.length > 1 || paging?.next);

    const handlePageClick = async (pageNumber) => {
  // If already loaded, just set the current page
  if (mediaPages[pageNumber]) {
    setCurrentPage(pageNumber);
    scrollToTop();
    return;
  }

  // If not loaded, fetch page data
  if (paging?.cursors?.after || pageNumber === 0) {
    setIsLoadingMore(true);
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get("code");

    try {
      // Calculate the "after" cursor for this specific page
      let afterCursor = null;
      let tempPaging = paging;
      let tempMedia = media;

      // Loop from current last loaded page to target page
        for (let i = mediaPages.length; i <= pageNumber; i++) {
        let newMedia, newPaging;

        if (code) {
          // First-time OAuth flow → fetch page from Instagram
          const pageNum = mediaPages.length + 1;
          ({ media: newMedia, paging: newPaging } = await fetchInstagramMedia(
            code,
            afterCursor || tempPaging?.cursors?.after,
            sortOption,
            pageNum
          ));
        } else {
          // Subsequent visits → fetch page from DB
          const pageNum = mediaPages.length + 1;
          const dbResult = await getMediaFromDatabase(
            afterCursor || tempPaging?.cursors?.after,
            PAGE_SIZE,
            sortOption,
            pageNum
          );
          newMedia = dbResult.media;
          newPaging = dbResult.paging;
        }

        tempMedia = [...tempMedia, ...newMedia];
        tempPaging = newPaging;
        afterCursor = newPaging?.cursors?.after;
      }

      setMedia(tempMedia);
      setPaging(tempPaging);
      setCurrentPage(pageNumber);
      scrollToTop();
    } catch (error) {
      console.error("Error fetching page:", error);
      alert(error.message || "Failed to load media");
    } finally {
      setIsLoadingMore(false);
    }
  }
};

   
  const handleBackClick = () => {
    router.push("/profile")  
  }

  const handleHamburgerClick = () => {
      setIsMenuVisible((prev) => !prev); // Toggle menu visibility
    };


  const handleProfileClick = () => {
    router.push("/profile");
  };

  const handleNextClick = () => {
    router.push("/dashboard");
  };

  const handleDashboardClick = () => {
    router.push("/dashboard");
  }

  const handleSettingClick = () => {
   router.push("/settings")
  }

const renderInstagramTab = () => (
  <div className="flex justify-center gap-10 mt-5">

<div className="w-[278px] h-full bg-white text-black p-3 rounded-lg">
  <p className="text-md font-apfel-grotezk-regular">
    Selected projects from Instagram
  </p>
  <p className="text-light-grey font-apfel-grotezk-regular">
    {selectionState?.instagramSelected?.length || "0"} Selected
  </p>

  <div className="mt-[18px] w-auto border-b border-gray-200" />

  <div
    className="grid grid-cols-2 gap-4 mt-7 overflow-y-auto max-h-[40vh]"
    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
  >
    {selectionState?.instagramSelected?.map((project, index) => {
      const isLocked = !isProPlan && index >= 8;

      return (
      <div key={project.mediaId} className="flex flex-col items-center">

        {/* PROJECT CARD */}
        <div className="relative w-[120px] h-[120px] group">

          {/* ✅ MEDIA ONLY — clipped */}
          <div className="w-full h-full rounded-md overflow-hidden relative">

            {/* 🔒 LOCK OVERLAY */}
            {isLocked && (
              <div className="absolute inset-0 z-30 bg-[#212121]/80 backdrop-blur-sm
                flex flex-col items-center justify-center text-center px-3 rounded-md">
                <Image
                  src="/assets/images/pro-yellow.svg"
                  width={16}
                  height={16}
                  alt="Upgrade required"
                />
                <p className="text-white text-[11px] mt-2">
                  Your trial has ended, upgrade to showcase all posts in your press kit.
                </p>
              </div>
            )}

            {/* MEDIA */}
            {project.name === "VIDEO" ? (
              <video
                className="w-full h-full object-cover"
                src={project.mediaLink}
              />
            ) : project.name === "CAROUSEL_ALBUM" && project.children ? (
              <div className="relative w-full h-full">
                {project.children.map((child, idx) => (
                  <div
                    key={child.id}
                    className={`absolute inset-0 transition-transform duration-500 ${
                      (carouselIndexes[project.mediaId] || 0) === idx
                        ? "translate-x-0 opacity-100"
                        : "translate-x-full opacity-0"
                    }`}
                  >
                    {child.media_type === "IMAGE" ? (
                      <Image
                        src={child.media_url}
                        fill
                        className="object-cover"
                        alt=""
                      />
                    ) : (
                      <video
                        src={child.media_url}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Image
                src={project.mediaLink}
                fill
                className="object-cover"
                alt=""
              />
            )}
          </div>

          {/* ✅ PRO BADGE + TOOLTIP — OUTSIDE overflow-hidden */}
          {isProPlan && index >= 8 && (
            <div className="absolute top-2 right-2 z-[9999]">
              <Tooltip body={tooltip.body} placement="bottom">
                <div className="w-7 h-7 rounded-md flex items-center justify-center bg-smoke cursor-pointer">
                  <Image
                    src="/assets/images/pro-grey.svg"
                    width={13}
                    height={13}
                    alt="Pro"
                  />
                </div>
              </Tooltip>
            </div>
          )}

        </div>

        {/* DELETE BUTTON */}
        <button
          onClick={() => removeInstagramSelection(project.mediaId)}
          className="mt-2 p-1 rounded-full transition-colors hover:bg-gray-100"
        >
          <Image
            src="/assets/images/delete.svg"
            alt="delete"
            width={16}
            height={16}
            className="cursor-pointer w-20 h-6"  
          />
        </button>
      </div>
    );

    })}

    <div className="-mb-10" />
  </div>
</div>


    {/* right side rendered projects graph api fetch  */}
    <div ref={containerRef} className="w-[70vw] h-[60vh] 7xl:h-[70vh] text-black rounded-md overflow-y-auto"  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        
      <div className="sticky top-0 z-50 bg-smoke   flex flex-row mb-3 items-start justify-between text-graphite">
        <span className=" font-qimano mt-2">
        <span className="text-electric-blue text-xl">
          {isProPlan && 
           <span className="relative group mr-1.5">
            <Image
              src="/assets/images/pro-grey.svg"
              width={18}
              height={18}
              alt="Pro plan"
              className="inline-block cursor-pointer mb-1"
            />

            {/* Tooltip */}
            <span className="
              absolute left-32 -translate-x-1/2 top-6 
              whitespace-nowrap z-20 
              px-3 py-1 rounded-md
              text-xs text-graphite bg-white
              opacity-0 group-hover:opacity-100 
              transition-opacity duration-200
              pointer-events-none font-apfel-grotezk-regular
            ">
              You are on a Pro plan (12 project slots unlocked)
            </span>
          </span>
          }
          {(selectionState?.instagramSelected?.length || 0) + (selectionState?.uploadedFiles?.length || 0)} / {effectiveLimit} </span>
         Selected <span className="text-[#878787] text-sm">*Minimum 4 required </span> 
        </span>
        {renderInstagramPopup()}
      
      <div className="relative w-64 mt-2 font-apfel-grotezk-regular">

        {/* Label ON the border */}
        <label
          htmlFor="sort_by"
          className="
            absolute left-9 
            -top-2
            text-xs 
            text-[#878787] bg-smoke 
            px-1
            pointer-events-none
          "
        >
          Sort by
        </label>

        {/* Left icon */}
        <TfiAlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none" />

        {/* Select */}
        <select
          id="sort_by"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="
            block w-full appearance-none
            border border-[#878787] bg-smoke rounded-md  text-graphite text-sm
            py-3 pl-9 pr-8
            focus:border-blue-500 focus:ring-0 focus:outline-none
          "
        >
          <option value="date">Date uploaded</option>
          <option value="engagement">Engagement rate</option>
          <option value="likes">Likes</option>
          <option value="comments">Comments</option>
          <option value="views">Views</option>
        </select>

        {/* Right chevron */}
        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      </div>
    {
      (() => {
        const loadingType = isInitialLoading ? "initial" : isSorting ? "sorting" : isLoadingMore ? "pagination" : null;
        return (
          <MediaDisplay
            media={currentMedia}
            displayType="instagram"
            showLoader={showInstagramPopup}
            loading={loading || isLoadingMore}
            loadingType={loadingType}
            plan={plan}
            projectsUsed={projectsUsed}
            projectLimit={effectiveLimit}
            remaining={remaining}
            onLimitExceeded={() => setShowUpgradeBar(true)}
          />
        );
      })()
    }

    </div>


  </div>
);

const renderUploadTab = () => (
  <div className="flex gap-10 mt-5">
    <div className="w-[278px] h-[60vh] bg-white text-black p-3 rounded-lg">
      {/* Header section */}
      <div>
        <p className="text-md font-apfel-grotezk-regular">Selected Files for Upload</p>
        <p className="text-light-grey font-apfel-grotezk-regular">{selectionState?.uploadedFiles?.length || "0"} selected</p>
      </div>

      {/* Border line */}
      <div className="mt-[18px] w-auto border-b border-1 border-gray-200"></div>

      {/* Scrollable area */}
      <div className="mt-5 h-[calc(60vh-120px)] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="grid grid-cols-2 gap-2">
          {selectionState.uploadedFiles.map((file, index) => (
            <div key={index} className="flex flex-col justify-center items-center">
              <div className="w-full h-full  border-light-grey rounded-lg flex justify-center items-center">
                {/* Check if the file is an image */}
                {file.fileUrl?.match(/\.(jpeg|jpg|png|gif|webp|svg)$/i) ? (
                  <Image
                    src={file.fileUrl}
                    alt={file.fileName}
                    width={200}
                    height={50}
                    className="bg-cover h-36"
                  />
                ) : file.fileUrl?.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                  /* Check if the file is a video */
                  <video
                    src={file.fileUrl}
                    controls
                    width={200}
                    height={50}
                    className="object-cover h-36"
                  />
                ) : (
                  <span>Invalid file type</span>
                )}
              </div>

              <button
                onClick={() => removeFile(file.mediaId)}
                className="mt-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Image
                  src="/assets/images/delete.svg"
                  alt="delete"
                  width={16}
                  height={16}
                  className="cursor-pointer w-20 h-6"
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Upload area */}
    <div className="w-[70vw] h-[50vh] 7xl:h-[70vh] text-black rounded-md pt-1 b">
      <div className="flex gap-6 7xl:justify-center">
        <label
          htmlFor="file-upload"
          className="cursor-pointer w-[200px] h-[250px] aspect-[4/5]  bg-gray-200 rounded-md flex justify-center items-center"
        >
          <div className="flex flex-col justify-center items-center">
          <span className="font-qimano text-xl mt-4">Upload your files</span>
          <span className="font-apfel-grotezk-regular text-sm text-gray-500 px-3">Only png, jpg, and .mp4 files <span className="mx-auto ml-10 font-apfel-grotezk-regular">of max limit 5mb</span></span>
          <span className="mt-4 text-dark-grey text-2xl border-[1.6px] border-dashed border-gray-400 rounded-md p-1 m-6">
            <Image
              src="/assets/images/upload-folder.svg"
              alt="Upload Icon"
              width={44}
              height={44}
              className="h-20 w-[200px]"
              loading="eager"
              priority
            />
          </span>
          </div>
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*,video/*,image/svg+xml"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        {/* right side rendered uplaod projects */}
         <MediaDisplay uploadedFiles={selectionState.uploadedFiles}  displayType="uploaded" plan={plan} projectLimit={effectiveLimit}  onLimitExceeded={() => setShowUpgradeBar(true)}
/>
      </div>
    </div>
  </div>
);


const renderInstagramPopup = () => {
    if (showInstagramPopup) {
      return <InstagramPopup isOpen={showInstagramPopup} onClose={() => setShowInstagramPopup(false)} />;
    }
    return null;
  };

return (
    <div className="flex flex-col h-[77vh] max-w-[1800px] 7xl:max-w-[2500px] mx-auto bg-smoke w-full space-x-8 overflow-hidden" >

      <div className="flex w-full border-b border-gray-300 mt-0 items-center ">
      <button
          onClick={() => handleTabClick("instagram")}
          className={`flex-1 py-2 text-md font-medium text-center flex items-center justify-center ${
            selectedTab === "instagram"
              ? "text-electric-blue border-b-2 border-electric-blue"
              : "text-gray-500"
          }`}
        >
        <SvgComponent
        style={{
          color: selectedTab === "instagram" ? "blue" : "",
        }}
      />
      Instagram
        </button>

        <button
          onClick={() => handleTabClick("upload")}
          className={`flex-1 py-2 text-md font-medium text-center flex items-center justify-center ${
            selectedTab === "upload"
              ? "text-electric-blue border-b-2 border-electric-blue"
              : "text-gray-500"
          }`}
        >
        <Uploadsvg
        style={{
          color: selectedTab === "upload" ? "blue" : "", height: "35px",
        }}
      />  
          Upload
        </button>
      </div>

    {/* left side insta and upload projects */}
    {selectedTab === "instagram" ? renderInstagramTab() : renderUploadTab()}

      {showUpgradeBar && (
        <div
           className={`
            fixed bottom-[calc(11%+20px)]
            left-1/2 transform -translate-x-1/2  
            ${shouldShowPagination ? "w-[70%] max-w-[550px] 3xl:max-w-[600px]"
        : " w-[460px] max-w-[550px] 3xl:max-w-[600px]"}
            bg-graphite text-white
            py-3 px-4
            flex items-center justify-around
            z-[999] rounded-t-md
            transition-all duration-300
          `}
        >
          <div className="flex items-center gap-2">
            <Image
              src="/assets/images/pro-yellow.svg"
              alt="pro-icon"
              width={17}
              height={17}
              className="mb-1"
            />
            <span className="font-apfel-grotezk-regular text-[15px] ">
              Get Snatch Pro to select more than 8 projects
            </span>
          </div>

          <Image
            src="/assets/images/projectRightWhiteArrow.svg"
            alt="arrow"
            width={8}
            height={8}
          />
        </div>
    )}
 
    <div  className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg px-4 py-1.5 shadow-xl z-50 h-[11%] font-apfel-grotezk-regular transition-all duration-200"
      style={{
        width: containerWidth ? containerWidth + 40 : "auto", // dynamic!!
      }}>
      <div ref={contentRef} className="flex items-center gap-[9px] w-full h-full">
        
        {/* Logo + Hamburger */}
        <div className="flex items-center justify-center gap-2 relative px-2 py-2">
          <button onClick={handleNextClick} className="w-[105px] h-[56px] text-electric-blue text-2xl font-semibold text-center">
            <Image 
              src="/assets/images/snatch.svg"
              width={40}
              height={40}
              alt="snatchlogo"
              className="mx-auto w-32 h-10"
            />
          </button>

          <button
            onClick={handleHamburgerClick}
            className="w-[60px] h-[56px] bg-gray-100 text-electric-blue rounded-md mx-auto font-medium hover:bg-transparent relative"
          >
            <Image
              className="mx-auto w-8"
              src="/assets/icons/onboarding/Hamburger.svg"
              alt="hamburger"
              width={20}
              height={20}
            />
          </button>

          {/* Dropdown Menu */}
          {isMenuVisible && (
            <div className="absolute top-[-220%] left-[50%] w-[200px] bg-white shadow-lg rounded-md border border-light-grey z-50 font-apfel-grotezk-regular">
              <ul className="flex flex-col p-3 gap-2">
                <li onClick={handleDashboardClick} className="cursor-pointer text-graphite hover:text-electric-blue hover:bg-gray-100 rounded-md p-2">
                  Dashboard
                </li>
                <li onClick={handleSettingClick} className="cursor-pointer text-graphite hover:text-electric-blue hover:bg-gray-100 rounded-md p-2">
                  Settings
                </li>
                <li onClick={handleProfileClick} className="cursor-pointer text-graphite hover:text-electric-blue hover:bg-gray-100 rounded-md p-2">
                  Profile
                </li>
              </ul>
            </div>
          )}

          {shouldShowPagination && (
          <div className=" left-1/2  bottom-20 5xl:bottom-24 ">
            <div className="inline-flex items-center font-apfel-grotezk-regular rounded-lg px-1 py-1 space-x-1">
              {/* rectangle on hover padding, color-> blue-50 no border only fill*/}
              {/* Prev */}
              <button
                onClick={handlePrev}
                disabled={currentPage === 0}
                className={`flex items-center text-graphite justify-center text-lg ${
                  currentPage === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                ←
              </button>

              {/* Page numbers */}
              {(() => {
                const visiblePages = [];
                let startPage = Math.max(0, currentPage - 2);
                let endPage = Math.min(totalPages - 1, startPage + 4);

                // Adjust startPage if not enough pages on the right
                if (endPage - startPage < 4) {
                  startPage = Math.max(0, endPage - 4);
                }

                for (let i = startPage; i <= endPage; i++) {
                  visiblePages.push(
                    <button
                      key={i}
                      onClick={() => handlePageClick(i)}
                      className={`w-6 h-6 rounded-lg flex gap-x-0.5 items-center justify-center transition-colors hover:text-electric-blue   
                        ${
                          currentPage === i
                            ? "text-electric-blue bg-blue-shade-50"
                            : "text-graphite hover:text-electric-blue"
                        }`}
                    >
                      {i + 1}
                    </button>
                  );
                }

                return visiblePages;
              })()}

              {/* Ellipsis & Total Pages */}
              {totalPages > 3 && currentPage < totalPages - 3 && (
                <>
                  <span className="px-1 text-graphite select-none">...</span>
                  <button
                    onClick={() => handlePageClick(totalPages - 1)}
                    className="w-8 h-8 rounded-md flex items-center justify-center font-medium transition-colors text-graphite hover:text-electric-blue"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              {/* Next */}
              <button
                onClick={handleNext}
                disabled={
                  isLoadingMore || (!mediaPages[currentPage + 1] && !paging?.next)
                }
                className={`flex items-center  text-graphite justify-center text-lg ${
                  !mediaPages[currentPage + 1] && !paging?.next
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                →
              </button>
            </div>
          </div>
        )}
        </div>

        {/* Final Action Buttons */}
        <div className=" h-[56px] bg-gray-100 px-2 py-2 rounded-lg flex justify-between items-center gap-[8px]">
        <Button variant="secondary" className="space-x-1" onClick={handleBackClick}>  
          <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="12"
          viewBox="0 0 7 12"
          fill="currentColor"
          className="w-[14px] h-[12px] transition-colors duration-200"
        >
          <path d="M2.43411 5.99755L6.50736 10.0705C6.64569 10.209 6.71653 10.3831 6.71986 10.5928C6.72303 10.8023 6.65219 10.9795 6.50736 11.1245C6.36236 11.2694 6.18669 11.3418 5.98036 11.3418C5.77403 11.3418 5.59836 11.2694 5.45336 11.1245L0.959111 6.6303C0.865611 6.53663 0.79961 6.43788 0.761109 6.33405C0.722609 6.23021 0.70336 6.11805 0.70336 5.99755C0.70336 5.87705 0.72261 5.76488 0.761109 5.66105C0.79961 5.55721 0.865611 5.45846 0.959111 5.3648L5.45336 0.870545C5.59186 0.732212 5.76594 0.661379 5.97561 0.658046C6.18511 0.65488 6.36236 0.725713 6.50736 0.870545C6.65219 1.01555 6.72461 1.19121 6.72461 1.39755C6.72461 1.60388 6.65219 1.77954 6.50736 1.92455L2.43411 5.99755Z" />
        </svg>
        <p>Back</p>
        </Button>

          <Button
            onClick={handleProjectClick}
            disabled={isDisabled}
          >
            <span className="text-md">Add Project Details</span>
              <Image
              src="/assets/images/projectRightWhiteArrow.svg"
              alt="back arrow"
              width={14}
              height={14}
              className="w-[14px] h-[14px]"
            />
          </Button>
          
        </div>

      </div>
    </div>

    </div>
  );
}
